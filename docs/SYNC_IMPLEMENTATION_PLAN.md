# Multi-Device Sync Implementation Plan

## Status: Phase 1 & 2 Complete

### What Works Now

- **Relative paths** stored in database (cross-device portable)
- **PathResolver** utility for absolute/relative conversion
- **SyncManager** watches `.db` file for external changes
- **Write tracking** - all DB operations wrapped with beginWrite/endWrite
- **Operation logging** - every edit/delete/move logged for conflict resolution
- **IPC APIs** exposed for sync status and external change notifications

---

## Remaining Work

### Phase 3: Conflict Resolution (Last-Write-Wins)

**Goal**: Handle cases where two devices edit the same track offline.

**Files to modify**:

- `src/main/services/syncManager.ts`:
  - Add `mergeChanges()` method that runs when external DB change detected
  - Read `operation_log` from remote device
  - For each track with conflicts, compare `last_modified` timestamps
  - If remote is newer, keep remote version
  - If local is newer, keep local version
  - If timestamps equal, use deterministic tie-breaker (device ID)
  - Delete wins: if operation_log shows DELETE, delete the track regardless

- `src/main/database/db.ts`:
  - Add `getConflictedTracks(since: number)` method
  - Add `mergeTrack(remoteTrack: Track)` method
  - Add `resolveConflict(trackId: string, winner: 'local' | 'remote')` method

**Logic**:

```typescript
// When external change detected:
1. Pause the watcher
2. Reopen DB connection (to get fresh data)
3. Get all tracks modified since last sync
4. For each track, check if local last_modified differs from remote
5. If conflict:
   - Compare last_modified timestamps
   - If tie, compare device_id strings lexicographically
   - Winner's version becomes the canonical version
   - Log the resolution in operation_log
6. Resume the watcher
7. Notify renderer: 'conflicts-resolved' with summary
```

### Phase 4: Device Path Registration & Missing Files

**Goal**: Track which files exist on which device. Mark missing files.

**Files to modify**:

- `src/main/services/musicScanner.ts`:
  - After scanning, for each track found:
    - Call `db.registerDevicePath(track.id, deviceId, absolutePath)`
  - After scanning, for each track NOT found:
    - Check if it exists in device_paths for this device
    - If it existed before but is now missing, mark as missing
    - Call `db.markTrackMissing(track.id, deviceId)`

- `src/main/database/db.ts`:
  - Add `markTrackMissing(trackId: string, deviceId: string)` method
  - Add `getMissingTracks(deviceId: string)` method
  - Update `getAllTracks()` to include `is_missing` flag per device
  - Add schema migration for `is_missing` column in device_paths

- `src/main/main.ts`:
  - Update `get-all-tracks` handler to include `isMissing` flag per track
  - Update track display to show missing files differently (grayed out, badge, etc.)

**UI requirement**: In track list, show missing files with a "Missing" badge or dimmed styling.

### Phase 5: UI Sync Status & Auto-Reload

**Goal**: Show user when sync is happening and when external changes are available.

**Files to modify**:

- `src/renderer/stores/musicLibraryStore.ts`:
  - Add state: `syncStatus: SyncStatus | null`, `hasExternalChanges: boolean`
  - Add method: `loadSyncStatus()` that polls `window.electronAPI.getSyncStatus()` every 5 seconds
  - Add listener: `window.electronAPI.onDatabaseExternallyChanged()` → set `hasExternalChanges = true`
  - Add method: `reloadLibrary()` that calls `loadTracks()` then acknowledges changes
  - On app initialization, start polling sync status

- `src/renderer/components` (new or existing):
  - Add sync status indicator to header/app bar:
    - Syncing: spinner + "Syncing..."
    - Synced: checkmark + "Synced [relative time]"
    - External changes: warning + "Update available - click to reload"
  - When user clicks "reload", call `musicLibraryStore.reloadLibrary()`
  - Show toast notification when external changes detected (auto-hide after 5s)

**UI Components needed**:

```typescript
// SyncStatusBar component
interface Props {
  status: SyncStatus;
  hasExternalChanges: boolean;
  onReload: () => void;
}

// States:
// - Green: "Synced 2 min ago"
// - Blue: "Syncing..." (spinner)
// - Orange: "Update available" + Reload button
```

### Phase 6: Cross-Platform Path Handling

**Goal**: Ensure paths work on Windows today and Linux tomorrow.

**Files to modify**:

- Already mostly done in `PathResolver`:
  - `normalizeSeparators()` stores forward slashes in DB
  - `toPlatformSeparators()` converts back for file system access

- `src/main/first-time-setup.ts`:
  - Verify that `musicRootPath` uses platform-appropriate separators
  - Normalize path before storing in config

- Testing needed on:
  - Windows with spaces in paths
  - Windows with Unicode characters
  - Linux paths (when tested)
  - Network drives / UNC paths on Windows

---

## Testing Checklist

### Phase 1-2 (Ready to test now)

- [ ] Fresh install: configure library, verify relative paths stored in DB
- [ ] Run scan, verify paths in DB are relative (e.g., "Artist/Album/track.mp3")
- [ ] Close app, reopen, verify tracks load with correct absolute paths
- [ ] Edit track metadata, verify last_modified updated
- [ ] Check operation_log has entries for edits
- [ ] Simulate external change: touch the .db file while app is running
- [ ] Verify "database-externally-changed" event fires in renderer

### Phase 3 (After implementation)

- [ ] Device A: edit track title
- [ ] Device B: edit same track's artist (without syncing first)
- [ ] Let Dropbox sync both ways
- [ ] Verify last-write-wins: whichever edit was last should be preserved
- [ ] Verify operation_log shows both edits and the resolution

### Phase 4 (After implementation)

- [ ] Device A has file, Device B does not
- [ ] Sync DB to Device B
- [ ] Verify file shows as "Missing" on Device B
- [ ] Copy file to Device B, rescan
- [ ] Verify file no longer marked missing

### Phase 5 (After implementation)

- [ ] External change detected → UI shows "Update available"
- [ ] Click reload → tracks refresh
- [ ] Status bar shows correct sync state

---

## Next Session Priority

1. **Phase 3**: Conflict resolution in SyncManager
   - Implement `mergeChanges()`
   - Add conflict detection logic
   - Test with two simulated devices

2. **Phase 4**: Missing file handling
   - Update scanner to register device paths
   - Add missing file detection
   - Update UI to show missing badges

3. **Phase 5**: UI polish
   - Build SyncStatusBar component
   - Wire up auto-reload on external changes
   - Add toast notifications

---

## Architecture Reminders

**Database location**: Cloud-synced folder (Dropbox, etc.)
**Path strategy**: Relative paths in DB, resolved at runtime per-device
**Conflict rule**: Last-write-wins, deletion wins over edits
**Sync detection**: `fs.watchFile` on `.db` with 2-second polling
**Write isolation**: `beginWrite()`/`endWrite()` prevents self-detection

**Key files modified so far**:

- `src/main/services/pathResolver.ts` (NEW)
- `src/main/services/syncManager.ts` (NEW)
- `src/main/database/db.ts` (MODIFIED - relative paths, migration, logging)
- `src/main/services/musicScanner.ts` (MODIFIED - relative path comparison)
- `src/main/services/libraryOrganizer.ts` (MODIFIED - path resolution)
- `src/main/main.ts` (MODIFIED - syncManager integration, path resolver init)
- `src/main/preload.ts` (MODIFIED - sync APIs exposed)
