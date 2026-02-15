import { Stack } from '@mui/joy';
import { TrackThumbnail, TrackInfo } from '../atoms';
import { mixins } from '../../theme/utilities';

export const TrackInfoSection = () => (
  <Stack sx={{ width: '30%', gap: 2, ...mixins.flexCenter() }}>
    <TrackThumbnail />
    <TrackInfo />
  </Stack>
);
