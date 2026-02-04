import { Box, Checkbox } from '@mui/joy';

interface TrackTableHeaderProps {
  label?: string;
  flex: string;
  textAlign?: 'left' | 'center' | 'right';
  showCheckbox?: boolean;
  isAllSelected?: boolean;
  onSelectAll?: () => void;
}

export const TrackTableHeader = ({
  label,
  flex,
  textAlign = 'left',
  showCheckbox = false,
  isAllSelected = false,
  onSelectAll,
}: TrackTableHeaderProps) => (
  <Box
    sx={{
      flex: `0 0 ${flex}`,
      padding: '12px',
      fontWeight: 600,
      color: 'text.primary',
      textAlign,
      display: 'flex',
      alignItems: 'center',
      justifyContent:
        textAlign === 'center'
          ? 'center'
          : textAlign === 'right'
            ? 'flex-end'
            : 'flex-start',
    }}
  >
    {showCheckbox ? (
      <Checkbox checked={isAllSelected} onChange={onSelectAll} size="sm" />
    ) : (
      label
    )}
  </Box>
);
