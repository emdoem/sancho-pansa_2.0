import { Stack } from '@mui/joy';
import {
  TrackInfoSection,
  PlaybackControls,
  VolumeControl,
} from '../molecules';
import { mixins } from '../../theme/utilities';

export const BottomBar = () => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      sx={{
        height: 80,
        backgroundColor: 'background.surface',
        borderTop: '1px solid',
        borderColor: 'divider',
        padding: '0 20px',
        ...mixins.flexCenter(),
      }}
    >
      <TrackInfoSection />
      <PlaybackControls />
      <VolumeControl />
    </Stack>
  );
};
