import { Box, Typography, IconButton, Checkbox } from '@mui/joy';
import EditIcon from '@mui/icons-material/Edit';
import type { Track } from '../../../types/electron';

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
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      height: '52px',
      borderBottom: '1px solid',
      borderColor: 'divider',
      overflow: 'hidden',
      '&:hover': {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
      },
    }}
  >
    {showCheckbox && (
      <Box
        sx={{
          flex: '0 0 5%',
          padding: '12px',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
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
        padding: '12px',
        overflow: 'hidden',
      }}
    >
      <Typography level="body-md" sx={{ fontWeight: 500 }}>
        {track.title}
      </Typography>
    </Box>
    <Box
      sx={{
        flex: showCheckbox ? '0 0 13%' : '0 0 15%',
        padding: '12px',
        overflow: 'hidden',
      }}
    >
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        {track.artist}
      </Typography>
    </Box>
    <Box
      sx={{
        flex: showCheckbox ? '0 0 13%' : '0 0 15%',
        padding: '12px',
        overflow: 'hidden',
      }}
    >
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        {track.album}
      </Typography>
    </Box>
    <Box
      sx={{
        flex: showCheckbox ? '0 0 18%' : '0 0 20%',
        padding: '12px',
        overflow: 'hidden',
      }}
    >
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        {getFileName(track.filePath)}
      </Typography>
    </Box>
    <Box
      sx={{
        flex: '0 0 5%',
        padding: '12px',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        {track.bpm || '-'}
      </Typography>
    </Box>
    <Box
      sx={{
        flex: '0 0 8%',
        padding: '12px',
        textAlign: 'right',
        overflow: 'hidden',
      }}
    >
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        {formatDuration(track.duration)}
      </Typography>
    </Box>
    <Box
      sx={{
        flex: '0 0 7%',
        padding: '12px',
        textAlign: 'right',
        overflow: 'hidden',
      }}
    >
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        {formatFileSize(track.fileSize)}
      </Typography>
    </Box>
    <Box
      sx={{
        flex: '0 0 5%',
        padding: '12px',
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <IconButton size="sm" onClick={() => onEdit(track)}>
        <EditIcon />
      </IconButton>
    </Box>
  </Box>
);
