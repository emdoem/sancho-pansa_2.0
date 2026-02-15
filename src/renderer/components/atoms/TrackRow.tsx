import { Box, Typography, IconButton, Checkbox } from '@mui/joy';
import EditIcon from '@mui/icons-material/Edit';
import type { Track } from '../../../types/electron';
import { mixins, layoutTokens } from '../../theme/utilities';

interface TrackRowProps {
  track: Track;
  onEdit: (track: Track) => void;
  getFileName: (filePath: string) => string;
  formatDuration: (seconds: number) => string;
  formatFileSize: (bytes: number) => string;
  showCheckbox?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (trackId: string) => void;
}

export const TrackRow = ({
  track,
  onEdit,
  getFileName,
  formatDuration,
  formatFileSize,
  showCheckbox = false,
  isSelected = false,
  onToggleSelect,
}: TrackRowProps) => (
  <Box
    sx={{
      width: '100%',
      height: layoutTokens.tableRowHeight,
      ...mixins.tableRowHover(),
    }}
  >
    {showCheckbox && (
      <Box sx={mixins.tableCheckboxCell()}>
        <Checkbox
          checked={isSelected}
          onChange={() => onToggleSelect?.(track.id)}
          size="sm"
        />
      </Box>
    )}
    <Box
      sx={{
        flex: showCheckbox ? '0 0 22%' : '0 0 25%',
        ...mixins.tableCell(),
      }}
    >
      <Typography level="body-md" sx={{ fontWeight: 500 }}>
        {track.title}
      </Typography>
    </Box>
    <Box
      sx={{
        flex: showCheckbox ? '0 0 13%' : '0 0 15%',
        ...mixins.tableCell(),
      }}
    >
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        {track.artist}
      </Typography>
    </Box>
    <Box
      sx={{
        flex: showCheckbox ? '0 0 13%' : '0 0 15%',
        ...mixins.tableCell(),
      }}
    >
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        {track.album}
      </Typography>
    </Box>
    <Box
      sx={{
        flex: showCheckbox ? '0 0 18%' : '0 0 20%',
        ...mixins.tableCell(),
      }}
    >
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        {getFileName(track.filePath)}
      </Typography>
    </Box>
    <Box
      sx={{
        flex: '0 0 5%',
        ...mixins.tableCell(),
      }}
    >
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        {track.bpm || '-'}
      </Typography>
    </Box>
    <Box
      sx={{
        flex: '0 0 8%',
        ...mixins.tableCell('right'),
      }}
    >
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        {formatDuration(track.duration)}
      </Typography>
    </Box>
    <Box
      sx={{
        flex: '0 0 7%',
        ...mixins.tableCell('right'),
      }}
    >
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        {formatFileSize(track.fileSize)}
      </Typography>
    </Box>
    <Box
      sx={{
        flex: '0 0 5%',
        ...mixins.tableCell(),
      }}
    >
      <IconButton size="sm" onClick={() => onEdit(track)}>
        <EditIcon />
      </IconButton>
    </Box>
  </Box>
);
