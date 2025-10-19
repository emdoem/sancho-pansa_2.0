-- Core music catalog
CREATE TABLE tracks (
    id TEXT PRIMARY KEY,              -- UUID for each track
    file_path TEXT NOT NULL,          -- Relative or absolute path
    file_hash TEXT,                   -- SHA-256 for duplicate detection
    artist TEXT,
    title TEXT,
    album TEXT,
    tempo INTEGER,                    -- BPM
    length INTEGER,                   -- in seconds
    file_size INTEGER,
    bitrate INTEGER,
    format TEXT,                      -- mp3, flac, etc.
    last_modified INTEGER,            -- Unix timestamp
    date_added INTEGER,
    is_duplicate BOOLEAN DEFAULT 0,
    duplicate_group_id TEXT,          -- Groups duplicates together
    keep_status TEXT DEFAULT 'keep'   -- 'keep', 'remove', 'review'
);

-- Device-specific path mappings
CREATE TABLE device_paths (
    device_id TEXT,                   -- Unique device identifier
    device_name TEXT,
    track_id TEXT,
    local_path TEXT,                  -- Device-specific absolute path
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
    operation_type TEXT,            -- 'add', 'remove', 'update', 'rename'
    track_id TEXT,
    timestamp INTEGER,
    data TEXT                       -- JSON with operation details
);
