import { IconButton, Stack, Typography } from '@mui/joy';
import SyncIcon from '@mui/icons-material/Sync';
import SettingsIcon from '@mui/icons-material/Settings';

export const TopBar = () => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        padding: '12px 16px',
        backgroundColor: 'background.surface',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" alignItems="center" sx={{ width: '100%' }}>
        <Typography level="h2" sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
          Sancho Pansa
        </Typography>
      </Stack>
      <Stack direction="row" gap={1} sx={{ marginLeft: 'auto' }}>
        <IconButton variant="soft" aria-label="Sync">
          <SyncIcon />
        </IconButton>
        <IconButton variant="soft" aria-label="Settings">
          <SettingsIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
};
