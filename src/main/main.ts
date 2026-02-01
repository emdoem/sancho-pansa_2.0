import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import FirstTimeSetup from './first-time-setup';
import MusicLibraryDB from './database/db';
import { MusicScanner } from './services/musicScanner';

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('Preload path:', preloadPath);

  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
  }
}

function setupIpcHandlers() {
  const firstTimeSetup = new FirstTimeSetup();

  ipcMain.handle('configure-music-library', async () => {
    try {
      await firstTimeSetup.configure();

      const config = getLibraryConfig();
      if (config) {
        const db = new MusicLibraryDB(path.dirname(config.dbPath));
        const scanner = new MusicScanner(db);
        await scanner.scanLibrary(config.musicRootPath);
        db.close();
      }

      return {
        success: true,
        message: 'Music library configured successfully',
      };
    } catch (error) {
      console.error('Error configuring music library:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });

  ipcMain.handle('expose-user-data-path', async () => {
    const userDataPath = app.getPath('userData');
    return userDataPath;
  });

  ipcMain.handle(
    'scan-music-library',
    async (_, options: { fullScan?: boolean } = {}) => {
      try {
        const config = getLibraryConfig();
        if (!config) {
          return { success: false, message: 'Library not configured' };
        }

        const db = new MusicLibraryDB(path.dirname(config.dbPath));
        const scanner = new MusicScanner(db);

        let result;
        if (options.fullScan) {
          result = await scanner.scanLibrary(config.musicRootPath);
        } else {
          result = await scanner.incrementalScan(config.musicRootPath);
        }

        db.close();
        return { success: true, result };
      } catch (error) {
        console.error('Error scanning music library:', error);
        return {
          success: false,
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    }
  );

  ipcMain.handle('get-library-stats', async () => {
    try {
      const config = getLibraryConfig();
      if (!config) {
        return { success: false, message: 'Library not configured' };
      }

      const db = new MusicLibraryDB(path.dirname(config.dbPath));
      const tracks = db.getAllTracks();
      const stats = {
        totalTracks: tracks.length,
        artists: new Set(tracks.map((t) => t.artist).filter(Boolean)).size,
        albums: new Set(tracks.map((t) => t.album).filter(Boolean)).size,
        totalSize: tracks.reduce((sum, t) => sum + (t.file_size || 0), 0),
      };

      db.close();
      return { success: true, stats };
    } catch (error) {
      console.error('Error getting library stats:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });

  ipcMain.handle('get-library-config', async () => {
    try {
      const config = getLibraryConfig();
      if (!config) {
        return { configured: false };
      }
      return { configured: true, config };
    } catch (error) {
      console.error('Error getting library config:', error);
      return { configured: false };
    }
  });

  ipcMain.handle('get-all-tracks', async () => {
    try {
      const config = getLibraryConfig();
      if (!config) {
        return {
          success: false,
          message: 'Library not configured',
          tracks: [],
        };
      }

      const db = new MusicLibraryDB(path.dirname(config.dbPath));
      const tracks = db.getAllTracks().map((track) => ({
        id: track.id,
        title: track.title || 'Unknown',
        artist: track.artist || 'Unknown',
        album: track.album || 'Unknown',
        duration: track.length || 0,
        bpm: track.tempo || undefined,
        fileHash: track.file_hash || '',
        filePath: track.file_path,
        fileSize: track.file_size || 0,
        bitrate: track.bitrate || undefined,
      }));
      db.close();

      return { success: true, tracks };
    } catch (error) {
      console.error('Error getting tracks:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        tracks: [],
      };
    }
  });

  ipcMain.handle(
    'update-track',
    async (_, data: { trackId: string; updates: any }) => {
      try {
        const config = getLibraryConfig();
        if (!config) {
          return { success: false, message: 'Library not configured' };
        }

        const db = new MusicLibraryDB(path.dirname(config.dbPath));
        db.updateTrack(data.trackId, {
          title: data.updates.title,
          artist: data.updates.artist,
          album: data.updates.album,
          tempo: data.updates.bpm,
        });
        db.close();

        return { success: true, message: 'Track updated successfully' };
      } catch (error) {
        console.error('Error updating track:', error);
        return {
          success: false,
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    }
  );

  ipcMain.handle('detect-duplicates', async () => {
    try {
      const config = getLibraryConfig();
      if (!config) {
        return { success: false, message: 'Library not configured' };
      }

      const db = new MusicLibraryDB(path.dirname(config.dbPath));
      const result = db.detectDuplicates();
      db.close();

      return { success: true, result };
    } catch (error) {
      console.error('Error detecting duplicates:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });
}

function getLibraryConfig() {
  try {
    const userDataPath = app.getPath('userData');
    const configPath = path.join(userDataPath, 'config.json');

    if (!fs.existsSync(configPath)) {
      return null;
    }

    const configData = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error reading library config:', error);
    return null;
  }
}

app.whenReady().then(() => {
  setupIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
