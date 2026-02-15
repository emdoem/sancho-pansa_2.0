import { Stack } from '@mui/joy';
import { PlaybackButton, ProgressSlider } from '../atoms';
import { mixins } from '../../theme/utilities';

export const PlaybackControls = () => (
  <Stack
    direction="column"
    sx={{ width: '40%', ...mixins.flexCenterVertical() }}
  >
    <Stack sx={{ gap: 2, mb: 1, ...mixins.flexCenter() }}>
      <PlaybackButton buttonType="shuffle" />
      <PlaybackButton buttonType="previous" />
      <PlaybackButton buttonType="play" />
      <PlaybackButton buttonType="next" />
      <PlaybackButton buttonType="repeat" />
    </Stack>
    <ProgressSlider disabled />
  </Stack>
);
