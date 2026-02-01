import { Stack, Button, Typography } from '@mui/joy';
import FolderIcon from '@mui/icons-material/Folder';

interface LibraryInfoNotConfiguredProps {
  onConfigure: () => void;
  isConfiguring: boolean;
}

export const LibraryInfoNotConfigured = ({
  onConfigure,
  isConfiguring,
}: LibraryInfoNotConfiguredProps) => (
  <Stack direction="column" gap={2}>
    <Typography level="body-md" sx={{ fontWeight: 500 }}>
      Library not configured
    </Typography>
    <Button
      variant="solid"
      color="primary"
      startDecorator={<FolderIcon />}
      onClick={onConfigure}
      loading={isConfiguring}
      disabled={isConfiguring}
      sx={{ alignSelf: 'flex-start' }}
    >
      {isConfiguring ? 'Configuring...' : 'Configure Music Library'}
    </Button>
  </Stack>
);
