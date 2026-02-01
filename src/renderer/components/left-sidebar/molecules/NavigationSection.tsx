import { Stack } from '@mui/joy';
import { SectionTitle } from '../atoms/SectionTitle';
import { SidebarButton } from '../atoms/SidebarButton';

interface NavigationSectionProps {
  title: string;
  level?: 'title-lg' | 'title-md';
  buttons: {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    color?: 'primary' | 'neutral';
  }[];
}

export const NavigationSection = ({
  title,
  level = 'title-lg',
  buttons,
}: NavigationSectionProps) => (
  <Stack direction="column" gap={0.5} sx={{ mb: 3 }}>
    <SectionTitle level={level}>{title}</SectionTitle>
    {buttons.map((button, index) => (
      <SidebarButton
        key={index}
        icon={button.icon}
        onClick={button.onClick}
        color={button.color || 'neutral'}
      >
        {button.label}
      </SidebarButton>
    ))}
  </Stack>
);
