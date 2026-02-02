import { Button } from '@mui/joy';

interface QuickActionButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  color?: 'primary' | 'neutral' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
}

export const QuickActionButton = ({
  label,
  icon,
  onClick,
  color = 'neutral',
  disabled = false,
}: QuickActionButtonProps) => (
  <Button
    variant="soft"
    color={color}
    startDecorator={icon}
    onClick={onClick}
    disabled={disabled}
    sx={{ flex: 1, whiteSpace: 'normal', textAlign: 'center' }}
  >
    {label}
  </Button>
);
