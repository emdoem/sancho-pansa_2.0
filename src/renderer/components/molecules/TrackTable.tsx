import { Box, Checkbox } from '@mui/joy';
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Track } from '../../types/electron';
import { mixins, layoutTokens } from '../../theme/utilities';

export interface Column<T> {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
}

interface TableConfig {
  showCheckboxes: boolean;
  selectedTrackIds: Set<string>;
  isAllSelected: boolean;
  onToggleSelect: (trackId: string) => void;
  onSelectAll: () => void;
}

interface TrackTableProps {
  tracks: Track[];
  columns: Column<Track>[];
  tableConfig: TableConfig;
}

export const TrackTable = ({
  tracks,
  columns,
  tableConfig,
}: TrackTableProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: tracks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => layoutTokens.tableRowHeight,
    overscan: 10,
  });

  const items = rowVirtualizer.getVirtualItems();

  return (
    <Box
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        height: '650px',
        display: 'flex',
        flexDirection: 'column',
        ...mixins.borderDefault(),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.level2',
        }}
      >
        {tableConfig.showCheckboxes && (
          <Box sx={mixins.tableCheckboxCell()}>
            <Checkbox
              checked={tableConfig.isAllSelected}
              onChange={tableConfig.onSelectAll}
              size="sm"
            />
          </Box>
        )}
        {columns.map((column) => (
          <Box
            key={column.key}
            sx={{
              flex: `0 0 ${column.width}`,
              ...mixins.tableHeaderCell(column.align),
            }}
          >
            {column.label}
          </Box>
        ))}
      </Box>
      <Box
        ref={parentRef}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {items.map((virtualRow) => (
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
                <Box sx={mixins.tableCheckboxCell()}>
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
                  }}
                >
                  {column.render?.(tracks[virtualRow.index])}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
