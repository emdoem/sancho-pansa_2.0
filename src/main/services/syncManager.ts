import { BrowserWindow } from 'electron';
import fs from 'fs';

export interface SyncStatus {
  lastSyncTime: number;
  isSyncing: boolean;
  hasExternalChanges: boolean;
  pendingOperations: number;
}

/**
 * Manages detection of external database changes (from cloud sync)
 * and notifies the renderer process to reload data.
 */
export class SyncManager {
  private dbPath: string;
  private lastKnownMtime: number = 0;
  private watcher: fs.StatWatcher | null = null;
  private isWriting: boolean = false;
  private window: BrowserWindow | null = null;
  private status: SyncStatus = {
    lastSyncTime: Date.now(),
    isSyncing: false,
    hasExternalChanges: false,
    pendingOperations: 0,
  };

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.initializeWatcher();
  }

  public setWindow(window: BrowserWindow): void {
    this.window = window;
  }

  private initializeWatcher(): void {
    try {
      const stats = fs.statSync(this.dbPath);
      this.lastKnownMtime = stats.mtime.getTime();

      // Use watchFile for persistent watching with polling (better for cloud-synced files)
      fs.watchFile(
        this.dbPath,
        { interval: 2000 }, // Check every 2 seconds
        (curr, prev) => {
          if (curr.mtime.getTime() !== prev.mtime.getTime()) {
            this.handleFileChange(curr.mtime.getTime());
          }
        }
      );

      console.log(`SyncManager: Watching database file at ${this.dbPath}`);
    } catch (error) {
      console.error('SyncManager: Failed to initialize watcher:', error);
    }
  }

  private handleFileChange(newMtime: number): void {
    // Ignore changes triggered by our own writes
    if (this.isWriting) {
      console.log('SyncManager: Ignoring self-triggered change');
      this.lastKnownMtime = newMtime;
      return;
    }

    // Check if this is an external change (mtime newer than what we know)
    if (newMtime > this.lastKnownMtime) {
      console.log('SyncManager: External database change detected');
      this.lastKnownMtime = newMtime;
      this.status.hasExternalChanges = true;
      this.status.lastSyncTime = newMtime;

      this.notifyRenderer('database-externally-changed', {
        timestamp: newMtime,
        message: 'Library was updated on another device. Click to reload.',
      });
    }
  }

  private notifyRenderer(channel: string, data: any): void {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send(channel, data);
    }
  }

  /**
   * Call this before performing any write operations to the database.
   * This prevents self-triggered change detection.
   */
  public beginWrite(): void {
    this.isWriting = true;
    this.status.isSyncing = true;
    this.status.pendingOperations++;
  }

  /**
   * Call this after write operations are complete and the DB is closed.
   */
  public endWrite(): void {
    this.status.pendingOperations = Math.max(
      0,
      this.status.pendingOperations - 1
    );

    if (this.status.pendingOperations === 0) {
      this.isWriting = false;
      this.status.isSyncing = false;

      // Update last known mtime after our write
      try {
        const stats = fs.statSync(this.dbPath);
        this.lastKnownMtime = stats.mtime.getTime();
      } catch (error) {
        console.warn('SyncManager: Failed to update mtime after write:', error);
      }
    }
  }

  /**
   * Acknowledge that external changes have been processed by the renderer.
   */
  public acknowledgeExternalChanges(): void {
    this.status.hasExternalChanges = false;
  }

  public getStatus(): SyncStatus {
    return { ...this.status };
  }

  public dispose(): void {
    if (this.watcher) {
      fs.unwatchFile(this.dbPath);
      this.watcher = null;
    }
  }
}
