# Technical Considerations

## Table of Contents

- [Performance optimizations](#performance-optimizations)
  - [Use WAL mode for SQLite (Write-Ahead Logging)](#use-wal-mode-for-sqlite-write-ahead-logging)
  - [Index critical columns](#index-critical-columns)
  - [Batch operations](#batch-operations)
- [Security considerations](#security-considerations)
  - [File access in Electron](#file-access-in-electron)
  - [Disable Node integration in renderer](#disable-node-integration-in-renderer)
  - [Use IPC for all filesystem operations](#use-ipc-for-all-filesystem-operations)

## Performance optimizations:

### Use WAL mode for SQLite (Write-Ahead Logging):

typescript
```
db.pragma('journal_mode = WAL');
```
This allows readers while writing is happening
​
### Index critical columns:

sql
```
CREATE INDEX idx_tracks_artist ON tracks(artist);
CREATE INDEX idx_tracks_file_hash ON tracks(file_hash);
CREATE INDEX idx_tracks_duplicate_group ON tracks(duplicate_group_id);
```

### Batch operations:

typescript
```
// Instead of individual inserts
const insertMany = db.transaction((tracks) => {
  const insert = db.prepare(`
    INSERT INTO tracks (id, file_path, artist, title, ...) 
    VALUES (?, ?, ?, ?, ...)
  `);
  
  for (const track of tracks) {
    insert.run(track.id, track.file_path, track.artist, track.title, ...);
  }
});

insertMany(tracksArray); // Much faster
```

## Security considerations:

### File access in Electron:

typescript
```
// In main process - safe
const { dialog } = require('electron');

// Let user explicitly choose folders
const result = await dialog.showOpenDialog({
  properties: ['openDirectory']
});
```

### Disable Node integration in renderer:

typescript
```
const win = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js')
  }
});
```

### Use IPC for all filesystem operations

Use IPC for all filesystem operations - never expose filesystem directly to renderer

​