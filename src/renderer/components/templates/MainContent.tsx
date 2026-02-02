import { Stack, Typography, AccordionGroup } from '@mui/joy';
import { useState, useEffect } from 'react';
import type { Track } from '../../types/electron';
import { ConfigMessage } from '../atoms';
import { TrackEditModal } from '../molecules';
import { LibraryInfo, QuickActions, TrackListing } from '../organisms';

export const MainContent = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isLibraryConfigured, setIsLibraryConfigured] = useState(false);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [configMessage, setConfigMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    artist: '',
    album: '',
    bpm: '',
  });

  const loadTracks = async () => {
    setIsLoadingTracks(true);
    try {
      const result = await window.electronAPI.getAllTracks();
      if (result.success) {
        setTracks(result.tracks);
      }
    } catch (error) {
      console.error('Error loading tracks:', error);
    } finally {
      setIsLoadingTracks(false);
    }
  };

  useEffect(() => {
    const checkLibraryConfig = async () => {
      try {
        const result = await window.electronAPI.getLibraryConfig();
        setIsLibraryConfigured(result.configured);
        if (result.configured) {
          await loadTracks();
        }
      } catch (error) {
        console.error('Error checking library config:', error);
        setIsLibraryConfigured(false);
      }
    };
    checkLibraryConfig();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const handleConfigureMusicLibrary = async () => {
    setIsConfiguring(true);
    setConfigMessage(null);

    try {
      const result = await window.electronAPI.configureMusicLibrary();

      if (result.success) {
        setConfigMessage({ type: 'success', text: result.message });
        setIsLibraryConfigured(true);
        await loadTracks();
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
      setIsConfiguring(false);
    }
  };

  const handleRescanLibrary = async () => {
    setIsScanning(true);
    setConfigMessage(null);

    try {
      // Pass true for full scan to force refresh metadata with new parsing logic
      const result = await window.electronAPI.scanMusicLibrary(true);

      if (result.success) {
        setConfigMessage({
          type: 'success',
          text: `Library scanned successfully. Processed ${result.result?.processedFiles || 0} files.`,
        });
        await loadTracks();
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
      setIsScanning(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleEditTrack = (track: Track) => {
    setSelectedTrack(track);
    setEditForm({
      title: track.title,
      artist: track.artist,
      album: track.album,
      bpm: track.bpm?.toString() || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveTrack = async () => {
    if (!selectedTrack) return;

    try {
      const result = await window.electronAPI.updateTrack(selectedTrack.id, {
        title: editForm.title,
        artist: editForm.artist,
        album: editForm.album,
        bpm: editForm.bpm ? parseInt(editForm.bpm) : null,
      });

      if (result.success) {
        setConfigMessage({
          type: 'success',
          text: 'Track updated successfully',
        });
        await loadTracks();
      } else {
        setConfigMessage({
          type: 'error',
          text: result.message || 'Failed to update track',
        });
      }
    } catch (error) {
      setConfigMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update track',
      });
    } finally {
      setIsEditModalOpen(false);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedTrack(null);
  };

  const getFileName = (filePath: string): string => {
    return filePath.split(/[\\/]/).pop() || '';
  };

  const filteredTracks = tracks
    ? tracks.filter(
        (track) =>
          track.title
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          track.artist
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          track.album.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      )
    : [];

  const totalSize = filteredTracks.reduce(
    (acc, track) => acc + track.fileSize,
    0
  );

  const totalDuration = filteredTracks.reduce(
    (acc, track) => acc + track.duration,
    0
  );

  return (
    <Stack
      direction="column"
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="column"
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: 'background.body',
          padding: 3,
          overflow: 'auto',
        }}
        alignItems="stretch"
      >
        <Typography level="h2" sx={{ mb: 2, fontWeight: 600 }}>
          Music Library
        </Typography>

        {configMessage && (
          <ConfigMessage type={configMessage.type} text={configMessage.text} />
        )}

        <Stack direction="column" gap={3}>
          <AccordionGroup
            sx={{
              '& .MuiAccordion-root': {
                backgroundColor: 'background.level1',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              },
            }}
          >
            <LibraryInfo
              isLibraryConfigured={isLibraryConfigured}
              trackCount={filteredTracks.length}
              totalSize={formatFileSize(totalSize)}
              totalDuration={formatDuration(totalDuration)}
              onConfigure={handleConfigureMusicLibrary}
              isConfiguring={isConfiguring}
              onRescan={handleRescanLibrary}
              isScanning={isScanning}
            />

            <QuickActions />
          </AccordionGroup>

          <TrackListing
            tracks={tracks}
            isLoading={isLoadingTracks}
            searchQuery={searchQuery}
            filteredTracks={filteredTracks}
            onSearchChange={setSearchQuery}
            onEditTrack={handleEditTrack}
            getFileName={getFileName}
            formatDuration={formatDuration}
            formatFileSize={formatFileSize}
          />
        </Stack>
      </Stack>

      <TrackEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        form={editForm}
        onFormChange={setEditForm}
        onSave={handleSaveTrack}
      />
    </Stack>
  );
};
