# Table of Contents

- [Wireframe Descriptions for Key Screens]
  - [Screen 1: Main Dashboard / Library View](#screen-1-main-dashboard--library-view)
    - Purpose and Layout
    - Key Interactions
  - [Screen 2: Initial Folder Selection & Scan](#screen-2-initial-folder-selection--scan)
    - Purpose and Layout
    - During Scan Process
  - [Screen 3: Duplicate Detection Results](#screen-3-duplicate-detection-results)
    - Purpose and Layout
    - Duplicate Groups Display
    - Critical UX Considerations
  - [Screen 4: File Naming Convention Settings](#screen-4-file-naming-convention-settings)
    - Purpose and Layout
    - Pattern Builder
    - Preview Examples
  - [Screen 5: Playlist Management](#screen-5-playlist-management)
    - Purpose and Layout
    - Two-Panel View
    - Import Dialog
  - [Screen 6: Device Synchronization](#screen-6-device-synchronization)
    - Purpose and Layout
    - Sync Dashboard
    - Sync Options
    - Critical Features
- [Complete User Flow Diagram](#complete-user-flow-diagram)
  - Flowchart Description

# Wireframe Descriptions for Key Screens

## Screen 1: Main Dashboard / Library View

### Purpose: Central hub for your entire music collection

### Layout (typical desktop application, ~1440x900px):

    Top bar: App title, search box, sync status indicator, settings icon

    Left sidebar (~250px wide):

        Library Statistics (total tracks, storage used, duplicates found)

        Navigation menu: All Tracks, Artists, Albums, Playlists, Duplicates, Settings

        Device sync status (which devices are synced)

    Main content area:

        Spreadsheet-style track listing with sortable columns:

            Checkbox | Artist | Title | Album | Tempo (BPM) | Length | File Path | Status

        Action buttons above table: "Scan for Duplicates", "Rename Files", "Import Playlist"

        Pagination/infinite scroll at bottom

    Bottom status bar: Total selected items, available actions

### Key interaction: Users can select tracks, sort/filter, and launch key operations

​

## Screen 2: Initial Folder Selection & Scan

### Purpose: First-time setup to catalog music files

### Layout:

    Center-focused dialog (modal over main screen):

        Large heading: "Select Your Music Folders"

        Folder selection area with "Add Folder" button

        List of selected folders with remove (X) icons

        Preview: "X folders selected, estimated Y files"

        Checkbox options:

            "Include subfolders"

            "Watch folders for changes"

            "Read extended metadata (slower but more accurate)"

        Large primary button: "Start Cataloging"

### During scan:

    Progress bar with percentage

    Current file being processed (with path)

    Statistics updating in real-time: files found, metadata read, duplicates detected

    "Pause" and "Cancel" buttons

    ​

## Screen 3: Duplicate Detection Results

### Purpose: Review and manage duplicate files

### Layout (most critical screen for your app):

    Top filter bar:

        Dropdown: "Group by: Artist & Title | Album & Title | All Metadata"

        Checkbox filters: "Exact matches only", "Similar length (±5 sec)"

        Info badge: "X duplicate groups found, Y files can be removed, Z GB can be freed"

    Main area - Duplicate Groups (card-based or accordion layout):

    Each duplicate group shows:

    text
    ```
    ┌─────────────────────────────────────────────────────┐
    │ ● Artist Name - Track Title                         │
    │   Album: [Album Name] | Length: 3:45                │
    │   [2 duplicates found]                      [Expand]│
    └─────────────────────────────────────────────────────┘

    When expanded:
    ┌─────────────────────────────────────────────────────┐
    │ ○ Keep this   File 1                                │
    │   Path: /Music/Artist/Album/01-track.mp3            │
    │   Bitrate: 320kbps | Size: 8.5 MB | Format: MP3     │
    │                                                     │
    │ ● Remove      File 2                       [Preview]│
    │   Path: /Downloads/track.mp3                        │
    │   Bitrate: 192kbps | Size: 5.2 MB | Format: MP3     │
    └─────────────────────────────────────────────────────┘
    ```

    Radio buttons let user choose which to keep

        Auto-selection logic: "Auto-select: Keep highest quality | Keep in organized folder"

    Bottom action bar:

        "Select All Recommended" button

        "Apply Changes" (primary button) - opens confirmation dialog

        "Export List" button

### Critical UX consideration: Users need confidence before deleting files. Preview/play functionality and clear visual comparison help

​

## Screen 4: File Naming Convention Settings

### Purpose: Configure unified naming rules to prevent future duplicates

### Layout:

    Settings panel (could be modal or dedicated screen):

        Preview section at top showing "Before → After" example

    Pattern builder:

text

```
Naming Pattern:
[Dropdown: Track Number] - [Dropdown: Artist] - [Dropdown: Title]

Available tokens:
- Track Number (with leading zeros)
- Artist Name
- Title
- Album
- Year
- BPM

Additional options:
□ Remove special characters
□ Replace spaces with underscores
□ Capitalize words

Folder Structure:
[Artist] / [Album (Year)] / [files]
```

### Preview examples (3-4 sample files):

text

```
Before: artist-song final copy.mp3
After:  01 - Artist Name - Song Title.mp3
```

### Buttons: "Apply to Library" (with warning), "Save as Default"

    ​

## Screen 5: Playlist Management

### Purpose: Import and manage playlists in unified format

### Layout:

    Two-panel view:

        Left panel (~350px): Playlist list

            Search/filter playlists

            List with icons: playlist name, track count, duration

            Buttons: "Import Playlist", "New Playlist"

        Right panel: Selected playlist details

            Playlist name (editable)

            Track listing (drag to reorder)

            Column: Position | Artist - Title | Length

            Bottom toolbar:

                "Export to M3U"

                "Export to Mixxx" (if you want direct integration)

                "Validate Tracks" (check for missing files)

### Import dialog:

    File picker supporting: .m3u, .m3u8, .pls, .xspf

    Options:

        "Convert relative paths to absolute"

        "Update track references to renamed files"

        "Copy missing tracks to library"

        ​

## Screen 6: Device Synchronization

### Purpose: Manage portable database and sync across devices

### Layout:

    Sync dashboard:

        Visual representation of devices (icons for each PC/laptop)

        For each device:

            Device name

            Last sync time

            Status: "In Sync ✓" or "Changes pending"

            Track count comparison

    Sync options:

        Database location: [Path selector] "Store on: Dropbox / Google Drive / External Drive"

        Sync settings:

            "Sync playlists"

            "Sync library state (keep/remove decisions)"

            "Sync metadata edits"

            "Sync naming convention settings"

        Conflict resolution strategy:

            Radio buttons: "Newest wins" | "Manual merge" | "This device is master"

    Manual sync button: "Sync Now" with last sync timestamp

### Critical feature: Clear indication of sync status and conflict warnings before applying changes

​

# Complete User Flow Diagram

Here's how the flows connect (described as a flowchart):

text

```
START → [Select Folders]
          ↓
     [Scan Files] → [Catalog Created]
          ↓
     [Review Library] ←─────────────┐
          ↓                         │
     [Run Duplicate Scan]           │
          ↓                         │
     [Review Duplicates]            │
          ↓                         │
     Decision: Remove?              │
       Yes ↓    No → Skip           │
     [Select Files to Remove]       │
          ↓                         │
     [Confirmation Dialog]          │
          ↓                         │
     [Apply Changes to Filesystem]  │
          ↓                         │
     [Unified Rename] ──────────────┤
          ↓                         │
     [Manage Playlists] ────────────┤
          ↓                         │
     [Sync to Database] ────────────┤
          ↓                         │
     [Use on Other Device] ─────────┘
          ↓
     [Import New Files] → loops back

```
