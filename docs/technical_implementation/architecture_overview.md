# Table of Contents

- [Architecture Overview](#architecture-overview)
- [Core Technology Stack](#core-technology-stack)
  - [Electron Application Structure](#electron-application-structure)
  - [Database Layer](#database-layer)
- [Implementation architecture](#implementation-architecture)
- [Summary: Key Architecture Decisions](#summary-key-architecture-decisions)

# Architecture Overview

Your application needs to solve three core technical challenges:

    - Local filesystem access to read, modify, and reorganize music files

    - Portable database that can move between devices

    - Conflict-free synchronization when the same library is managed from multiple laptops

# Core Technology Stack

## Electron Application Structure:

    - Main Process (Node.js): Handles all filesystem operations, database management, and file watching

    - Renderer Process (React + TypeScript): UI layer for user interactions

    - IPC Communication: Bridges between main and renderer processes

    ​

## Database Layer:

    - SQLite as the primary database engine (portable, single-file, no server required)

    - Database location: User-configurable cloud storage folder (Dropbox, Google Drive, OneDrive)

# Implementation architecture

​┌───────────────────────────────────────────────────────┐  
│ Device A (Laptop 1)                                   │  
├───────────────────────────────────────────────────────┤  
│ ┌───────────────────────────────────────────────────┐ │  
│ │ Electron Main Process                             │ │  
│ │ ┌───────────────────────────────────────────────┐ │ │  
│ │ │ Filesystem Watcher                            │ │ │  
│ │ │ - Monitor music folder changes                │ │ │  
│ │ │ - Detect new/moved/deleted files              │ │ │  
│ │ └───────────────────────────────────────────────┘ │ │  
│ │ ┌───────────────────────────────────────────────┐ │ │  
│ │ │ Music File Operations                         │ │ │  
│ │ │ - Read metadata (ID3 tags)                    │ │ │  
│ │ │ - Calculate file hashes                       │ │ │  
│ │ │ - Rename/move/delete files                    │ │ │  
│ │ │ - Create new folder structure                 │ │ │  
│ │ └───────────────────────────────────────────────┘ │ │  
│ │ ┌───────────────────────────────────────────────┐ │ │  
│ │ │ Database Manager                              │ │ │  
│ │ │ - SQLite connection                           │ │ │  
│ │ │ - Transaction management                      │ │ │  
│ │ │ - Conflict detection                          │ │ │  
│ │ └───────────────────────────────────────────────┘ │ │  
│ │ ┌───────────────────────────────────────────────┐ │ │  
│ │ │ Path Resolver                                 │ │ │  
│ │ │ - Relative/absolute path conversion           │ │ │  
│ │ │ - Device-specific mappings                    │ │ │  
│ │ └───────────────────────────────────────────────┘ │ │  
│ └───────────────────────────────────────────────────┘ │  
│                      ↕ IPC                            │  
│ ┌───────────────────────────────────────────────────┐ │  
│ │ Renderer Process (React + TypeScript)             │ │  
│ │ - UI Components                                   │ │  
│ │ - State Management (Zustand/Redux)                │ │  
│ │ - User interactions                               │ │  
│ └───────────────────────────────────────────────────┘ │  
│                      ↓                                │  
│ /Users/you/Dropbox/MusicLibrary/                      │  
│ └── music-library.db ← SQLite Database                │  
└───────────────────────────────────────────────────────┘  
↓  
☁️ Cloud Sync (Dropbox)  
↓  
┌───────────────────────────────────────────────────────┐  
│ Device B (Laptop 2)                                   │  
│ (Same architecture as Device A)                       │  
│                                                       │  
│ /Users/other/Dropbox/MusicLibrary/                    │  
│ └── music-library.db ← Same Database                  │  
└───────────────────────────────────────────────────────┘  

# Summary: Key Architecture Decisions

| Aspect              | Decision                         | Rationale                                          |
| ------------------- | -------------------------------- | -------------------------------------------------- |
| Database            | SQLite in cloud-synced folder    | Portable, single file, no server                   |​​
| Cloud Sync          | Dropbox/Google Drive             | Users already have it, no custom server            |​
| Conflict Resolution | Last-Write-Wins with timestamps  | Simple, predictable, good enough for music library |​
| Path Strategy       | Relative paths + device mappings | Handles different file locations per device        |​
| Sync Detection      | File watcher on database file    | Detects external changes from cloud sync           |​
| File Operations     | Main process only                | Security and filesystem access                     |
​

This architecture gives you:

    ✅ Portability (single database file in cloud storage)

    ✅ Multi-device sync (automatic via Dropbox/Google Drive)

    ✅ Offline capability (SQLite works offline, syncs when online)

    ✅ Conflict handling (timestamps + operation log)

    ✅ Different file paths per device (device-specific mappings)

    ✅ Integration with Mixxx (M3U playlist export)

# Combinating main process & renderer

In development, both Electron (main) and Vite (renderer) run concurrently:

    Vite runs a dev server on a port (e.g., http://localhost:3000)

    Electron main process launches the app loading the URL served by Vite:

typescript
```
mainWindow.loadURL('http://localhost:3000');
```

In production, you build the React app (Vite outputs static files) and your Electron main process loads those files locally:

typescript
```
mainWindow.loadFile(path.join(\_\_dirname, '../renderer/index.html'));
```

    ​
