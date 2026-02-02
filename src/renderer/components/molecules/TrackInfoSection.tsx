import { Stack } from '@mui/joy';
import { TrackThumbnail, TrackInfo } from '../atoms';

export const TrackInfoSection = () => (
  <Stack direction="row" alignItems="center" sx={{ width: '30%', gap: 2 }}>
    <TrackThumbnail />
    <TrackInfo />
  </Stack>
);
