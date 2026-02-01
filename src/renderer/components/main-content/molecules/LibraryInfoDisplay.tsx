import { Stack, Button } from '@mui/joy';
import RefreshIcon from '@mui/icons-material/Refresh';
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
}: LibraryInfoDisplayProps) => (
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
  </Stack>
);
