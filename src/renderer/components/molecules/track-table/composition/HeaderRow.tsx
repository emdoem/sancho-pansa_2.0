import { Box, Checkbox } from '@mui/joy';
import { mixins, layoutTokens } from '../../../../theme/utilities';
import type { Column } from '../TrackTable.types';

interface HeaderRowProps {
  columns: Column<any>[];
  showCheckboxes: boolean;
  isAllSelected: boolean;
  onSelectAll: () => void;
  minWidth: number;
}

export const HeaderRow = ({
  columns,
  showCheckboxes,
  isAllSelected,
  onSelectAll,
  minWidth,
}: HeaderRowProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        minWidth: `${minWidth}px`,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.level2',
        position: 'sticky',
        top: 0,
        zIndex: 3,
        height: `${layoutTokens.tableHeaderHeight}px`,
        // Important: Prevent flex from changing the height
        flexShrink: 0,
        // Ensure proper overflow handling
        overflow: 'visible',
        boxSizing: 'border-box',
      }}
    >
      {showCheckboxes && (
        <Box
          sx={{
            ...mixins.tableCheckboxCell(),
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            minWidth: '60px',
          }}
        >
          <Checkbox checked={isAllSelected} onChange={onSelectAll} size="sm" />
        </Box>
      )}
      {columns.map((column) => (
        <Box
          key={column.key}
          sx={{
            flex: `0 0 ${column.width}`,
            ...mixins.tableHeaderCell(column.align),
            height: '100%',
            minWidth: column.minWidth || 'auto',
            display: 'flex',
            alignItems: 'center',
            overflow: 'visible',
            flexShrink: 0,
          }}
        >
          <Box
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            {column.label}
          </Box>
        </Box>
      ))}
    </Box>
  );
};
