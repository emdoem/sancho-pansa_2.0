import { Box, Stack, Typography, Button, Sheet } from '@mui/joy';
import { useMusicLibraryStore } from '../../stores/musicLibraryStore';
import { useModalFormStore } from '../../stores/modalFormStore';
import { useFilteredTracks } from '../../stores/musicLibraryStore';
import { useSearchDebounce } from '../../stores/useSearchDebounce';
import {
  formatDuration,
  formatFileSize,
  getFileName,
} from '../../utils/formatting';
import { EmptyState, LoadingState } from '../atoms';
import { SearchInput } from '../atoms';
import type { Track } from '../../types/electron';
import { TrackTable } from '../molecules';

export const TrackListing = () => {
  const { tracks, isLoadingTracks, searchQuery, setSearchQuery } =
    useMusicLibraryStore();
  const {
    openEditModal,
    showCheckboxes,
    selectedTrackIds,
    toggleSelect,
    selectAll,
    openBulkEditModal,
    toggleBulkEditMode,
  } = useModalFormStore();

  useSearchDebounce();
  const filteredTracks = useFilteredTracks();
  const selectedCount = selectedTrackIds?.length ?? 0;

  const handleEditTrack = (track: Track) => {
    openEditModal(track);
  };

  const handleToggleSelect = (trackId: string) => {
    toggleSelect(trackId);
  };

  const handleSelectAll = () => {
    selectAll();
  };

  const handleBulkEdit = () => {
    openBulkEditModal();
  };

  const handleCancelBulkEdit = () => {
    toggleBulkEditMode(false);
  };

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
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </Stack>

      {showCheckboxes && (
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
          <Stack direction="row" gap={2}>
            <Button onClick={handleCancelBulkEdit} size="sm" color="danger">
              Cancel
            </Button>
            {selectedCount > 0 && (
              <Button onClick={handleBulkEdit} size="sm">
                Bulk Edit
              </Button>
            )}
          </Stack>
        </Sheet>
      )}

      {tracks === null || isLoadingTracks ? (
        <LoadingState />
      ) : filteredTracks.length === 0 ? (
        <EmptyState hasSearch={!!searchQuery} />
      ) : (
        <TrackTable
          tracks={filteredTracks}
          onEditTrack={handleEditTrack}
          getFileName={getFileName}
          formatDuration={formatDuration}
          formatFileSize={formatFileSize}
          showCheckboxes={showCheckboxes}
          selectedTrackIds={new Set(selectedTrackIds ?? [])}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
        />
      )}
    </Box>
  );
};
