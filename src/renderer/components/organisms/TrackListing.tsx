import { Box, Stack, Typography, Button, Sheet } from '@mui/joy';
import type { Track } from '../../../types/electron';
import { EmptyState, LoadingState } from '../atoms';
import { SearchInput } from '../atoms';
import { TrackTable } from '../molecules';

interface TrackListingProps {
  tracks: Track[] | null;
  isLoading: boolean;
  searchQuery: string;
  filteredTracks: Track[];
  onSearchChange: (value: string) => void;
  onEditTrack: (track: Track) => void;
  getFileName: (filePath: string) => string;
  formatDuration: (seconds: number) => string;
  formatFileSize: (bytes: number) => string;
  showCheckboxes?: boolean;
  selectedTrackIds?: Set<string>;
  onToggleSelect?: (trackId: string) => void;
  onSelectAll?: () => void;
  onBulkEdit?: () => void;
}

export const TrackListing = ({
  tracks,
  isLoading,
  searchQuery,
  filteredTracks,
  onSearchChange,
  onEditTrack,
  getFileName,
  formatDuration,
  formatFileSize,
  showCheckboxes = false,
  selectedTrackIds = new Set(),
  onToggleSelect,
  onSelectAll,
  onBulkEdit,
}: TrackListingProps) => {
  const selectedCount = selectedTrackIds.size;

  return (
    <Box
      sx={{
        backgroundColor: 'background.level1',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        padding: 3,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography level="title-lg" sx={{ fontWeight: 600 }}>
          Track Listing ({filteredTracks.length})
        </Typography>
        <SearchInput value={searchQuery} onChange={onSearchChange} />
      </Stack>

      {showCheckboxes && selectedCount > 0 && (
        <Sheet
          variant="soft"
          color="primary"
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 'sm',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography level="body-md" sx={{ fontWeight: 600 }}>
            {selectedCount} track{selectedCount !== 1 ? 's' : ''} selected
          </Typography>
          <Button onClick={onBulkEdit} size="sm">
            Bulk Edit
          </Button>
        </Sheet>
      )}

      {tracks === null || isLoading ? (
        <LoadingState />
      ) : filteredTracks.length === 0 ? (
        <EmptyState hasSearch={!!searchQuery} />
      ) : (
        <TrackTable
          tracks={filteredTracks}
          onEditTrack={onEditTrack}
          getFileName={getFileName}
          formatDuration={formatDuration}
          formatFileSize={formatFileSize}
          showCheckboxes={showCheckboxes}
          selectedTrackIds={selectedTrackIds}
          onToggleSelect={onToggleSelect}
          onSelectAll={onSelectAll}
        />
      )}
    </Box>
  );
};
