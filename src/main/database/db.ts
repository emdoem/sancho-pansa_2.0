import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';

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
      // Ensure track_no and album_artist columns exist (migration for existing DBs)
      try {
        this.db.prepare('ALTER TABLE tracks ADD COLUMN track_no INTEGER').run();
      } catch (e) {
        // Column likely already exists
      }
      try {
        this.db
          .prepare('ALTER TABLE tracks ADD COLUMN album_artist TEXT')
          .run();
      } catch (e) {
        // Column likely already exists
      }
      try {
        this.db.prepare('ALTER TABLE tracks ADD COLUMN album_id TEXT').run();
      } catch (e) {
        // Column likely already exists
      }

      this.db.exec(`
        CREATE TABLE IF NOT EXISTS artists (
            id TEXT PRIMARY KEY,
            name TEXT UNIQUE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS albums (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            artist_id TEXT,
            FOREIGN KEY (artist_id) REFERENCES artists(id),
            UNIQUE(title, artist_id)
        );
      `);
      return;
    }

    this.db.exec(`
      -- Core music catalog
      CREATE TABLE tracks (
          id TEXT PRIMARY KEY,
          file_path TEXT NOT NULL,
          file_hash TEXT,
          artist TEXT,
          album_artist TEXT,
          title TEXT,
          album TEXT,
          track_no INTEGER,
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

      -- Normalized Catalog
      CREATE TABLE artists (
          id TEXT PRIMARY KEY,
          name TEXT UNIQUE NOT NULL
      );

      CREATE TABLE albums (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          artist_id TEXT,
          FOREIGN KEY (artist_id) REFERENCES artists(id),
          UNIQUE(title, artist_id)
      );

      -- Update tracks table to link to album
      ALTER TABLE tracks ADD COLUMN album_id TEXT;

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
    album_artist?: string;
    album_id?: string;
    title?: string;
    album?: string;
    track_no?: number;
    tempo?: number;
    length?: number;
    file_size?: number;
    bitrate?: number;
    format?: string;
    last_modified?: number;
  }): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO tracks (
        id, file_path, file_hash, artist, album_artist, album_id, title, album, track_no, tempo, length,
        file_size, bitrate, format, last_modified, date_added
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      trackData.id || crypto.randomUUID(),
      trackData.file_path,
      trackData.file_hash || null,
      trackData.artist || null,
      trackData.album_artist || null,
      trackData.album_id || null,
      trackData.title || null,
      trackData.album || null,
      trackData.track_no || null,
      trackData.tempo || null,
      trackData.length || null,
      trackData.file_size || null,
      trackData.bitrate || null,
      trackData.format || null,
      trackData.last_modified || null,
      Date.now()
    );
  }

  public updateTrack(
    trackId: string,
    updates: {
      title?: string;
      artist?: string;
      album_artist?: string;
      album?: string;
      tempo?: number | null;
    }
  ): void {
    // 1. Get current track data to handle partial updates for normalization
    const current = this.db
      .prepare('SELECT * FROM tracks WHERE id = ?')
      .get(trackId) as any;

    if (!current) return;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.artist !== undefined) {
      fields.push('artist = ?');
      values.push(updates.artist);
    }
    if (updates.album_artist !== undefined) {
      fields.push('album_artist = ?');
      values.push(updates.album_artist);
    }
    if (updates.album !== undefined) {
      fields.push('album = ?');
      values.push(updates.album);
    }
    if (updates.tempo !== undefined) {
      fields.push('tempo = ?');
      values.push(updates.tempo);
    }

    // 2. Handle normalization update if artist or album changed
    const artistChanged =
      updates.artist !== undefined || updates.album_artist !== undefined;
    const albumChanged = updates.album !== undefined;

    if (artistChanged || albumChanged) {
      const newArtist = updates.artist ?? current.artist;
      const newAlbumArtist = updates.album_artist ?? current.album_artist;
      const newAlbum = updates.album ?? current.album;

      const mainArtist = newAlbumArtist || newArtist || 'Unknown';
      const artistId = this.getOrCreateArtist(mainArtist);
      const albumId = this.getOrCreateAlbum(newAlbum || 'Unknown', artistId);

      fields.push('album_id = ?');
      values.push(albumId);
    }

    if (fields.length === 0) return;

    values.push(trackId);
    const query = `UPDATE tracks SET ${fields.join(', ')} WHERE id = ?`;
    this.db.prepare(query).run(...values);

    // 3. Cleanup orphaned albums/artists
    this.cleanupOrphans();
  }

  private cleanupOrphans(): void {
    // Delete albums with no tracks
    this.db
      .prepare(
        'DELETE FROM albums WHERE id NOT IN (SELECT DISTINCT album_id FROM tracks WHERE album_id IS NOT NULL)'
      )
      .run();
    // Delete artists with no albums
    this.db
      .prepare(
        'DELETE FROM artists WHERE id NOT IN (SELECT DISTINCT artist_id FROM albums)'
      )
      .run();
  }

  public getTrackByPath(filePath: string): any {
    return this.db
      .prepare('SELECT * FROM tracks WHERE file_path = ?')
      .get(filePath);
  }

  public getAllTracks(): any[] {
    return this.db
      .prepare(
        `
        SELECT 
          t.*, 
          a.title as album_title, 
          art.name as album_artist_name
        FROM tracks t
        LEFT JOIN albums a ON t.album_id = a.id
        LEFT JOIN artists art ON a.artist_id = art.id
        ORDER BY t.artist, t.album, t.title
      `
      )
      .all();
  }

  public detectDuplicates(): {
    totalTracks: number;
    uniqueTracks: number;
    duplicates: Array<{
      title: string;
      artist: string;
      album: string;
      count: number;
      trackIds: string[];
    }>;
  } {
    const totalTracks = this.db
      .prepare('SELECT COUNT(*) as count FROM tracks')
      .get() as { count: number };

    const duplicates = this.db
      .prepare(
        `
        SELECT
          title,
          COALESCE(album_artist, artist) as artist,
          album,
          COUNT(*) as count,
          GROUP_CONCAT(id, ',') as track_ids
        FROM tracks
        WHERE title IS NOT NULL OR artist IS NOT NULL OR album IS NOT NULL
        GROUP BY LOWER(title), LOWER(COALESCE(album_artist, artist)), LOWER(album)
        HAVING count > 1
        ORDER BY count DESC
      `
      )
      .all() as Array<{
      title: string | null;
      artist: string | null;
      album: string | null;
      count: number;
      track_ids: string;
    }>;

    const uniqueTracks =
      totalTracks.count - duplicates.reduce((sum, d) => sum + d.count - 1, 0);

    return {
      totalTracks: totalTracks.count,
      uniqueTracks,
      duplicates: duplicates.map((d) => ({
        title: d.title || '',
        artist: d.artist || '',
        album: d.album || '',
        count: d.count,
        trackIds: d.track_ids.split(','),
      })),
    };
  }

  public getOrCreateArtist(name: string): string {
    const existing = this.db
      .prepare('SELECT id FROM artists WHERE name = ?')
      .get(name) as { id: string } | undefined;
    if (existing) return existing.id;
    const id = crypto.randomUUID();
    this.db
      .prepare('INSERT INTO artists (id, name) VALUES (?, ?)')
      .run(id, name);
    return id;
  }

  public getOrCreateAlbum(title: string, artistId: string): string {
    const existing = this.db
      .prepare('SELECT id FROM albums WHERE title = ? AND artist_id = ?')
      .get(title, artistId) as { id: string } | undefined;
    if (existing) return existing.id;
    const id = crypto.randomUUID();
    this.db
      .prepare('INSERT INTO albums (id, title, artist_id) VALUES (?, ?, ?)')
      .run(id, title, artistId);
    return id;
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
