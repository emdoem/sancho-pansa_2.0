import { Typography } from '@mui/joy';

interface SectionTitleProps {
  level?: 'title-lg' | 'title-md';
  children: React.ReactNode;
}

export const SectionTitle = ({
  level = 'title-lg',
  children,
}: SectionTitleProps) => (
  <Typography level={level} sx={{ mb: 2, fontWeight: 600 }}>
    {children}
  </Typography>
);
