import { handleGetUserDataPath } from '../../utils/apiHandlers';
import {
  Button,
  Stack,
  Typography,
  Alert,
  Box,
  Table,
  Input,
  AccordionGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/joy';
import { useState, useEffect } from 'react';
import type { Track } from '../../types/electron';
import FolderIcon from '@mui/icons-material/Folder';
import SearchIcon from '@mui/icons-material/Search';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export const MainContent = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isLibraryConfigured, setIsLibraryConfigured] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [configMessage, setConfigMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadTracks = async () => {
    try {
      const result = await window.electronAPI.getAllTracks();
      if (result.success) {
        setTracks(result.tracks);
      }
    } catch (error) {
      console.error('Error loading tracks:', error);
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

  const filteredTracks = tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.album.toLowerCase().includes(searchQuery.toLowerCase())
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

            {filteredTracks.length === 0 ? (
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
              <Table
                stripe="odd"
                hoverRow
                sx={{
                  '& thead th': {
                    backgroundColor: 'background.level2',
                    color: 'text.primary',
                    fontWeight: 600,
                  },
                  '& tbody tr:hover': {
                    backgroundColor: 'rgba(76, 175, 80, 0.08)',
                  },
                }}
              >
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Artist</th>
                    <th>Album</th>
                    <th>File Name</th>
                    <th style={{ textAlign: 'center' }}>BPM</th>
                    <th style={{ textAlign: 'right' }}>Duration</th>
                    <th style={{ textAlign: 'right' }}>Size</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTracks.map((track) => (
                    <tr key={track.id}>
                      <td>
                        <Typography level="body-md" sx={{ fontWeight: 500 }}>
                          {track.title}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          level="body-sm"
                          sx={{ color: 'text.secondary' }}
                        >
                          {track.artist}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          level="body-sm"
                          sx={{ color: 'text.secondary' }}
                        >
                          {track.album}
                        </Typography>
                      </td>
                      <td>
                        <Typography
                          level="body-sm"
                          sx={{ color: 'text.secondary' }}
                        >
                          {track.filePath.split(/[\\/]/).pop()}
                        </Typography>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <Typography
                          level="body-sm"
                          sx={{ color: 'text.secondary' }}
                        >
                          {track.bpm || '-'}
                        </Typography>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Typography
                          level="body-sm"
                          sx={{ color: 'text.secondary' }}
                        >
                          {formatDuration(track.duration)}
                        </Typography>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Typography
                          level="body-sm"
                          sx={{ color: 'text.secondary' }}
                        >
                          {formatFileSize(track.fileSize)}
                        </Typography>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
};
