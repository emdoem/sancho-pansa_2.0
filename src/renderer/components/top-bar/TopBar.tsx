import { IconButton, Stack, Typography } from '@mui/joy';

export const TopBar = () => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ padding: 1 }}
    >
      <Stack direction="row" justifyContent="center" sx={{ width: '100%' }}>
        <Typography level="h2">Sancho Pansa</Typography>
      </Stack>
      <Stack direction="row" gap={1}>
        <IconButton variant="soft">Sync</IconButton>
        <IconButton variant="soft">Settings</IconButton>
      </Stack>
    </Stack>
  );
};
