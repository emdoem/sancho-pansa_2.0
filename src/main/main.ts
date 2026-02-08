import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import FirstTimeSetup from './first-time-setup';
import MusicLibraryDB from './database/db';
import { MusicScanner } from './services/musicScanner';
import { LibraryOrganizer } from './services/libraryOrganizer';
import { MetadataWriter } from './services/metadataWriter';

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
          result = await scanner.scanLibrary(config.musicRootPath, true);
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
        albumArtist: track.album_artist_name || track.album_artist || undefined,
        album: track.album_title || track.album || 'Unknown',
        trackNo: track.track_no,
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

        // Get the track to find its file path
        const tracks = db.getAllTracks();
        const track = tracks.find((t: any) => t.id === data.trackId);

        if (!track) {
          db.close();
          return { success: false, message: 'Track not found' };
        }

        // Update database
        db.updateTrack(data.trackId, {
          title: data.updates.title,
          artist: data.updates.artist,
          album_artist: data.updates.albumArtist,
          album: data.updates.album,
          tempo: data.updates.bpm,
        });

        // Sync metadata to file
        const metadataWriter = new MetadataWriter();
        const metadataSyncSuccess = await metadataWriter.writeMetadata(
          track.file_path,
          {
            title: data.updates.title,
            artist: data.updates.artist,
            albumArtist: data.updates.albumArtist,
            album: data.updates.album,
            trackNo: data.updates.trackNo,
            tempo: data.updates.bpm,
          }
        );

        db.close();

        return {
          success: true,
          message: metadataSyncSuccess
            ? 'Track and file metadata updated successfully'
            : 'Track updated in database (file metadata sync failed or unsupported format)',
        };
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

  ipcMain.handle(
    'bulk-update-tracks',
    async (_, data: { trackIds: string[]; updates: any }) => {
      try {
        const config = getLibraryConfig();
        if (!config) {
          return { success: false, message: 'Library not configured' };
        }

        const db = new MusicLibraryDB(path.dirname(config.dbPath));
        const metadataWriter = new MetadataWriter();

        // Prepare updates object, only including fields with values
        const dbUpdates: any = {};
        const fileMetadata: any = {};

        if (data.updates.artist !== undefined) {
          dbUpdates.artist = data.updates.artist;
          fileMetadata.artist = data.updates.artist;
        }
        if (data.updates.albumArtist !== undefined) {
          dbUpdates.album_artist = data.updates.albumArtist;
          fileMetadata.albumArtist = data.updates.albumArtist;
        }
        if (data.updates.album !== undefined) {
          dbUpdates.album = data.updates.album;
          fileMetadata.album = data.updates.album;
        }

        // Update each track
        let updatedCount = 0;
        let fileSyncCount = 0;
        const tracks = db.getAllTracks();

        for (const trackId of data.trackIds) {
          try {
            db.updateTrack(trackId, dbUpdates);
            updatedCount++;

            // Sync metadata to file
            const track = tracks.find((t: any) => t.id === trackId);
            if (track && Object.keys(fileMetadata).length > 0) {
              const success = await metadataWriter.writeMetadata(
                track.file_path,
                fileMetadata
              );
              if (success) fileSyncCount++;
            }
          } catch (error) {
            console.error(`Error updating track ${trackId}:`, error);
          }
        }

        db.close();

        return {
          success: true,
          message: `Successfully updated ${updatedCount} track${updatedCount !== 1 ? 's' : ''} (${fileSyncCount} file${fileSyncCount !== 1 ? 's' : ''} synced)`,
          updatedCount,
        };
      } catch (error) {
        console.error('Error bulk updating tracks:', error);
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

  ipcMain.handle('generate-organize-plan', async () => {
    try {
      const config = getLibraryConfig();
      if (!config) {
        return { success: false, message: 'Library not configured' };
      }

      const db = new MusicLibraryDB(path.dirname(config.dbPath));
      const organizer = new LibraryOrganizer(db);
      const plan = await organizer.generatePlan(config.musicRootPath);
      db.close();

      return { success: true, plan };
    } catch (error) {
      console.error('Error generating organize plan:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });

  ipcMain.handle('execute-organize-plan', async (_, plan) => {
    try {
      const config = getLibraryConfig();
      if (!config) {
        return { success: false, message: 'Library not configured' };
      }

      // Get the window to send progress updates
      const window = BrowserWindow.getAllWindows()[0];

      const db = new MusicLibraryDB(path.dirname(config.dbPath));
      const organizer = new LibraryOrganizer(db);

      const result = await organizer.executePlan(
        plan,
        config.musicRootPath,
        (progress) => {
          if (window) {
            window.webContents.send('organize-progress', progress);
          }
        }
      );

      db.close();

      return { success: result.success, errors: result.errors };
    } catch (error) {
      console.error('Error executing organize plan:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });

  ipcMain.handle('sync-metadata', async () => {
    try {
      const config = getLibraryConfig();
      if (!config) {
        return { success: false, message: 'Library not configured' };
      }

      const window = BrowserWindow.getAllWindows()[0];
      const db = new MusicLibraryDB(path.dirname(config.dbPath));
      const metadataWriter = new MetadataWriter();
      const tracks = db.getAllTracks();

      let syncedCount = 0;
      let failedCount = 0;
      const total = tracks.length;

      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];

        if (window) {
          window.webContents.send('sync-metadata-progress', {
            total,
            current: i + 1,
            track: track.title || 'Unknown',
          });
        }

        try {
          const success = await metadataWriter.writeMetadata(track.file_path, {
            title: track.title,
            artist: track.artist,
            albumArtist: track.album_artist,
            album: track.album,
            trackNo: track.track_no,
            tempo: track.tempo,
          });

          if (success) {
            syncedCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error(
            `Error syncing metadata for ${track.file_path}:`,
            error
          );
          failedCount++;
        }
      }

      db.close();

      return {
        success: true,
        message: `Metadata sync complete: ${syncedCount} synced, ${failedCount} failed (unsupported format or error)`,
        syncedCount,
        failedCount,
        total,
      };
    } catch (error) {
      console.error('Error syncing metadata:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  });

  ipcMain.handle('reset-library', async () => {
    try {
      const userDataPath = app.getPath('userData');
      const configPath = path.join(userDataPath, 'config.json');

      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }

      return {
        success: true,
        message: 'Library configuration reset successfully',
      };
    } catch (error) {
      console.error('Error resetting library:', error);
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
