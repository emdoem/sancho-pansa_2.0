import { Box } from '@mui/joy';
import { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { mixins, layoutTokens } from '../../../theme/utilities';
import { HeaderRow } from './composition/HeaderRow';
import { VirtualizedRows } from './composition/VirtualizedRows';
import type { TrackTableProps } from './TrackTable.types';

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

  const tableMinWidth = useMemo(() => {
    const checkboxMinWidth = tableConfig.showCheckboxes ? 60 : 0;
    const checkboxPct = tableConfig.showCheckboxes ? 0.05 : 0;

    // Start with sum of all minWidths
    let M =
      columns.reduce((sum, col) => {
        return sum + parseInt(col.minWidth || '0', 10);
      }, 0) + checkboxMinWidth;

    // Iterate to find the fixed point where container width equals
    // the sum of all flex item widths (some use percentage, some minWidth)
    for (let i = 0; i < 20; i++) {
      let total = 0;
      if (tableConfig.showCheckboxes) {
        total += Math.max(checkboxPct * M, 60);
      }
      columns.forEach((col) => {
        const pct = parseFloat(col.width || '0') / 100;
        const minW = parseInt(col.minWidth || '0', 10);
        total += Math.max(pct * M, minW);
      });

      if (Math.abs(total - M) < 0.5) break;
      M = total;
    }

    return Math.ceil(M);
  }, [columns, tableConfig.showCheckboxes]);

  return (
    <Box
      ref={parentRef}
      sx={{
        borderRadius: 2,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        ...mixins.borderDefault(),
        overflow: 'auto',
      }}
    >
      <HeaderRow
        columns={columns}
        showCheckboxes={tableConfig.showCheckboxes}
        isAllSelected={tableConfig.isAllSelected}
        onSelectAll={tableConfig.onSelectAll}
        minWidth={tableMinWidth}
      />
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'visible',
          minWidth: `${tableMinWidth}px`,
        }}
      >
        <VirtualizedRows
          tracks={tracks}
          items={items}
          columns={columns}
          tableConfig={tableConfig}
          rowVirtualizer={rowVirtualizer}
          minWidth={tableMinWidth}
        />
      </Box>
    </Box>
  );
};
