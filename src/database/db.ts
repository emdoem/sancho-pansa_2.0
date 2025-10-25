// Main process - database connection
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

class MusicLibraryDB {
  private db: Database.Database;
  private deviceId: string;

  constructor(cloudSyncPath: string) {
    // Database stored in cloud-synced folder
    const dbPath = path.join(cloudSyncPath, 'music-library.db');

    this.db = new Database(dbPath, {
      // Important: Set timeout for when file is locked by cloud sync
      timeout: 5000,
    });

    // Generate or retrieve unique device ID
    this.deviceId = this.getOrCreateDeviceId();

    // Enable WAL mode for better concurrent access
    this.db.pragma('journal_mode = WAL');

    this.initializeTables();
  }

  private getOrCreateDeviceId(): string {
    const stored = this.db
      .prepare('SELECT value FROM sync_metadata WHERE key = ?')
      .get('device_id');

    if (stored) return stored.value;

    const newId = crypto.randomUUID();
    this.db
      .prepare(
        'INSERT INTO sync_metadata (key, value, updated_at) VALUES (?, ?, ?)'
      )
      .run('device_id', newId, Date.now());

    return newId;
  }
}
