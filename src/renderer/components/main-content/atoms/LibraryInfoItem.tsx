import { Stack, Typography } from '@mui/joy';

interface LibraryInfoItemProps {
  label: string;
  value: string | number;
  flex?: string;
}

export const LibraryInfoItem = ({
  label,
  value,
  flex = '1 1 150px',
}: LibraryInfoItemProps) => (
  <Stack direction="column" sx={{ flex }}>
    <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 0.5 }}>
      {label}
    </Typography>
    <Typography level="body-md" sx={{ fontWeight: 500 }}>
      {value}
    </Typography>
  </Stack>
);
