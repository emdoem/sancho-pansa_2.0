import { Stack, Typography } from '@mui/joy';

interface TrackInfoProps {
  title?: string;
  artist?: string;
}

export const TrackInfo = ({
  title = 'No Track Playing',
  artist = 'Select a track to play',
}: TrackInfoProps) => (
  <Stack direction="column">
    <Typography level="body-md" sx={{ fontWeight: 600 }}>
      {title}
    </Typography>
    <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
      {artist}
    </Typography>
  </Stack>
);
