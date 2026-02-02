import { Box } from '@mui/joy';

interface TrackTableHeaderProps {
  label: string;
  flex: string;
  textAlign?: 'left' | 'center' | 'right';
}

export const TrackTableHeader = ({
  label,
  flex,
  textAlign = 'left',
}: TrackTableHeaderProps) => (
  <Box
    sx={{
      flex: `0 0 ${flex}`,
      padding: '12px',
      fontWeight: 600,
      color: 'text.primary',
      textAlign,
    }}
  >
    {label}
  </Box>
);
