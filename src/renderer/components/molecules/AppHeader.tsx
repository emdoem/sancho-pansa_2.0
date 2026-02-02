import { Stack } from '@mui/joy';
import { AppTitle, ActionIconButton } from '../atoms';

interface AppHeaderProps {
  title?: string;
  actions: { icon: React.ReactNode; label: string; onClick?: () => void }[];
}

export const AppHeader = ({ title, actions }: AppHeaderProps) => (
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
      <AppTitle title={title} />
    </Stack>
    <Stack direction="row" gap={1} sx={{ marginLeft: 'auto' }}>
      {actions.map((action, index) => (
        <ActionIconButton
          key={index}
          icon={action.icon}
          label={action.label}
          onClick={action.onClick}
        />
      ))}
    </Stack>
  </Stack>
);
