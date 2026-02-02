import { Box } from '@mui/joy';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

export const TrackThumbnail = () => (
  <Box
    sx={{
      width: 48,
      height: 48,
      backgroundColor: 'background.level1',
      borderRadius: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <MusicNoteIcon sx={{ color: 'text.tertiary' }} />
  </Box>
);
