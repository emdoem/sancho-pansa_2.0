import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import FirstTimeSetup from './first-time-setup';

function createWindow() {
  // Resolve preload script path
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('Preload path:', preloadPath); // Debug log
  
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true, // Required for contextBridge to work
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

// Set up IPC handlers
function setupIpcHandlers() {
  const firstTimeSetup = new FirstTimeSetup();

  // Handle music library configuration
  ipcMain.handle('configure-music-library', async () => {
    try {
      await firstTimeSetup.configure();
      return { success: true, message: 'Music library configured successfully' };
    } catch (error) {
      console.error('Error configuring music library:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  });
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
