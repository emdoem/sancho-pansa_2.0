import { Typography } from '@mui/joy';

export const AppTitle = ({ title = 'Sancho Pansa' }: { title?: string }) => (
  <Typography level="h2" sx={{ fontSize: '1.5rem' }}>
    {title}
  </Typography>
);
