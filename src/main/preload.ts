import { contextBridge, ipcRenderer } from 'electron';

// Define the API that will be exposed to the renderer
const electronAPI = {
  // FirstTimeSetup methods
  configureMusicLibrary: () => {
    console.log('configureMusicLibrary');
    return ipcRenderer.invoke('configure-music-library');
  },

  exposeUserDataPath: () => {
    console.log('exposeUserDataPath');
    return ipcRenderer.invoke('expose-user-data-path');
  },

  getLibraryConfig: () => {
    console.log('getLibraryConfig');
    return ipcRenderer.invoke('get-library-config');
  },

  getAllTracks: () => {
    console.log('getAllTracks');
    return ipcRenderer.invoke('get-all-tracks');
  },

  scanMusicLibrary: (fullScan: boolean = false) => {
    console.log('scanMusicLibrary');
    return ipcRenderer.invoke('scan-music-library', { fullScan });
  },

  updateTrack: (trackId: string, updates: any) => {
    console.log('updateTrack');
    return ipcRenderer.invoke('update-track', { trackId, updates });
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
