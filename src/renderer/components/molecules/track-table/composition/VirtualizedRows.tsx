import { Box, Checkbox } from '@mui/joy';
import type { TableConfig } from '../TrackTable.types';
import type { Column } from '../TrackTable.types';
import { mixins, layoutTokens } from '../../../../theme/utilities';

interface VirtualizedRowsProps {
  tracks: any[];
  items: any[];
  columns: Column<any>[];
  tableConfig: TableConfig;
  rowVirtualizer: any;
}

export const VirtualizedRows = ({
  tracks,
  items,
  columns,
  tableConfig,
  rowVirtualizer,
}: VirtualizedRowsProps) => {
  return (
    <Box
      sx={{
        // Account for BOTH header heights (TrackListing + TrackTable)
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
        marginTop: `${layoutTokens.tableHeaderHeight * 2}px`,
      }}
    >
      {items.map((virtualRow: any) => (
        <Box
          key={virtualRow.key}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${virtualRow.size}px`,
            transform: `translateY(${virtualRow.start}px)`,
            ...mixins.tableRowHover(),
          }}
        >
          {tableConfig.showCheckboxes && (
            <Box
              sx={{
                ...mixins.tableCheckboxCell(),
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Checkbox
                checked={tableConfig.selectedTrackIds.has(
                  tracks[virtualRow.index].id
                )}
                onChange={() =>
                  tableConfig.onToggleSelect(tracks[virtualRow.index].id)
                }
                size="sm"
              />
            </Box>
          )}
          {columns.map((column) => (
            <Box
              key={column.key}
              sx={{
                flex: `0 0 ${column.width}`,
                ...mixins.tableCell(column.align),
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%',
                }}
              >
                {column.render?.(tracks[virtualRow.index])}
              </Box>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};
