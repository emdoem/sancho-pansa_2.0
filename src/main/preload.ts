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

  detectDuplicates: () => {
    console.log('detectDuplicates');
    return ipcRenderer.invoke('detect-duplicates');
  },

  generateOrganizePlan: () => {
    console.log('generateOrganizePlan');
    return ipcRenderer.invoke('generate-organize-plan');
  },

  executeOrganizePlan: (plan: any) => {
    console.log('executeOrganizePlan');
    return ipcRenderer.invoke('execute-organize-plan', plan);
  },

  onOrganizeProgress: (callback: (progress: any) => void) => {
    const subscription = (_: any, value: any) => callback(value);
    ipcRenderer.on('organize-progress', subscription);
    return () => {
      ipcRenderer.removeListener('organize-progress', subscription);
    };
  },

  resetLibrary: () => {
    console.log('resetLibrary');
    return ipcRenderer.invoke('reset-library');
  },

  bulkUpdateTracks: (trackIds: string[], updates: any) => {
    console.log('bulkUpdateTracks');
    return ipcRenderer.invoke('bulk-update-tracks', { trackIds, updates });
  },

  syncMetadata: () => {
    console.log('syncMetadata');
    return ipcRenderer.invoke('sync-metadata');
  },

  onSyncMetadataProgress: (callback: (progress: any) => void) => {
    const subscription = (_: any, value: any) => callback(value);
    ipcRenderer.on('sync-metadata-progress', subscription);
    return () => {
      ipcRenderer.removeListener('sync-metadata-progress', subscription);
    };
  },

  // Sync status methods
  getSyncStatus: () => {
    console.log('getSyncStatus');
    return ipcRenderer.invoke('get-sync-status');
  },

  acknowledgeExternalChanges: () => {
    console.log('acknowledgeExternalChanges');
    return ipcRenderer.invoke('acknowledge-external-changes');
  },

  onDatabaseExternallyChanged: (callback: (data: any) => void) => {
    const subscription = (_: any, value: any) => callback(value);
    ipcRenderer.on('database-externally-changed', subscription);
    return () => {
      ipcRenderer.removeListener('database-externally-changed', subscription);
    };
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);
