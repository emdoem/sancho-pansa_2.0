# Architecture Overview

Your application needs to solve three core technical challenges:

    Local filesystem access to read, modify, and reorganize music files

    Portable database that can move between devices

    Conflict-free synchronization when the same library is managed from multiple laptops

# Core Technology Stack

## Electron Application Structure:

    Main Process (Node.js): Handles all filesystem operations, database management, and file watching

    Renderer Process (React + TypeScript): UI layer for user interactions

    IPC Communication: Bridges between main and renderer processes

    ​

## Database Layer:

    SQLite as the primary database engine (portable, single-file, no server required)

    Database location: User-configurable cloud storage folder (Dropbox, Google Drive, OneDrive)

​