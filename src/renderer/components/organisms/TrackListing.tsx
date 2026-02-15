import { Box, Stack, Typography } from '@mui/joy';
import { useMemo } from 'react';
import { mixins } from '../../theme/utilities';
import { useMusicLibraryStore } from '../../stores/musicLibraryStore';
import { useModalFormStore } from '../../stores/modalFormStore';
import { useFilteredTracks } from '../../stores/musicLibraryStore';
import { useSearchDebounce } from '../../stores/useSearchDebounce';
import { getTrackTableColumns } from '../../utils/getTrackTableColumns';
import { EmptyState, LoadingState, SearchInput } from '../atoms';
import { SelectionToolbar } from '../atoms';
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

  const tableConfig = {
    showCheckboxes: !!showCheckboxes,
    selectedTrackIds: new Set(selectedTrackIds ?? []),
    isAllSelected:
      filteredTracks.length > 0 &&
      (selectedTrackIds?.length ?? 0) === filteredTracks.length,
    onToggleSelect: toggleSelect,
    onSelectAll: selectAll,
  };

  const columns = useMemo(
    () => getTrackTableColumns(showCheckboxes, openEditModal),
    [showCheckboxes, openEditModal]
  );

  const handleBulkEdit = () => {
    openBulkEditModal();
  };

  const handleCancelBulkEdit = () => {
    toggleBulkEditMode(false);
  };

  return (
    <Box
      sx={{
        ...mixins.cardContainer(),
        padding: 3,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography level="title-lg">
          Track Listing ({filteredTracks.length})
        </Typography>
        <SearchInput value={searchQuery} onChange={setSearchQuery} />
      </Stack>

      {showCheckboxes && (
        <SelectionToolbar
          selectedCount={selectedCount}
          onCancel={handleCancelBulkEdit}
          onBulkEdit={selectedCount > 0 ? handleBulkEdit : undefined}
        />
      )}

      {tracks === null || isLoadingTracks ? (
        <LoadingState />
      ) : filteredTracks.length === 0 ? (
        <EmptyState hasSearch={!!searchQuery} />
      ) : (
        <TrackTable
          tracks={filteredTracks}
          columns={columns}
          tableConfig={tableConfig}
        />
      )}
    </Box>
  );
};
