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
  albumArtist?: string;
  album: string;
  trackNo?: number;
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

export interface UpdateTrackRequest {
  title: string;
  artist: string;
  albumArtist?: string;
  album: string;
  bpm: number | null;
}

export interface UpdateTrackResponse {
  success: boolean;
  message?: string;
}

export interface DuplicateTrack {
  title: string;
  artist: string;
  album: string;
  count: number;
  trackIds: string[];
}

export interface DetectDuplicatesResponse {
  success: boolean;
  message?: string;
  result?: {
    totalTracks: number;
    uniqueTracks: number;
    duplicates: DuplicateTrack[];
  };
}

export interface OrganizeAction {
  type: 'MOVE' | 'DELETE' | 'KEEP';
  sourcePath: string;
  targetPath?: string;
  reason: string;
  qualityInfo?: string;
}

export interface OrganizePlan {
  actions: OrganizeAction[];
  stats: {
    toMove: number;
    toDelete: number;
    toKeep: number;
    totalSizeToRecover: number;
  };
}

export interface OrganizePlanResponse {
  success: boolean;
  message?: string;
  plan?: OrganizePlan;
}

export interface BulkUpdateTrackRequest {
  artist?: string;
  albumArtist?: string;
  album?: string;
}

export interface BulkUpdateTrackResponse {
  success: boolean;
  message?: string;
  updatedCount?: number;
}

export interface OrganizeProgress {
  total: number;
  current: number;
  action: string;
}

export interface OrganizeExecuteResponse {
  success: boolean;
  errors: string[];
}

export interface SyncMetadataProgress {
  total: number;
  current: number;
  track: string;
}

export interface SyncMetadataResponse {
  success: boolean;
  message: string;
  syncedCount?: number;
  failedCount?: number;
  total?: number;
}

export interface ElectronAPI {
  configureMusicLibrary: () => Promise<IpcResponse>;
  exposeUserDataPath: () => Promise<string>;
  getLibraryConfig: () => Promise<LibraryConfigResponse>;
  getAllTracks: () => Promise<GetAllTracksResponse>;
  scanMusicLibrary: (fullScan?: boolean) => Promise<ScanLibraryResponse>;
  updateTrack: (
    trackId: string,
    updates: UpdateTrackRequest
  ) => Promise<UpdateTrackResponse>;
  detectDuplicates: () => Promise<DetectDuplicatesResponse>;
  generateOrganizePlan: () => Promise<OrganizePlanResponse>;
  executeOrganizePlan: (plan: OrganizePlan) => Promise<OrganizeExecuteResponse>;
  onOrganizeProgress: (
    callback: (progress: OrganizeProgress) => void
  ) => () => void;
  syncMetadata: () => Promise<SyncMetadataResponse>;
  onSyncMetadataProgress: (
    callback: (progress: SyncMetadataProgress) => void
  ) => () => void;
  resetLibrary: () => Promise<IpcResponse>;
  bulkUpdateTracks: (
    trackIds: string[],
    updates: BulkUpdateTrackRequest
  ) => Promise<BulkUpdateTrackResponse>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
