import { handleGetUserDataPath } from '../../utils/apiHandlers';
import { Button, Stack, Typography, Alert } from '@mui/joy';
import { useState } from 'react';

export const MainContent = () => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [configMessage, setConfigMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        text: error instanceof Error ? error.message : 'Failed to configure music library' 
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <Stack
      direction="column"
      sx={{ width: '100%', height: '100%', padding: 1 }}
      alignItems="stretch"
    >
      <Stack direction="row" justifyContent="center" sx={{ width: '100%' }}>
        <Typography level="h3">MainContent</Typography>
      </Stack>
      
      {configMessage && (
        <Alert color={configMessage.type === 'success' ? 'success' : 'danger'}>
          {configMessage.text}
        </Alert>
      )}
      
      <Stack direction="column" gap={1}>
        <Typography level="h4">Track Listing</Typography>
        <Stack direction="row" gap={1}>
          <Button 
            variant="soft" 
            onClick={handleConfigureMusicLibrary}
            loading={isConfiguring}
            disabled={isConfiguring}
          >
            {isConfiguring ? 'Configuring...' : 'Configure Music Library'}
          </Button>
          <Button variant="soft">Scan for Duplicates</Button>
          <Button variant="soft">Rename Files</Button>
          <Button variant="soft" onClick={handleGetUserDataPath}>Import Playlist</Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
