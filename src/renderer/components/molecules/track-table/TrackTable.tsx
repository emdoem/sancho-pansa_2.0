import { Box } from '@mui/joy';
import { useRef } from 'react';
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

  return (
    <Box
      sx={{
        borderRadius: 2,
        height: '650px',
        display: 'flex',
        flexDirection: 'column',
        ...mixins.borderDefault(),
        overflow: 'visible',
      }}
    >
      <HeaderRow
        columns={columns}
        showCheckboxes={tableConfig.showCheckboxes}
        isAllSelected={tableConfig.isAllSelected}
        onSelectAll={tableConfig.onSelectAll}
      />
      <Box
        ref={parentRef}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
        }}
      >
        <VirtualizedRows
          tracks={tracks}
          items={items}
          columns={columns}
          tableConfig={tableConfig}
          rowVirtualizer={rowVirtualizer}
        />
      </Box>
    </Box>
  );
};
