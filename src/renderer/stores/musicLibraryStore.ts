import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Track } from '../types/electron';

interface MusicLibraryState {
  isLibraryConfigured: boolean;
  isLoadingTracks: boolean;
  tracks: Track[] | null;
  searchQuery: string;
  debouncedSearchQuery: string;
  configMessage: { type: 'success' | 'error'; text: string } | null;

  loadTracks: () => Promise<void>;
  initializeLibrary: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setDebouncedSearchQuery: (query: string) => void;
  setConfigMessage: (
    message: { type: 'success' | 'error'; text: string } | null
  ) => void;
}

export const useMusicLibraryStore = create<MusicLibraryState>()(
  immer((set, get) => ({
    isLibraryConfigured: false,
    isLoadingTracks: false,
    tracks: null,
    searchQuery: '',
    debouncedSearchQuery: '',
    configMessage: null,

    loadTracks: async () => {
      set((state) => {
        state.isLoadingTracks = true;
      });

      try {
        const result = await window.electronAPI.getAllTracks();
        if (result.success) {
          set((state) => {
            state.tracks = result.tracks;
          });
        }
      } catch (error) {
        console.error('Error loading tracks:', error);
      } finally {
        set((state) => {
          state.isLoadingTracks = false;
        });
      }
    },

    initializeLibrary: async () => {
      try {
        const result = await window.electronAPI.getLibraryConfig();
        set((state) => {
          state.isLibraryConfigured = result.configured;
        });

        if (result.configured) {
          await get().loadTracks();
        }
      } catch (error) {
        console.error('Error checking library config:', error);
        set((state) => {
          state.isLibraryConfigured = false;
        });
      }
    },

    setSearchQuery: (query: string) => {
      set((state) => {
        state.searchQuery = query;
      });
    },

    setDebouncedSearchQuery: (query: string) => {
      set((state) => {
        state.debouncedSearchQuery = query;
      });
    },

    setConfigMessage: (
      message: { type: 'success' | 'error'; text: string } | null
    ) => {
      set((state) => {
        state.configMessage = message;
      });
    },
  }))
);

export const useFilteredTracks = () => {
  const { tracks, debouncedSearchQuery } = useMusicLibraryStore();

  if (!tracks) return [];

  return tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      track.album.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );
};

export const useLibraryStats = () => {
  const { tracks } = useMusicLibraryStore();

  if (!tracks)
    return { trackCount: 0, totalSize: '0 MB', totalDuration: '0:00' };

  const trackCount = tracks.length;
  const totalSizeBytes = tracks.reduce((acc, track) => acc + track.fileSize, 0);
  const totalDurationSeconds = tracks.reduce(
    (acc, track) => acc + track.duration,
    0
  );

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return {
    trackCount,
    totalSize: formatFileSize(totalSizeBytes),
    totalDuration: formatDuration(totalDurationSeconds),
  };
};
