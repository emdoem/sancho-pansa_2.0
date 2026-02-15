import { Typography, IconButton } from '@mui/joy';
import EditIcon from '@mui/icons-material/Edit';
import { formatDuration, formatFileSize, getFileName } from './formatting';
import type { Column } from '../components/molecules/TrackTable';
import type { Track } from '../types/electron';

export const getTrackTableColumns = (
  showCheckboxes: boolean,
  onEditTrack: (track: Track) => void
): Column<Track>[] => [
  {
    key: 'title',
    label: 'Title',
    width: showCheckboxes ? '22%' : '25%',
    align: 'left',
    render: (track) => (
      <Typography level="body-md" sx={{ fontWeight: 500 }}>
        {track.title}
      </Typography>
    ),
  },
  {
    key: 'artist',
    label: 'Artist',
    width: showCheckboxes ? '13%' : '15%',
    align: 'left',
    render: (track) => (
      <Typography
        level="body-sm"
        sx={{ '& .MuiTypography-root': { color: 'text.secondary' } }}
      >
        {track.artist}
      </Typography>
    ),
  },
  {
    key: 'album',
    label: 'Album',
    width: showCheckboxes ? '13%' : '15%',
    align: 'left',
    render: (track) => (
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        {track.artist}
      </Typography>
    ),
  },
  {
    key: 'fileName',
    label: 'File Name',
    width: showCheckboxes ? '16%' : '18%',
    align: 'left',
    render: (track) => (
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        {getFileName(track.filePath)}
      </Typography>
    ),
  },
  {
    key: 'bpm',
    label: 'BPM',
    width: '7%',
    align: 'center',
    render: (track) => (
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        {track.bpm || '-'}
      </Typography>
    ),
  },
  {
    key: 'duration',
    label: 'Length',
    width: '8%',
    align: 'right',
    render: (track) => (
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        {formatDuration(track.duration)}
      </Typography>
    ),
  },
  {
    key: 'size',
    label: 'Size',
    width: '7%',
    align: 'right',
    render: (track) => (
      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        {formatFileSize(track.fileSize)}
      </Typography>
    ),
  },
  {
    key: 'actions',
    label: ' ',
    width: '5%',
    align: 'center',
    render: (track) => (
      <IconButton size="sm" onClick={() => onEditTrack(track)}>
        <EditIcon />
      </IconButton>
    ),
  },
];
