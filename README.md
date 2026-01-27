# Sancho-Pansa 2.0

A DJ's assistant app for managing your music files & playlists.

## Development

### Quick Start

```bash
# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev
```

### Available Scripts

| Command              | Purpose                                                |
| -------------------- | ------------------------------------------------------ |
| `npm run dev`        | 🚀 **Run app in development** (starts Vite + Electron) |
| `npm run build`      | 🔨 **Build for production** (renderer + main process)  |
| `npm run start`      | 🏃 **Run Electron only** (requires built main process) |
| `npm run start:prod` | 🎯 **Build and run production app**                    |
| `npm run lint`       | ✅ Check code style                                    |
| `npm run lint:fix`   | 🔧 Fix code style automatically                        |
| `npm run format`     | 🎨 Format code with Prettier                           |

### Development Workflow

1. **For development**: `npm run dev` - starts Vite dev server + Electron
2. **For production build**: `npm run build` - creates optimized build in `dist/`
3. **To run production**: `npm run start:prod` - builds and runs

### Project Structure

```
src/
├── main/           # Electron main process (Node.js)
│   ├── database/    # SQLite database logic
│   ├── services/    # Music scanning services
│   ├── main.ts      # Main entry point
│   └── preload.ts   # Preload script
└── renderer/       # React frontend (Browser)
    ├── components/  # React components
    ├── utils/       # Frontend utilities
    └── App.tsx      # React app entry
```

### Music Scanner

The app includes a comprehensive music library scanner that:

- Scans folders for audio files (MP3, FLAC, WAV, M4A, AAC, OGG, WMA)
- Extracts metadata (artist, title, album, BPM, duration)
- Supports full and incremental scans
- Detects duplicates using file hashing
- Stores everything in SQLite database
