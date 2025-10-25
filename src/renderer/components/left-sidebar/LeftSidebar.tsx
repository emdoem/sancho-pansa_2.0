import { Button, Stack, Typography } from '@mui/joy';

export const LeftSidebar = () => {
  return (
    <Stack direction="column" sx={{ padding: 1 }}>
      <Stack direction="row" justifyContent="center" sx={{ width: '100%' }}>
        <Typography level="h3">LeftSidebar</Typography>
      </Stack>
      <Typography level="h4">Library Statistics</Typography>
      <Typography level="h4">Navigation Menu</Typography>
      <Button variant="soft">All Tracks</Button>
      <Button variant="soft">Artists</Button>
      <Button variant="soft">Albums</Button>
      <Button variant="soft">Playlists</Button>
      <Button variant="soft">Duplicates</Button>
      <Button variant="soft">Settings</Button>
    </Stack>
  );
};
