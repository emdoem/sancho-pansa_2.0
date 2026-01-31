import { handleGetUserDataPath } from '../../utils/apiHandlers';
import {
  Button,
  Stack,
  Typography,
  Alert,
  Box,
  Input,
  AccordionGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  CircularProgress,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormLabel,
  FormControl,
} from '@mui/joy';
import { useState, useEffect, useRef } from 'react';
import type { Track } from '../../types/electron';
import { useVirtualizer } from '@tanstack/react-virtual';
import FolderIcon from '@mui/icons-material/Folder';
import SearchIcon from '@mui/icons-material/Search';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';

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
      const result = await window.electronAPI.scanMusicLibrary(false);

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

  const getFileName = (filePath: string) => {
    return filePath.split(/[\\/]/).pop();
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

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredTracks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  const items = rowVirtualizer.getVirtualItems();

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
          <Alert
            color={configMessage.type === 'success' ? 'success' : 'danger'}
            sx={{ mb: 3 }}
            variant="soft"
          >
            {configMessage.text}
          </Alert>
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
            <Accordion defaultExpanded>
              <AccordionSummary indicator={<ExpandMoreIcon />}>
                <Typography level="title-lg" sx={{ fontWeight: 600 }}>
                  Library Info
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                {!isLibraryConfigured ? (
                  <Stack direction="column" gap={2}>
                    <Typography level="body-md" sx={{ fontWeight: 500 }}>
                      Library not configured
                    </Typography>
                    <Button
                      variant="solid"
                      color="primary"
                      startDecorator={<FolderIcon />}
                      onClick={handleConfigureMusicLibrary}
                      loading={isConfiguring}
                      disabled={isConfiguring}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      {isConfiguring
                        ? 'Configuring...'
                        : 'Configure Music Library'}
                    </Button>
                  </Stack>
                ) : (
                  <Stack direction="column" gap={2}>
                    <Stack direction="row" gap={3} flexWrap="wrap">
                      <Stack direction="column" sx={{ flex: '1 1 200px' }}>
                        <Typography
                          level="body-sm"
                          sx={{ color: 'text.tertiary', mb: 0.5 }}
                        >
                          Library Path
                        </Typography>
                        <Typography level="body-md" sx={{ fontWeight: 500 }}>
                          Configured
                        </Typography>
                      </Stack>
                      <Stack direction="column" sx={{ flex: '1 1 150px' }}>
                        <Typography
                          level="body-sm"
                          sx={{ color: 'text.tertiary', mb: 0.5 }}
                        >
                          Tracks
                        </Typography>
                        <Typography level="body-md" sx={{ fontWeight: 500 }}>
                          {filteredTracks.length}
                        </Typography>
                      </Stack>
                      <Stack direction="column" sx={{ flex: '1 1 150px' }}>
                        <Typography
                          level="body-sm"
                          sx={{ color: 'text.tertiary', mb: 0.5 }}
                        >
                          Total Size
                        </Typography>
                        <Typography level="body-md" sx={{ fontWeight: 500 }}>
                          {formatFileSize(
                            filteredTracks.reduce(
                              (acc, track) => acc + track.fileSize,
                              0
                            )
                          )}
                        </Typography>
                      </Stack>
                      <Stack direction="column" sx={{ flex: '1 1 150px' }}>
                        <Typography
                          level="body-sm"
                          sx={{ color: 'text.tertiary', mb: 0.5 }}
                        >
                          Total Duration
                        </Typography>
                        <Typography level="body-md" sx={{ fontWeight: 500 }}>
                          {formatDuration(
                            filteredTracks.reduce(
                              (acc, track) => acc + track.duration,
                              0
                            )
                          )}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Button
                      variant="soft"
                      color="primary"
                      startDecorator={<RefreshIcon />}
                      onClick={handleRescanLibrary}
                      loading={isScanning}
                      disabled={isScanning}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      {isScanning ? 'Scanning...' : 'Rescan Music Library'}
                    </Button>
                  </Stack>
                )}
              </AccordionDetails>
            </Accordion>

            <Accordion defaultExpanded>
              <AccordionSummary indicator={<ExpandMoreIcon />}>
                <Typography level="title-lg" sx={{ fontWeight: 600 }}>
                  Quick Actions
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Stack direction="row" gap={2}>
                  <Button
                    variant="soft"
                    color="primary"
                    startDecorator={<SearchIcon />}
                    sx={{ flex: 1, whiteSpace: 'normal', textAlign: 'center' }}
                  >
                    Scan for Duplicates
                  </Button>
                  <Button
                    variant="soft"
                    color="neutral"
                    startDecorator={<DriveFileRenameOutlineIcon />}
                    sx={{ flex: 1, whiteSpace: 'normal', textAlign: 'center' }}
                  >
                    Rename Files
                  </Button>
                  <Button
                    variant="soft"
                    color="neutral"
                    startDecorator={<PlaylistAddIcon />}
                    onClick={handleGetUserDataPath}
                    sx={{ flex: 1, whiteSpace: 'normal', textAlign: 'center' }}
                  >
                    Import Playlist
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>
          </AccordionGroup>

          <Box
            sx={{
              backgroundColor: 'background.level1',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              padding: 3,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography level="title-lg" sx={{ fontWeight: 600 }}>
                Track Listing ({filteredTracks.length})
              </Typography>
              <Input
                placeholder="Search tracks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startDecorator={<SearchIcon />}
                sx={{ width: 300 }}
              />
            </Stack>

            {tracks === null || isLoadingTracks ? (
              <Stack
                direction="column"
                alignItems="center"
                justifyContent="center"
                sx={{ height: '100%', minHeight: 200 }}
              >
                <CircularProgress size="lg" />
                <Typography
                  level="body-md"
                  sx={{ color: 'text.secondary', mt: 2 }}
                >
                  Loading tracks...
                </Typography>
              </Stack>
            ) : filteredTracks.length === 0 ? (
              <Stack
                direction="column"
                alignItems="center"
                justifyContent="center"
                sx={{ height: '100%', minHeight: 200 }}
              >
                <MusicNoteIcon
                  sx={{ fontSize: 64, color: 'text.tertiary', mb: 2 }}
                />
                <Typography
                  level="body-lg"
                  sx={{ color: 'text.secondary', textAlign: 'center' }}
                >
                  {searchQuery ? 'No tracks found' : 'No tracks loaded yet'}
                </Typography>
                <Typography
                  level="body-sm"
                  sx={{ color: 'text.tertiary', textAlign: 'center', mt: 1 }}
                >
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Configure your music library to start scanning for tracks'}
                </Typography>
              </Stack>
            ) : (
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden',
                  height: '650px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    width: '100%',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.level2',
                  }}
                >
                  <Box
                    sx={{
                      flex: '0 0 25%',
                      padding: '12px',
                      fontWeight: 600,
                      color: 'text.primary',
                    }}
                  >
                    Title
                  </Box>
                  <Box
                    sx={{
                      flex: '0 0 15%',
                      padding: '12px',
                      fontWeight: 600,
                      color: 'text.primary',
                    }}
                  >
                    Artist
                  </Box>
                  <Box
                    sx={{
                      flex: '0 0 15%',
                      padding: '12px',
                      fontWeight: 600,
                      color: 'text.primary',
                    }}
                  >
                    Album
                  </Box>
                  <Box
                    sx={{
                      flex: '0 0 20%',
                      padding: '12px',
                      fontWeight: 600,
                      color: 'text.primary',
                    }}
                  >
                    File Name
                  </Box>
                  <Box
                    sx={{
                      flex: '0 0 5%',
                      padding: '12px',
                      fontWeight: 600,
                      color: 'text.primary',
                      textAlign: 'center',
                    }}
                  >
                    BPM
                  </Box>
                  <Box
                    sx={{
                      flex: '0 0 8%',
                      padding: '12px',
                      fontWeight: 600,
                      color: 'text.primary',
                      textAlign: 'right',
                    }}
                  >
                    Duration
                  </Box>
                  <Box
                    sx={{
                      flex: '0 0 7%',
                      padding: '12px',
                      fontWeight: 600,
                      color: 'text.primary',
                      textAlign: 'right',
                    }}
                  >
                    Size
                  </Box>
                  <Box
                    sx={{
                      flex: '0 0 5%',
                      padding: '12px',
                      fontWeight: 600,
                      color: 'text.primary',
                      textAlign: 'center',
                    }}
                  >
                    Actions
                  </Box>
                </Box>
                <Box
                  ref={parentRef}
                  sx={{
                    height: '600px',
                    overflow: 'auto',
                  }}
                >
                  <Box
                    sx={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    {items.map((virtualRow) => (
                      <Box
                        key={virtualRow.key}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: 'translateY(' + virtualRow.start + 'px)',
                          display: 'flex',
                          alignItems: 'center',
                          '&:hover': {
                            backgroundColor: 'rgba(76, 175, 80, 0.08)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            flex: '0 0 25%',
                            padding: '12px',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                          }}
                        >
                          <Typography
                            level="body-md"
                            sx={{ fontWeight: 500 }}
                          >
                            {filteredTracks[virtualRow.index].title}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            flex: '0 0 15%',
                            padding: '12px',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                          }}
                        >
                          <Typography
                            level="body-sm"
                            sx={{ color: 'text.secondary' }}
                          >
                            {filteredTracks[virtualRow.index].artist}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            flex: '0 0 15%',
                            padding: '12px',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                          }}
                        >
                          <Typography
                            level="body-sm"
                            sx={{ color: 'text.secondary' }}
                          >
                            {filteredTracks[virtualRow.index].album}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            flex: '0 0 20%',
                            padding: '12px',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                          }}
                        >
                          <Typography
                            level="body-sm"
                            sx={{ color: 'text.secondary' }}
                          >
                            {getFileName(filteredTracks[virtualRow.index].filePath)}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            flex: '0 0 5%',
                            padding: '12px',
                            textAlign: 'center',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                          }}
                        >
                          <Typography
                            level="body-sm"
                            sx={{ color: 'text.secondary' }}
                          >
                            {filteredTracks[virtualRow.index].bpm || '-'}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            flex: '0 0 8%',
                            padding: '12px',
                            textAlign: 'right',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                          }}
                        >
                          <Typography
                            level="body-sm"
                            sx={{ color: 'text.secondary' }}
                          >
                            {formatDuration(
                              filteredTracks[virtualRow.index].duration
                            )}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            flex: '0 0 7%',
                            padding: '12px',
                            textAlign: 'right',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                          }}
                        >
                          <Typography
                            level="body-sm"
                            sx={{ color: 'text.secondary' }}
                          >
                            {formatFileSize(
                              filteredTracks[virtualRow.index].fileSize
                            )}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            flex: '0 0 5%',
                            padding: '12px',
                            textAlign: 'center',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            overflow: 'hidden',
                          }}
                        >
                          <IconButton
                            size="sm"
                            onClick={() =>
                              handleEditTrack(
                                filteredTracks[virtualRow.index]
                              )
                            }
                          >
                            <EditIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </Stack>
      </Stack>
      <Modal open={isEditModalOpen} onClose={handleCloseModal}>
        <ModalDialog sx={{ minWidth: 400 }}>
          <DialogTitle>Edit Track</DialogTitle>
          <DialogContent>
            <Stack direction="column" gap={2}>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  placeholder="Enter track title"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Artist</FormLabel>
                <Input
                  value={editForm.artist}
                  onChange={(e) =>
                    setEditForm({ ...editForm, artist: e.target.value })
                  }
                  placeholder="Enter artist name"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Album</FormLabel>
                <Input
                  value={editForm.album}
                  onChange={(e) =>
                    setEditForm({ ...editForm, album: e.target.value })
                  }
                  placeholder="Enter album name"
                />
              </FormControl>
              <FormControl>
                <FormLabel>BPM</FormLabel>
                <Input
                  type="number"
                  value={editForm.bpm}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bpm: e.target.value })
                  }
                  placeholder="Enter BPM"
                />
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="plain" color="neutral" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveTrack}>Save</Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Stack>
  );
};
