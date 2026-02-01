import { Stack, Divider } from '@mui/joy';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import PersonIcon from '@mui/icons-material/Person';
import AlbumIcon from '@mui/icons-material/Album';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import { NavigationSection } from './molecules/NavigationSection';

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
      <NavigationSection
        title="Library"
        buttons={[
          { icon: <LibraryMusicIcon />, label: 'All Tracks', color: 'primary' },
          { icon: <PersonIcon />, label: 'Artists' },
          { icon: <AlbumIcon />, label: 'Albums' },
          { icon: <PlaylistPlayIcon />, label: 'Playlists' },
        ]}
      />

      <Divider sx={{ mb: 3 }} />

      <NavigationSection
        title="Tools"
        level="title-md"
        buttons={[
          { icon: <FileCopyIcon />, label: 'Duplicates' },
          { icon: <QueueMusicIcon />, label: 'Import Playlist' },
        ]}
      />

      <Divider sx={{ mb: 3 }} />

      <NavigationSection
        title="Statistics"
        level="title-md"
        buttons={[{ icon: <BarChartIcon />, label: 'Library Stats' }]}
      />

      <Stack sx={{ mt: 'auto' }}>
        <NavigationSection
          title=""
          buttons={[{ icon: <SettingsIcon />, label: 'Settings' }]}
        />
      </Stack>
    </Stack>
  );
};
