export interface IpcResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface MusicLibraryConfig {
  deviceId: string;
  deviceName: string;
  musicRootPath: string;
  dbPath: string;
}

export interface ElectronAPI {
  configureMusicLibrary: () => Promise<IpcResponse>;
  exposeUserDataPath: () => Promise<string>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
