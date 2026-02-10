import { Box } from '@mui/joy';
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Track } from '../../types/electron';
import { TrackTableHeader, TrackRow } from '../atoms';

interface TrackTableProps {
  tracks: Track[];
  onEditTrack: (track: Track) => void;
  getFileName: (filePath: string) => string;
  formatDuration: (seconds: number) => string;
  formatFileSize: (bytes: number) => string;
  showCheckboxes?: boolean;
  selectedTrackIds?: Set<string>;
  onToggleSelect?: (trackId: string) => void;
  onSelectAll?: () => void;
}

export const TrackTable = ({
  tracks,
  onEditTrack,
  getFileName,
  formatDuration,
  formatFileSize,
  showCheckboxes = false,
  selectedTrackIds = new Set(),
  onToggleSelect,
  onSelectAll,
}: TrackTableProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: tracks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 10,
  });

  const items = rowVirtualizer.getVirtualItems();
  const isAllSelected =
    tracks.length > 0 &&
    tracks.every((track) => selectedTrackIds.has(track.id));

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
        {showCheckboxes && (
          <TrackTableHeader
            flex="5%"
            textAlign="center"
            showCheckbox
            isAllSelected={isAllSelected}
            onSelectAll={onSelectAll}
          />
        )}
        <TrackTableHeader label="Title" flex={showCheckboxes ? '22%' : '25%'} />
        <TrackTableHeader
          label="Artist"
          flex={showCheckboxes ? '13%' : '15%'}
        />
        <TrackTableHeader label="Album" flex={showCheckboxes ? '13%' : '15%'} />
        <TrackTableHeader
          label="File Name"
          flex={showCheckboxes ? '18%' : '20%'}
        />
        <TrackTableHeader label="BPM" flex="5%" textAlign="center" />
        <TrackTableHeader label="Duration" flex="8%" textAlign="right" />
        <TrackTableHeader label="Size" flex="7%" textAlign="right" />
        <TrackTableHeader label="Actions" flex="5%" textAlign="center" />
      </Box>
      <Box
        ref={parentRef}
        sx={{
          height: '600px',
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
                transform: 'translateY(' + virtualRow.start + 'px)',
              }}
            >
              <TrackRow
                track={tracks[virtualRow.index]}
                onEdit={onEditTrack}
                getFileName={getFileName}
                formatDuration={formatDuration}
                formatFileSize={formatFileSize}
                showCheckbox={showCheckboxes}
                isSelected={selectedTrackIds.has(tracks[virtualRow.index].id)}
                onToggleSelect={onToggleSelect}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
