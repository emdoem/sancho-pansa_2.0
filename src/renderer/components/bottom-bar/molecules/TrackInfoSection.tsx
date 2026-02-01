import { Stack } from '@mui/joy';
import { TrackThumbnail } from '../atoms/TrackThumbnail';
import { TrackInfo } from '../atoms/TrackInfo';

export const TrackInfoSection = () => (
  <Stack direction="row" alignItems="center" sx={{ width: '30%', gap: 2 }}>
    <TrackThumbnail />
    <TrackInfo />
  </Stack>
);
