import { Stack, Button } from '@mui/joy';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { LibraryInfoItem } from '../atoms';

interface LibraryInfoDisplayProps {
  trackCount: number;
  totalSize: string;
  totalDuration: string;
  onRescan: () => void;
  isScanning: boolean;
}

export const LibraryInfoDisplay = ({
  trackCount,
  totalSize,
  totalDuration,
  onRescan,
  isScanning,
}: LibraryInfoDisplayProps) => {
  const handleReset = async () => {
    if (
      confirm(
        'Are you sure you want to reset the library configuration? This will require you to go through the setup again.'
      )
    ) {
      const result = await window.electronAPI.resetLibrary();
      if (result.success) {
        window.location.reload();
      }
    }
  };

  return (
    <Stack direction="column" gap={2}>
      <Stack direction="row" gap={3} flexWrap="wrap">
        <LibraryInfoItem
          label="Library Path"
          value="Configured"
          flex="1 1 200px"
        />
        <LibraryInfoItem label="Tracks" value={trackCount} />
        <LibraryInfoItem label="Total Size" value={totalSize} />
        <LibraryInfoItem label="Total Duration" value={totalDuration} />
      </Stack>
      <Stack direction="row" gap={2}>
        <Button
          variant="soft"
          color="primary"
          startDecorator={<RefreshIcon />}
          onClick={onRescan}
          loading={isScanning}
          disabled={isScanning}
          sx={{ alignSelf: 'flex-start' }}
        >
          {isScanning ? 'Scanning...' : 'Rescan Music Library'}
        </Button>
        <Button
          variant="plain"
          color="danger"
          startDecorator={<SettingsBackupRestoreIcon />}
          onClick={handleReset}
          sx={{ alignSelf: 'flex-start' }}
        >
          Reset Configuration
        </Button>
      </Stack>
    </Stack>
  );
};
