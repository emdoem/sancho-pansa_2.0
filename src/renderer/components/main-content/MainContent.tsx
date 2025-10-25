import { Button, Stack, Typography } from '@mui/joy';

export const MainContent = () => {
  return (
    <Stack
      direction="column"
      sx={{ width: '100%', height: '100%', padding: 1 }}
      alignItems="stretch"
    >
      <Stack direction="row" justifyContent="center" sx={{ width: '100%' }}>
        <Typography level="h3">MainContent</Typography>
      </Stack>
      <Stack direction="column" gap={1}>
        <Typography level="h4">Track Listing</Typography>
        <Stack direction="row" gap={1}>
          <Button variant="soft">Scan for Duplicates</Button>
          <Button variant="soft">Rename Files</Button>
          <Button variant="soft">Import Playlist</Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
