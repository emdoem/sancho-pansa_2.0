import { Stack } from '@mui/joy';
import { VolumeSlider } from '../atoms/VolumeSlider';

export const VolumeControl = () => (
  <Stack
    direction="row"
    alignItems="center"
    justifyContent="flex-end"
    sx={{ width: '30%', gap: 2 }}
  >
    <VolumeSlider />
  </Stack>
);
