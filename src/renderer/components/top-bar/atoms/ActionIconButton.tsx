import { IconButton, type IconButtonProps } from '@mui/joy';

interface ActionIconButtonProps extends Omit<IconButtonProps, 'children'> {
  icon: React.ReactNode;
  label: string;
}

export const ActionIconButton = ({
  icon,
  label,
  ...props
}: ActionIconButtonProps) => (
  <IconButton variant="soft" aria-label={label} {...props}>
    {icon}
  </IconButton>
);
