import { Box, Stack, Typography } from '@mui/joy';
import type { Track } from '../../../types/electron';
import { SearchInput, EmptyState, LoadingState } from '../atoms';
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
}: TrackListingProps) => (
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
      />
    )}
  </Box>
);
