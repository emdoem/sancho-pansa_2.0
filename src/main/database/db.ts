import Database from 'better-sqlite3';
import path from 'path';

class MusicLibraryDB {
  private db: Database.Database;
  private deviceId: string;

  constructor(cloudSyncPath: string, deviceId?: string) {
    // Database stored in cloud-synced folder
    const dbPath = path.join(cloudSyncPath, 'music-library.db');

    this.db = new Database(dbPath, {
      // Important: Set timeout for when file is locked by cloud sync
      timeout: 5000,
    });

    this.db.pragma('journal_mode = WAL');
    this.initializeTables();
    this.deviceId = deviceId
      ? this.setDeviceId(deviceId)
      : this.getOrCreateDeviceId();
  }

  private initializeTables(): void {
    // Check if tables already exist by trying to query sync_metadata
    const tableExists = this.db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='sync_metadata'"
      )
      .get();

    if (tableExists) {
      return;
    }

    this.db.exec(`
      -- Core music catalog
      CREATE TABLE tracks (
          id TEXT PRIMARY KEY,
          file_path TEXT NOT NULL,
          file_hash TEXT,
          artist TEXT,
          title TEXT,
          album TEXT,
          tempo INTEGER,
          length INTEGER,
          file_size INTEGER,
          bitrate INTEGER,
          format TEXT,
          last_modified INTEGER,
          date_added INTEGER,
          is_duplicate BOOLEAN DEFAULT 0,
          duplicate_group_id TEXT,
          keep_status TEXT DEFAULT 'keep'
      );

      -- Device-specific path mappings
      CREATE TABLE device_paths (
          device_id TEXT,
          device_name TEXT,
          track_id TEXT,
          local_path TEXT,
          last_synced INTEGER,
          FOREIGN KEY (track_id) REFERENCES tracks(id)
      );

      -- Playlists
      CREATE TABLE playlists (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          created_at INTEGER,
          modified_at INTEGER,
          track_count INTEGER
      );

      -- Playlist tracks (many-to-many)
      CREATE TABLE playlist_tracks (
          playlist_id TEXT,
          track_id TEXT,
          position INTEGER,
          FOREIGN KEY (playlist_id) REFERENCES playlists(id),
          FOREIGN KEY (track_id) REFERENCES tracks(id)
      );

      -- Sync state tracking
      CREATE TABLE sync_metadata (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at INTEGER
      );

      -- Operation log for sync conflict resolution
      CREATE TABLE operation_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          device_id TEXT,
          operation_type TEXT,
          track_id TEXT,
          timestamp INTEGER,
          data TEXT
      );
    `);
  }

  private getOrCreateDeviceId(): string {
    const stored = this.db
      .prepare('SELECT value FROM sync_metadata WHERE key = ?')
      .get('device_id');

    if (stored) return (stored as { value: string }).value;

    const newId = crypto.randomUUID();
    this.db
      .prepare(
        'INSERT INTO sync_metadata (key, value, updated_at) VALUES (?, ?, ?)'
      )
      .run('device_id', newId, Date.now());

    return newId;
  }

  private setDeviceId(deviceId: string): string {
    // Set the device ID if provided (for new library creation)
    this.db
      .prepare(
        'INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) VALUES (?, ?, ?)'
      )
      .run('device_id', deviceId, Date.now());

    return deviceId;
  }

  public getDeviceId(): string {
    return this.deviceId;
  }

  public setMetadata(key: string, value: string): void {
    this.db
      .prepare(
        'INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) VALUES (?, ?, ?)'
      )
      .run(key, value, Date.now());
  }

  public getMetadata(key: string): string | null {
    const result = this.db
      .prepare('SELECT value FROM sync_metadata WHERE key = ?')
      .get(key) as { value: string } | undefined;

    return result ? result.value : null;
  }

  public insertTrack(trackData: {
    id?: string;
    file_path: string;
    file_hash?: string;
    artist?: string;
    title?: string;
    album?: string;
    tempo?: number;
    length?: number;
    file_size?: number;
    bitrate?: number;
    format?: string;
    last_modified?: number;
  }): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO tracks (
        id, file_path, file_hash, artist, title, album, tempo, length,
        file_size, bitrate, format, last_modified, date_added
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      trackData.id || crypto.randomUUID(),
      trackData.file_path,
      trackData.file_hash || null,
      trackData.artist || null,
      trackData.title || null,
      trackData.album || null,
      trackData.tempo || null,
      trackData.length || null,
      trackData.file_size || null,
      trackData.bitrate || null,
      trackData.format || null,
      trackData.last_modified || null,
      Date.now()
    );
  }

  public getTrackByPath(filePath: string): any {
    return this.db
      .prepare('SELECT * FROM tracks WHERE file_path = ?')
      .get(filePath);
  }

  public getAllTracks(): any[] {
    return this.db
      .prepare('SELECT * FROM tracks ORDER BY artist, album, track_number')
      .all();
  }

  public deleteTrack(trackId: string): void {
    this.db.prepare('DELETE FROM tracks WHERE id = ?').run(trackId);
    this.db.prepare('DELETE FROM device_paths WHERE track_id = ?').run(trackId);
    this.db
      .prepare('DELETE FROM playlist_tracks WHERE track_id = ?')
      .run(trackId);
  }

  public close(): void {
    // Checkpoint WAL to ensure all changes are written to the main database file
    // This is important for cloud sync scenarios where we want the main .db file
    // to contain all the latest data
    try {
      this.db.pragma('wal_checkpoint(FULL)');
    } catch (error) {
      // If checkpoint fails (e.g., in non-WAL mode), it's okay, just close
      console.warn('Database checkpoint failed:', error);
    }
    this.db.close();
  }
}

export default MusicLibraryDB;
