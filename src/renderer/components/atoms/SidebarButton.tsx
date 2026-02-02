import { Button, type ButtonProps } from '@mui/joy';

interface SidebarButtonProps extends ButtonProps {
  icon: React.ReactNode;
}

export const SidebarButton = ({
  icon,
  children,
  ...props
}: SidebarButtonProps) => (
  <Button
    variant="soft"
    color="neutral"
    startDecorator={icon}
    sx={{ justifyContent: 'flex-start' }}
    {...props}
  >
    {children}
  </Button>
);
