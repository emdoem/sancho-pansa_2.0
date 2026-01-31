import { Stack, Typography, IconButton, Slider, Box } from '@mui/joy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import RepeatIcon from '@mui/icons-material/Repeat';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

export const BottomBar = () => {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        height: 80,
        backgroundColor: 'background.surface',
        borderTop: '1px solid',
        borderColor: 'divider',
        padding: '0 20px',
      }}
    >
      <Stack direction="row" alignItems="center" sx={{ width: '30%', gap: 2 }}>
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
        <Stack direction="column">
          <Typography level="body-md" sx={{ fontWeight: 600 }}>
            No Track Playing
          </Typography>
          <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
            Select a track to play
          </Typography>
        </Stack>
      </Stack>

      <Stack direction="column" alignItems="center" sx={{ width: '40%' }}>
        <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 1 }}>
          <IconButton variant="plain" size="sm" color="neutral">
            <ShuffleIcon />
          </IconButton>
          <IconButton variant="plain" size="lg" color="neutral">
            <SkipPreviousIcon />
          </IconButton>
          <IconButton
            variant="solid"
            color="primary"
            size="lg"
            sx={{ borderRadius: '50%', width: 48, height: 48 }}
          >
            <PlayArrowIcon />
          </IconButton>
          <IconButton variant="plain" size="lg" color="neutral">
            <SkipNextIcon />
          </IconButton>
          <IconButton variant="plain" size="sm" color="neutral">
            <RepeatIcon />
          </IconButton>
        </Stack>
        <Stack
          direction="row"
          alignItems="center"
          sx={{ width: '100%', gap: 2 }}
        >
          <Typography level="body-xs" sx={{ minWidth: 40, textAlign: 'right' }}>
            0:00
          </Typography>
          <Slider size="sm" defaultValue={0} sx={{ flex: 1 }} disabled />
          <Typography level="body-xs" sx={{ minWidth: 40 }}>
            0:00
          </Typography>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="flex-end"
        sx={{ width: '30%', gap: 2 }}
      >
        <VolumeUpIcon sx={{ color: 'text.secondary' }} />
        <Slider size="sm" defaultValue={80} sx={{ width: 100 }} />
      </Stack>
    </Stack>
  );
};
