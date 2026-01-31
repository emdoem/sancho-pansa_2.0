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

export interface LibraryConfigResponse {
  configured: boolean;
  config?: MusicLibraryConfig;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  bpm?: number;
  fileHash: string;
  filePath: string;
  fileSize: number;
  bitrate?: number;
}

export interface GetAllTracksResponse {
  success: boolean;
  message?: string;
  tracks: Track[];
}

export interface ScanLibraryResponse {
  success: boolean;
  message?: string;
  result?: any;
}

export interface ElectronAPI {
  configureMusicLibrary: () => Promise<IpcResponse>;
  exposeUserDataPath: () => Promise<string>;
  getLibraryConfig: () => Promise<LibraryConfigResponse>;
  getAllTracks: () => Promise<GetAllTracksResponse>;
  scanMusicLibrary: (fullScan?: boolean) => Promise<ScanLibraryResponse>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
