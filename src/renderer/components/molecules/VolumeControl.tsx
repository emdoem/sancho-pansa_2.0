import { Stack } from '@mui/joy';
import { VolumeSlider } from '../atoms';
import { mixins } from '../../theme/utilities';

export const VolumeControl = () => (
  <Stack
    justifyContent="flex-end"
    sx={{ width: '30%', gap: 2, ...mixins.flexCenter() }}
  >
    <VolumeSlider />
  </Stack>
);
