import { Box, Checkbox } from '@mui/joy';
import { mixins } from '../../theme/utilities';

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
}: TrackTableHeaderProps) => {
  const align =
    textAlign === 'right'
      ? 'right'
      : textAlign === 'center'
        ? 'center'
        : 'left';
  return (
    <Box
      sx={{
        flex: `0 0 ${flex}`,
        ...mixins.tableHeaderCell(align),
      }}
    >
      {showCheckbox ? (
        <Checkbox checked={isAllSelected} onChange={onSelectAll} size="sm" />
      ) : (
        label
      )}
    </Box>
  );
};
