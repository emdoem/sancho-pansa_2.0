import { contextBridge, ipcRenderer } from 'electron';

// Define the API that will be exposed to the renderer
const electronAPI = {
  // FirstTimeSetup methods
  configureMusicLibrary: () => {
    console.log('configureMusicLibrary');
    return ipcRenderer.invoke('configure-music-library')
  },
  
  exposeUserDataPath: () => {
    console.log('exposeUserDataPath');
    return ipcRenderer.invoke('expose-user-data-path');
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

