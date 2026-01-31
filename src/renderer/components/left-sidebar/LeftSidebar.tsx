import { Button, Stack, Typography, Divider } from '@mui/joy';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import PersonIcon from '@mui/icons-material/Person';
import AlbumIcon from '@mui/icons-material/Album';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';

export const LeftSidebar = () => {
  return (
    <Stack
      direction="column"
      sx={{
        width: 280,
        height: '100%',
        backgroundColor: 'background.level1',
        borderRight: '1px solid',
        borderColor: 'divider',
        padding: 2,
      }}
    >
      <Typography level="title-lg" sx={{ mb: 2, fontWeight: 600 }}>
        Library
      </Typography>

      <Stack direction="column" gap={0.5} sx={{ mb: 3 }}>
        <Button
          variant="soft"
          color="primary"
          startDecorator={<LibraryMusicIcon />}
          sx={{ justifyContent: 'flex-start' }}
        >
          All Tracks
        </Button>
        <Button
          variant="soft"
          color="neutral"
          startDecorator={<PersonIcon />}
          sx={{ justifyContent: 'flex-start' }}
        >
          Artists
        </Button>
        <Button
          variant="soft"
          color="neutral"
          startDecorator={<AlbumIcon />}
          sx={{ justifyContent: 'flex-start' }}
        >
          Albums
        </Button>
        <Button
          variant="soft"
          color="neutral"
          startDecorator={<PlaylistPlayIcon />}
          sx={{ justifyContent: 'flex-start' }}
        >
          Playlists
        </Button>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Typography level="title-md" sx={{ mb: 2, fontWeight: 600 }}>
        Tools
      </Typography>

      <Stack direction="column" gap={0.5} sx={{ mb: 3 }}>
        <Button
          variant="soft"
          color="neutral"
          startDecorator={<FileCopyIcon />}
          sx={{ justifyContent: 'flex-start' }}
        >
          Duplicates
        </Button>
        <Button
          variant="soft"
          color="neutral"
          startDecorator={<QueueMusicIcon />}
          sx={{ justifyContent: 'flex-start' }}
        >
          Import Playlist
        </Button>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      <Typography level="title-md" sx={{ mb: 2, fontWeight: 600 }}>
        Statistics
      </Typography>

      <Stack direction="column" gap={0.5} sx={{ mb: 3 }}>
        <Button
          variant="soft"
          color="neutral"
          startDecorator={<BarChartIcon />}
          sx={{ justifyContent: 'flex-start' }}
        >
          Library Stats
        </Button>
      </Stack>

      <Stack sx={{ mt: 'auto' }}>
        <Button
          variant="soft"
          color="neutral"
          startDecorator={<SettingsIcon />}
          sx={{ justifyContent: 'flex-start' }}
        >
          Settings
        </Button>
      </Stack>
    </Stack>
  );
};
