import SyncIcon from '@mui/icons-material/Sync';
import SettingsIcon from '@mui/icons-material/Settings';
import { AppHeader } from '../molecules';

export const TopBar = () => {
  return (
    <AppHeader
      title="Sancho Pansa"
      actions={[
        { icon: <SyncIcon />, label: 'Sync' },
        { icon: <SettingsIcon />, label: 'Settings' },
      ]}
    />
  );
};
