import { Stack, Typography, CircularProgress } from '@mui/joy';

export const LoadingState = () => (
  <Stack
    direction="column"
    alignItems="center"
    justifyContent="center"
    sx={{ height: '100%', minHeight: 200 }}
  >
    <CircularProgress size="lg" />
    <Typography level="body-md" sx={{ color: 'text.secondary', mt: 2 }}>
      Loading tracks...
    </Typography>
  </Stack>
);
