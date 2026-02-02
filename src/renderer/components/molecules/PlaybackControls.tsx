import { Stack } from '@mui/joy';
import { PlaybackButton, ProgressSlider } from '../atoms';

export const PlaybackControls = () => (
  <Stack direction="column" alignItems="center" sx={{ width: '40%' }}>
    <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 1 }}>
      <PlaybackButton buttonType="shuffle" />
      <PlaybackButton buttonType="previous" />
      <PlaybackButton buttonType="play" />
      <PlaybackButton buttonType="next" />
      <PlaybackButton buttonType="repeat" />
    </Stack>
    <ProgressSlider disabled />
  </Stack>
);
