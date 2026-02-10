import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Track } from '../types/electron';
import { useMusicLibraryStore } from './musicLibraryStore';

interface ModalFormState {
  isConfiguring: boolean;
  isScanning: boolean;
  isEditModalOpen: boolean;
  selectedTrack: Track | null;
  editForm: {
    title: string;
    artist: string;
    albumArtist: string;
    album: string;
    bpm: string;
  };
  showCheckboxes: boolean;
  selectedTrackIds: string[];
  isBulkEditModalOpen: boolean;
  bulkEditForm: {
    artist: string;
    albumArtist: string;
    album: string;
  };

  configureMusicLibrary: () => Promise<void>;
  rescanLibrary: () => Promise<void>;
  openEditModal: (track: Track) => void;
  closeEditModal: () => void;
  setEditForm: (form: {
    title?: string;
    artist?: string;
    albumArtist?: string;
    album?: string;
    bpm?: string;
  }) => void;
  saveTrack: () => Promise<void>;
  toggleBulkEditMode: (enabled: boolean) => void;
  toggleSelect: (trackId: string) => void;
  selectAll: () => void;
  openBulkEditModal: () => void;
  closeBulkEditModal: () => void;
  setBulkEditForm: (form: {
    artist?: string;
    albumArtist?: string;
    album?: string;
  }) => void;
  saveBulkEdit: () => Promise<void>;
}

export const useModalFormStore = create<ModalFormState>()(
  immer((set, get) => ({
    isConfiguring: false,
    isScanning: false,
    isEditModalOpen: false,
    selectedTrack: null,
    editForm: {
      title: '',
      artist: '',
      albumArtist: '',
      album: '',
      bpm: '',
    },
    showCheckboxes: false,
    selectedTrackIds: [],
    isBulkEditModalOpen: false,
    bulkEditForm: {
      artist: '',
      albumArtist: '',
      album: '',
    },

    configureMusicLibrary: async () => {
      const { setConfigMessage } = useMusicLibraryStore.getState();

      set((state) => {
        state.isConfiguring = true;
      });
      setConfigMessage(null);

      try {
        const result = await window.electronAPI.configureMusicLibrary();

        if (result.success) {
          setConfigMessage({ type: 'success', text: result.message });
          await useMusicLibraryStore.getState().initializeLibrary();
        } else {
          setConfigMessage({ type: 'error', text: result.message });
        }
      } catch (error) {
        setConfigMessage({
          type: 'error',
          text:
            error instanceof Error
              ? error.message
              : 'Failed to configure music library',
        });
      } finally {
        set((state) => {
          state.isConfiguring = false;
        });
      }
    },

    rescanLibrary: async () => {
      const { setConfigMessage } = useMusicLibraryStore.getState();

      set((state) => {
        state.isScanning = true;
      });
      setConfigMessage(null);

      try {
        const result = await window.electronAPI.scanMusicLibrary(true);

        if (result.success) {
          setConfigMessage({
            type: 'success',
            text: `Library scanned successfully. Processed ${result.result?.processedFiles || 0} files.`,
          });
          await useMusicLibraryStore.getState().loadTracks();
        } else {
          setConfigMessage({
            type: 'error',
            text: result.message || 'Failed to scan library',
          });
        }
      } catch (error) {
        setConfigMessage({
          type: 'error',
          text:
            error instanceof Error
              ? error.message
              : 'Failed to scan music library',
        });
      } finally {
        set((state) => {
          state.isScanning = false;
        });
      }
    },

    openEditModal: (track: Track) => {
      set((state) => {
        state.isEditModalOpen = true;
        state.selectedTrack = track;
        state.editForm = {
          title: track.title,
          artist: track.artist,
          albumArtist: track.albumArtist || '',
          album: track.album,
          bpm: track.bpm?.toString() || '',
        };
      });
    },

    closeEditModal: () => {
      set((state) => {
        state.isEditModalOpen = false;
        state.selectedTrack = null;
        state.editForm = {
          title: '',
          artist: '',
          albumArtist: '',
          album: '',
          bpm: '',
        };
      });
    },

    setEditForm: (form) => {
      set((state) => {
        state.editForm = { ...state.editForm, ...form };
      });
    },

    saveTrack: async () => {
      const { selectedTrack, editForm, closeEditModal } = get();
      const { setConfigMessage, loadTracks } = useMusicLibraryStore.getState();

      if (!selectedTrack) return;

      try {
        const result = await window.electronAPI.updateTrack(selectedTrack.id, {
          title: editForm.title,
          artist: editForm.artist,
          albumArtist: editForm.albumArtist,
          album: editForm.album,
          bpm: editForm.bpm ? parseInt(editForm.bpm) : null,
        });

        if (result.success) {
          setConfigMessage({
            type: 'success',
            text: 'Track updated successfully',
          });
          await loadTracks();
          closeEditModal();
        } else {
          setConfigMessage({
            type: 'error',
            text: result.message || 'Failed to update track',
          });
        }
      } catch (error) {
        setConfigMessage({
          type: 'error',
          text:
            error instanceof Error ? error.message : 'Failed to update track',
        });
      }
    },

    toggleBulkEditMode: (enabled: boolean) => {
      set((state) => {
        state.showCheckboxes = enabled;
        if (!enabled) {
          state.selectedTrackIds = [];
        }
      });
    },

    toggleSelect: (trackId: string) => {
      set((state) => {
        const index = state.selectedTrackIds.indexOf(trackId);
        if (index !== -1) {
          state.selectedTrackIds.splice(index, 1);
        } else {
          state.selectedTrackIds.push(trackId);
        }
      });
    },

    selectAll: () => {
      const { tracks, debouncedSearchQuery } = useMusicLibraryStore.getState();
      const { selectedTrackIds } = get();

      if (!tracks) return;

      const filteredTracks = tracks.filter(
        (track: Track) =>
          track.title
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          track.artist
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          track.album.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );

      set((state) => {
        const filteredIds = filteredTracks.map((t) => t.id);
        const currentSet = new Set(selectedTrackIds);
        const filteredSet = new Set(filteredIds);

        if (currentSet.size === filteredSet.size) {
          state.selectedTrackIds = [];
        } else {
          state.selectedTrackIds = filteredIds;
        }
      });
    },

    openBulkEditModal: () => {
      set((state) => {
        state.isBulkEditModalOpen = true;
      });
    },

    closeBulkEditModal: () => {
      set((state) => {
        state.isBulkEditModalOpen = false;
        state.bulkEditForm = { artist: '', albumArtist: '', album: '' };
      });
    },

    setBulkEditForm: (form) => {
      set((state) => {
        state.bulkEditForm = { ...state.bulkEditForm, ...form };
      });
    },

    saveBulkEdit: async () => {
      const {
        selectedTrackIds,
        bulkEditForm,
        closeBulkEditModal,
        toggleBulkEditMode,
      } = get();
      const { setConfigMessage, loadTracks } = useMusicLibraryStore.getState();

      if (selectedTrackIds.length === 0) return;

      const updates: { artist?: string; albumArtist?: string; album?: string } =
        {};
      if (bulkEditForm.artist.trim())
        updates.artist = bulkEditForm.artist.trim();
      if (bulkEditForm.albumArtist.trim())
        updates.albumArtist = bulkEditForm.albumArtist.trim();
      if (bulkEditForm.album.trim()) updates.album = bulkEditForm.album.trim();

      if (Object.keys(updates).length === 0) {
        setConfigMessage({
          type: 'error',
          text: 'Please fill in at least one field to update',
        });
        return;
      }

      try {
        const result = await window.electronAPI.bulkUpdateTracks(
          selectedTrackIds,
          updates
        );

        if (result.success) {
          setConfigMessage({
            type: 'success',
            text: `Successfully updated ${result.updatedCount} track${result.updatedCount !== 1 ? 's' : ''}`,
          });
          await loadTracks();
          toggleBulkEditMode(false);
          closeBulkEditModal();
        } else {
          setConfigMessage({
            type: 'error',
            text: result.message || 'Failed to update tracks',
          });
        }
      } catch (error) {
        setConfigMessage({
          type: 'error',
          text:
            error instanceof Error ? error.message : 'Failed to update tracks',
        });
      }
    },
  }))
);
