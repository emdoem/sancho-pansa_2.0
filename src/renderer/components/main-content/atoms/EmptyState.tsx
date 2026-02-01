import { Stack, Typography } from '@mui/joy';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

interface EmptyStateProps {
  hasSearch: boolean;
}

export const EmptyState = ({ hasSearch }: EmptyStateProps) => (
  <Stack
    direction="column"
    alignItems="center"
    justifyContent="center"
    sx={{ height: '100%', minHeight: 200 }}
  >
    <MusicNoteIcon sx={{ fontSize: 64, color: 'text.tertiary', mb: 2 }} />
    <Typography
      level="body-lg"
      sx={{ color: 'text.secondary', textAlign: 'center' }}
    >
      {hasSearch ? 'No tracks found' : 'No tracks loaded yet'}
    </Typography>
    <Typography
      level="body-sm"
      sx={{ color: 'text.tertiary', textAlign: 'center', mt: 1 }}
    >
      {hasSearch
        ? 'Try a different search term'
        : 'Configure your music library to start scanning for tracks'}
    </Typography>
  </Stack>
);
