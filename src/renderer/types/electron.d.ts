// IPC Response types
export interface IpcResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// FirstTimeSetup specific types
export interface MusicLibraryConfig {
  deviceId: string;
  deviceName: string;
  musicRootPath: string;
  dbPath: string;
}

// Electron API interface for renderer
export interface ElectronAPI {
  configureMusicLibrary: () => Promise<IpcResponse>;
}

// Global window interface extension
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
