# Architecture Implementation Recommendations

## Table of Contents

- [Handling Synchronization Conflicts](#handling-synchronization-conflicts)
  - [Scenario 1: Same track edited on both devices while offline](#scenario-1-same-track-edited-on-both-devices-while-offline)
  - [Scenario 2: Track deleted on one device, edited on another](#scenario-2-track-deleted-on-one-device-edited-on-another)
  - [Scenario 3: Duplicate detection results differ](#scenario-3-duplicate-detection-results-differ)
- [File Path Portability Solution](#file-path-portability-solution)
- [Handling Cloud Sync Timing Issues](#handling-cloud-sync-timing-issues)
  - [Solutions:](#solutions)
    - [Detect external database modifications:](#detect-external-database-modifications)
    - [Lock mechanism to prevent simultaneous writes:](#lock-mechanism-to-prevent-simultaneous-writes)
    - [User feedback during sync:](#user-feedback-during-sync)
- [Playlist Synchronization](#playlist-synchronization)

# Handling Synchronization Conflicts

## Scenario 1: Same track edited on both devices while offline

typescript
```
class ConflictResolver {
  resolveTrackConflict(localTrack: Track, remoteTrack: Track): Track {
    // Use Last-Write-Wins with timestamp
    if (localTrack.last_modified > remoteTrack.last_modified) {
      return localTrack;
    } else if (remoteTrack.last_modified > localTrack.last_modified) {
      return remoteTrack;
    }
    
    // If timestamps equal, use device ID for deterministic resolution
    if (this.deviceId > remoteTrack.device_id) {
      return localTrack;
    } else {
      return remoteTrack;
    }
  }
}
```

## Scenario 2: Track deleted on one device, edited on another

typescript
```
// Deletion always wins
if (operation.type === 'delete') {
  this.deleteTrack(trackId);
  this.logOperation({
    type: 'delete',
    trackId,
    timestamp: Date.now(),
    reason: 'conflict_resolution_delete_wins'
  });
}
```

## Scenario 3: Duplicate detection results differ

typescript
```
// Keep duplicate decisions in separate table with timestamp
CREATE TABLE duplicate_decisions (
    track_id TEXT,
    decision TEXT,  -- 'keep' or 'remove'
    decided_by_device TEXT,
    decided_at INTEGER,
    PRIMARY KEY (track_id, decided_at)
);

// Most recent decision wins
const latestDecision = db.prepare(`
  SELECT decision FROM duplicate_decisions 
  WHERE track_id = ? 
  ORDER BY decided_at DESC LIMIT 1
`).get(trackId);
```

# File Path Portability Solution

## Challenge: Music files might be in different locations on each device:

    Device A: /Users/alice/Music/DJ Library/

    Device B: /home/bob/music/dj-tracks/

## Solution: Store paths relative to a configured root + device-specific mappings

typescript
```
// Configuration stored per-device
interface DeviceConfig {
  deviceId: string;
  deviceName: string;
  musicRootPath: string;  // Where music files live on THIS device
  dbPath: string;          // Where synced database lives
}

// On Device A
const configA = {
  deviceId: 'device-a-uuid',
  deviceName: 'MacBook Pro',
  musicRootPath: '/Users/alice/Music/DJ Library',
  dbPath: '/Users/alice/Dropbox/MusicLibrary/music-library.db'
};

// On Device B
const configB = {
  deviceId: 'device-b-uuid',
  deviceName: 'Windows Laptop',
  musicRootPath: 'C:\\Users\\Bob\\Music\\DJ',
  dbPath: 'C:\\Users\\Bob\\Dropbox\\MusicLibrary\\music-library.db'
};

// When cataloging, store relative paths
function catalogTrack(absolutePath: string): Track {
  const relativePath = path.relative(config.musicRootPath, absolutePath);
  const fileHash = calculateFileHash(absolutePath);
  
  return {
    id: uuid(),
    file_path: relativePath,  // e.g., "Artist/Album/01-track.mp3"
    file_hash: fileHash,
    // ... other metadata
  };
}

// When accessing files, resolve to absolute path for current device
function getTrackPath(trackId: string): string {
  const track = db.prepare('SELECT file_path FROM tracks WHERE id = ?').get(trackId);
  return path.join(config.musicRootPath, track.file_path);
}
```

# Handling Cloud Sync Timing Issues

Problem: Dropbox/Google Drive sync isn't instant

## Solutions:

### Detect external database modifications:

typescript
```
// Watch for database file changes
fs.watch(dbPath, (eventType, filename) => {
  if (eventType === 'change') {
    // Database was modified externally (by cloud sync)
    this.reloadDatabase();
    this.notifyUI('database-updated');
  }
});
```

### Lock mechanism to prevent simultaneous writes:

typescript
```
class DatabaseLock {
  async acquireLock(): Promise<boolean> {
    try {
      // Try to acquire lock with timeout
      db.prepare('BEGIN IMMEDIATE').run();
      return true;
    } catch (error) {
      // Another process has lock
      return false;
    }
  }
  
  async withLock<T>(fn: () => T): Promise<T> {
    const acquired = await this.acquireLock();
    if (!acquired) {
      await this.waitForLock();
    }
    
    try {
      return fn();
    } finally {
      db.prepare('COMMIT').run();
    }
  }
}
```

### User feedback during sync:

typescript
```
// Show sync status in UI
interface SyncStatus {
  lastSyncTime: number;
  isSyncing: boolean;
  conflicts: number;
  pendingOperations: number;
}

// Notify user if they try to use app while sync in progress
if (isSyncInProgress) {
  showNotification('Database is syncing with cloud. Please wait...');
}
```

# Playlist Synchronization

For M3U playlist export compatibility with Mixxx:

typescript
```
class PlaylistManager {
  // Export playlist to M3U format
  exportToM3U(playlistId: string, outputPath: string) {
    const tracks = this.getPlaylistTracks(playlistId);
    
    const m3uContent = [
      '#EXTM3U',
      ...tracks.map(track => {
        const absolutePath = this.pathResolver.resolvePathForDevice(track.id);
        return [
          `#EXTINF:${track.length},${track.artist} - ${track.title}`,
          absolutePath
        ].join('\n');
      })
    ].join('\n');
    
    fs.writeFileSync(outputPath, m3uContent, 'utf-8');
  }
  
  // Import playlist from various formats
  importPlaylist(filePath: string): Playlist {
    const ext = path.extname(filePath).toLowerCase();
    
    switch (ext) {
      case '.m3u':
      case '.m3u8':
        return this.parseM3U(filePath);
      case '.pls':
        return this.parsePLS(filePath);
      // ... other formats
    }
  }
  
  // When syncing, update paths to match current device
  syncPlaylistPaths(playlistId: string) {
    const tracks = this.getPlaylistTracks(playlistId);
    
    tracks.forEach(track => {
      const localPath = this.pathResolver.resolvePathForDevice(track.id);
      if (!fs.existsSync(localPath)) {
        this.markTrackMissing(track.id);
      }
    });
  }
}
```
