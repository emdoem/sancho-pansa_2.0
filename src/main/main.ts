import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import FirstTimeSetup from './first-time-setup';
import MusicLibraryDB from './database/db';
import { MusicScanner } from './services/musicScanner';
import { LibraryOrganizer } from './services/libraryOrganizer';
import { MetadataWriter } from './services/metadataWriter';
import { SyncManager } from './services/syncManager';

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('Preload path:', preloadPath);

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
  }
}

let syncManager: SyncManager | null = null;

function getSyncManager(config: any): SyncManager {
  if (!syncManager) {
    syncManager = new SyncManager(config.dbPath);
    const window = BrowserWindow.getAllWindows()[0];
    if (window) {
      syncManager.setWindow(window);
    }
  }
  return syncManager;
}

function setupIpcHandlers() {
  const firstTimeSetup = new FirstTimeSetup();

  ipcMain.handle('configure-music-library', async () => {
    try {
      await firstTimeSetup.configure();

      const config = getLibraryConfig();
      if (config) {
        const manager = getSyncManager(config);
        manager.beginWrite();
        try {
          const db = new MusicLibraryDB(path.dirname(config.dbPath));
          db.initializePathResolver(config.musicRootPath);
          const scanner = new MusicScanner(db);
          await scanner.scanLibrary(config.musicRootPath);
          db.close();
        } finally {
          manager.endWrite();
        }
      }

      return {
        success: true,
        message: 'Music library configured successfully',
      };
    } catch (error) {
      console.error('Error configuring music library:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });

  ipcMain.handle('expose-user-data-path', async () => {
    const userDataPath = app.getPath('userData');
    return userDataPath;
  });

  ipcMain.handle(
    'scan-music-library',
    async (_, options: { fullScan?: boolean } = {}) => {
      try {
        const config = getLibraryConfig();
        if (!config) {
          return { success: false, message: 'Library not configured' };
        }

        const manager = getSyncManager(config);
        let result;
        manager.beginWrite();
        try {
          const db = new MusicLibraryDB(path.dirname(config.dbPath));
          db.initializePathResolver(config.musicRootPath);
          const scanner = new MusicScanner(db);

          if (options.fullScan) {
            result = await scanner.scanLibrary(config.musicRootPath, true);
          } else {
            result = await scanner.incrementalScan(config.musicRootPath);
          }

          db.close();
        } finally {
          manager.endWrite();
        }
        return { success: true, result };
      } catch (error) {
        console.error('Error scanning music library:', error);
        return {
          success: false,
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    }
  );

  ipcMain.handle('get-library-stats', async () => {
    try {
      const config = getLibraryConfig();
      if (!config) {
        return { success: false, message: 'Library not configured' };
      }

      const db = new MusicLibraryDB(path.dirname(config.dbPath));
      db.initializePathResolver(config.musicRootPath);
      const tracks = db.getAllTracks();
      const stats = {
        totalTracks: tracks.length,
        artists: new Set(tracks.map((t) => t.artist).filter(Boolean)).size,
        albums: new Set(tracks.map((t) => t.album).filter(Boolean)).size,
        totalSize: tracks.reduce((sum, t) => sum + (t.file_size || 0), 0),
      };

      db.close();
      return { success: true, stats };
    } catch (error) {
      console.error('Error getting library stats:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });

  ipcMain.handle('get-library-config', async () => {
    try {
      const config = getLibraryConfig();
      if (!config) {
        return { configured: false };
      }
      return { configured: true, config };
    } catch (error) {
      console.error('Error getting library config:', error);
      return { configured: false };
    }
  });

  ipcMain.handle('get-all-tracks', async () => {
    try {
      const config = getLibraryConfig();
      if (!config) {
        return {
          success: false,
          message: 'Library not configured',
          tracks: [],
        };
      }

      const db = new MusicLibraryDB(path.dirname(config.dbPath));
      db.initializePathResolver(config.musicRootPath);
      const tracks = db.getAllTracks().map((track) => {
        // Resolve relative path to absolute for display
        const absolutePath = db.resolveTrackPath(track.file_path);
        const devicePath = db.getDevicePath(track.id, db.getDeviceId());

        return {
          id: track.id,
          title: track.title || 'Unknown',
          artist: track.artist || 'Unknown',
          albumArtist:
            track.album_artist_name || track.album_artist || undefined,
          album: track.album_title || track.album || 'Unknown',
          trackNo: track.track_no,
          duration: track.length || 0,
          bpm: track.tempo || undefined,
          fileHash: track.file_hash || '',
          filePath: absolutePath,
          relativePath: track.file_path,
          fileSize: track.file_size || 0,
          bitrate: track.bitrate || undefined,
          devicePath: devicePath,
          lastModified: track.last_modified,
        };
      });
      db.close();

      return { success: true, tracks };
    } catch (error) {
      console.error('Error getting tracks:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        tracks: [],
      };
    }
  });

  ipcMain.handle(
    'update-track',
    async (_, data: { trackId: string; updates: any }) => {
      try {
        const config = getLibraryConfig();
        if (!config) {
          return { success: false, message: 'Library not configured' };
        }

        const manager = getSyncManager(config);
        manager.beginWrite();
        try {
          const db = new MusicLibraryDB(path.dirname(config.dbPath));
          db.initializePathResolver(config.musicRootPath);

          // Resolve track path to absolute for file metadata writing
          const tracks = db.getAllTracks();
          const track = tracks.find((t: any) => t.id === data.trackId);

          if (!track) {
            db.close();
            return { success: false, message: 'Track not found' };
          }

          // Update database
          db.updateTrack(data.trackId, {
            title: data.updates.title,
            artist: data.updates.artist,
            album_artist: data.updates.albumArtist,
            album: data.updates.album,
            tempo: data.updates.bpm,
          });

          // Sync metadata to file
          const metadataWriter = new MetadataWriter();
          const absoluteFilePath = db.resolveTrackPath(track.file_path);
          const metadataSyncSuccess = await metadataWriter.writeMetadata(
            absoluteFilePath,
            {
              title: data.updates.title,
              artist: data.updates.artist,
              albumArtist: data.updates.albumArtist,
              album: data.updates.album,
              trackNo: data.updates.trackNo,
              tempo: data.updates.bpm,
            }
          );

          db.close();

          return {
            success: true,
            message: metadataSyncSuccess
              ? 'Track and file metadata updated successfully'
              : 'Track updated in database (file metadata sync failed or unsupported format)',
          };
        } finally {
          manager.endWrite();
        }
      } catch (error) {
        console.error('Error updating track:', error);
        return {
          success: false,
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    }
  );

  ipcMain.handle(
    'bulk-update-tracks',
    async (_, data: { trackIds: string[]; updates: any }) => {
      try {
        const config = getLibraryConfig();
        if (!config) {
          return { success: false, message: 'Library not configured' };
        }

        const manager = getSyncManager(config);
        let updatedCount = 0;
        let fileSyncCount = 0;

        manager.beginWrite();
        try {
          const db = new MusicLibraryDB(path.dirname(config.dbPath));
          db.initializePathResolver(config.musicRootPath);
          const metadataWriter = new MetadataWriter();

          // Prepare updates object, only including fields with values
          const dbUpdates: any = {};
          const fileMetadata: any = {};

          if (data.updates.artist !== undefined) {
            dbUpdates.artist = data.updates.artist;
            fileMetadata.artist = data.updates.artist;
          }
          if (data.updates.albumArtist !== undefined) {
            dbUpdates.album_artist = data.updates.albumArtist;
            fileMetadata.albumArtist = data.updates.albumArtist;
          }
          if (data.updates.album !== undefined) {
            dbUpdates.album = data.updates.album;
            fileMetadata.album = data.updates.album;
          }

          // Update each track
          const tracks = db.getAllTracks();

          for (const trackId of data.trackIds) {
            try {
              db.updateTrack(trackId, dbUpdates);
              updatedCount++;

              // Sync metadata to file
              const track = tracks.find((t: any) => t.id === trackId);
              if (track && Object.keys(fileMetadata).length > 0) {
                const absoluteFilePath = db.resolveTrackPath(track.file_path);
                const success = await metadataWriter.writeMetadata(
                  absoluteFilePath,
                  fileMetadata
                );
                if (success) fileSyncCount++;
              }
            } catch (error) {
              console.error(`Error updating track ${trackId}:`, error);
            }
          }

          db.close();
        } finally {
          manager.endWrite();
        }

        return {
          success: true,
          message: `Successfully updated ${updatedCount} track${updatedCount !== 1 ? 's' : ''} (${fileSyncCount} file${fileSyncCount !== 1 ? 's' : ''} synced)`,
          updatedCount,
        };
      } catch (error) {
        console.error('Error bulk updating tracks:', error);
        return {
          success: false,
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    }
  );

  ipcMain.handle('detect-duplicates', async () => {
    try {
      const config = getLibraryConfig();
      if (!config) {
        return { success: false, message: 'Library not configured' };
      }

      const db = new MusicLibraryDB(path.dirname(config.dbPath));
      db.initializePathResolver(config.musicRootPath);
      const result = db.detectDuplicates();
      db.close();

      return { success: true, result };
    } catch (error) {
      console.error('Error detecting duplicates:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });

  ipcMain.handle('generate-organize-plan', async () => {
    try {
      const config = getLibraryConfig();
      if (!config) {
        return { success: false, message: 'Library not configured' };
      }

      const db = new MusicLibraryDB(path.dirname(config.dbPath));
      db.initializePathResolver(config.musicRootPath);
      const organizer = new LibraryOrganizer(db);
      const plan = await organizer.generatePlan(config.musicRootPath);
      db.close();

      return { success: true, plan };
    } catch (error) {
      console.error('Error generating organize plan:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });

  ipcMain.handle('execute-organize-plan', async (_, plan) => {
    try {
      const config = getLibraryConfig();
      if (!config) {
        return { success: false, message: 'Library not configured' };
      }

      // Get the window to send progress updates
      const window = BrowserWindow.getAllWindows()[0];

      const manager = getSyncManager(config);
      let result;
      manager.beginWrite();
      try {
        const db = new MusicLibraryDB(path.dirname(config.dbPath));
        db.initializePathResolver(config.musicRootPath);
        const organizer = new LibraryOrganizer(db);

        result = await organizer.executePlan(
          plan,
          config.musicRootPath,
          (progress) => {
            if (window) {
              window.webContents.send('organize-progress', progress);
            }
          }
        );

        db.close();
      } finally {
        manager.endWrite();
      }

      return { success: result.success, errors: result.errors };
    } catch (error) {
      console.error('Error executing organize plan:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });

  ipcMain.handle('sync-metadata', async () => {
    try {
      const config = getLibraryConfig();
      if (!config) {
        return { success: false, message: 'Library not configured' };
      }

      const window = BrowserWindow.getAllWindows()[0];
      const db = new MusicLibraryDB(path.dirname(config.dbPath));
      db.initializePathResolver(config.musicRootPath);
      const metadataWriter = new MetadataWriter();
      const tracks = db.getAllTracks();

      let syncedCount = 0;
      let failedCount = 0;
      const total = tracks.length;

      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];

        if (window) {
          window.webContents.send('sync-metadata-progress', {
            total,
            current: i + 1,
            track: track.title || 'Unknown',
          });
        }

        try {
          const absoluteFilePath = db.resolveTrackPath(track.file_path);
          const success = await metadataWriter.writeMetadata(absoluteFilePath, {
            title: track.title,
            artist: track.artist,
            albumArtist: track.album_artist,
            album: track.album,
            trackNo: track.track_no,
            tempo: track.tempo,
          });

          if (success) {
            syncedCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error(
            `Error syncing metadata for ${track.file_path}:`,
            error
          );
          failedCount++;
        }
      }

      db.close();

      return {
        success: true,
        message: `Metadata sync complete: ${syncedCount} synced, ${failedCount} failed (unsupported format or error)`,
        syncedCount,
        failedCount,
        total,
      };
    } catch (error) {
      console.error('Error syncing metadata:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });

  ipcMain.handle('reset-library', async () => {
    try {
      const userDataPath = app.getPath('userData');
      const configPath = path.join(userDataPath, 'config.json');

      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }

      return {
        success: true,
        message: 'Library configuration reset successfully',
      };
    } catch (error) {
      console.error('Error resetting library:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });

  ipcMain.handle('get-sync-status', async () => {
    try {
      const config = getLibraryConfig();
      if (!config || !syncManager) {
        return { success: false, message: 'Sync manager not initialized' };
      }

      const status = syncManager.getStatus();
      return { success: true, status };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });

  ipcMain.handle('acknowledge-external-changes', async () => {
    try {
      if (syncManager) {
        syncManager.acknowledgeExternalChanges();
      }
      return { success: true };
    } catch (error) {
      console.error('Error acknowledging external changes:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });
}

function getLibraryConfig() {
  try {
    const userDataPath = app.getPath('userData');
    const configPath = path.join(userDataPath, 'config.json');

    if (!fs.existsSync(configPath)) {
      return null;
    }

    const configData = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error reading library config:', error);
    return null;
  }
}

app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
