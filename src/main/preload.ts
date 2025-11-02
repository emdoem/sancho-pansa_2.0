import { contextBridge, ipcRenderer } from 'electron';

// Define the API that will be exposed to the renderer
const electronAPI = {
  // FirstTimeSetup methods
  configureMusicLibrary: () => {
    console.log('configureMusicLibrary');
    return ipcRenderer.invoke('configure-music-library')
  },
  
  // You can add more IPC methods here as needed
  // Example: getConfig: () => ipcRenderer.invoke('get-config'),
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

