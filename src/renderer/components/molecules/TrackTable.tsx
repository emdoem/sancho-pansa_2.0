import { Box, Checkbox } from '@mui/joy';
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Track } from '../../types/electron';

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
    estimateSize: () => 52,
    overscan: 10,
  });

  const items = rowVirtualizer.getVirtualItems();

  const getWidthAlign = (align: 'left' | 'center' | 'right' = 'left') => {
    return {
      alignItems: 'center',
      justifyContent:
        align === 'center'
          ? 'center'
          : align === 'right'
            ? 'flex-end'
            : 'flex-start',
    };
  };

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        height: '650px',
        display: 'flex',
        flexDirection: 'column',
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
          <Box
            sx={{
              flex: '0 0 5%',
              padding: '12px',
              fontWeight: 600,
              color: 'text.primary',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
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
              padding: '12px',
              fontWeight: 600,
              color: 'text.primary',
              ...getWidthAlign(column.align),
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
                display: 'flex',
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'rgba(76, 175, 80, 0.08)',
                },
              }}
            >
              {tableConfig.showCheckboxes && (
                <Box
                  sx={{
                    flex: '0 0 5%',
                    padding: '12px',
                    display: 'flex',
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
                    padding: '12px',
                    ...getWidthAlign(column.align),
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
