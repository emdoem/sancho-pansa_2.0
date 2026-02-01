import { Stack } from '@mui/joy';
import { TrackInfoSection } from './molecules/TrackInfoSection';
import { PlaybackControls } from './molecules/PlaybackControls';
import { VolumeControl } from './molecules/VolumeControl';

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
      <TrackInfoSection />
      <PlaybackControls />
      <VolumeControl />
    </Stack>
  );
};
