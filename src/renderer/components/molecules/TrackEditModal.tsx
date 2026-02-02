import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControl,
  FormLabel,
  Input,
} from '@mui/joy';

interface TrackEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    title: string;
    artist: string;
    album: string;
    bpm: string;
  };
  onFormChange: (form: {
    title: string;
    artist: string;
    album: string;
    bpm: string;
  }) => void;
  onSave: () => void;
}

export const TrackEditModal = ({
  isOpen,
  onClose,
  form,
  onFormChange,
  onSave,
}: TrackEditModalProps) => (
  <Modal open={isOpen} onClose={onClose}>
    <ModalDialog sx={{ minWidth: 400 }}>
      <DialogTitle>Edit Track</DialogTitle>
      <DialogContent>
        <Stack direction="column" gap={2}>
          <FormControl>
            <FormLabel>Title</FormLabel>
            <Input
              value={form.title}
              onChange={(e) => onFormChange({ ...form, title: e.target.value })}
              placeholder="Enter track title"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Artist</FormLabel>
            <Input
              value={form.artist}
              onChange={(e) =>
                onFormChange({ ...form, artist: e.target.value })
              }
              placeholder="Enter artist name"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Album</FormLabel>
            <Input
              value={form.album}
              onChange={(e) => onFormChange({ ...form, album: e.target.value })}
              placeholder="Enter album name"
            />
          </FormControl>
          <FormControl>
            <FormLabel>BPM</FormLabel>
            <Input
              type="number"
              value={form.bpm}
              onChange={(e) => onFormChange({ ...form, bpm: e.target.value })}
              placeholder="Enter BPM"
            />
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="plain" color="neutral" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onSave}>Save</Button>
      </DialogActions>
    </ModalDialog>
  </Modal>
);
