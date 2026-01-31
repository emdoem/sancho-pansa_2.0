import { handleGetUserDataPath } from '../../utils/apiHandlers';
import { Button, Stack, Typography, Alert, Box } from '@mui/joy';
import { useState } from 'react';
import FolderIcon from '@mui/icons-material/Folder';
import SearchIcon from '@mui/icons-material/Search';

import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

export const MainContent = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configMessage, setConfigMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleConfigureMusicLibrary = async () => {
    setIsConfiguring(true);
    setConfigMessage(null);

    try {
      const result = await window.electronAPI.configureMusicLibrary();

      if (result.success) {
        setConfigMessage({ type: 'success', text: result.message });
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

  return (
    <Stack
      direction="column"
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: 'background.body',
        padding: 3,
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
        <Box
          sx={{
            backgroundColor: 'background.level1',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            padding: 3,
          }}
        >
          <Typography level="title-lg" sx={{ mb: 2, fontWeight: 600 }}>
            Quick Actions
          </Typography>
          <Stack direction="row" gap={2} flexWrap="wrap">
            <Button
              variant="solid"
              color="primary"
              startDecorator={<FolderIcon />}
              onClick={handleConfigureMusicLibrary}
              loading={isConfiguring}
              disabled={isConfiguring}
              sx={{ minWidth: 180 }}
            >
              {isConfiguring ? 'Configuring...' : 'Configure Music Library'}
            </Button>
            <Button
              variant="soft"
              color="primary"
              startDecorator={<SearchIcon />}
              sx={{ minWidth: 180 }}
            >
              Scan for Duplicates
            </Button>
            <Button
              variant="soft"
              color="neutral"
              startDecorator={<DriveFileRenameOutlineIcon />}
              sx={{ minWidth: 180 }}
            >
              Rename Files
            </Button>
            <Button
              variant="soft"
              color="neutral"
              startDecorator={<PlaylistAddIcon />}
              onClick={handleGetUserDataPath}
              sx={{ minWidth: 180 }}
            >
              Import Playlist
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            backgroundColor: 'background.level1',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            padding: 3,
            flex: 1,
            minHeight: 0,
          }}
        >
          <Typography level="title-lg" sx={{ mb: 2, fontWeight: 600 }}>
            Track Listing
          </Typography>
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
              No tracks loaded yet
            </Typography>
            <Typography
              level="body-sm"
              sx={{ color: 'text.tertiary', textAlign: 'center', mt: 1 }}
            >
              Configure your music library to start scanning for tracks
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Stack>
  );
};
