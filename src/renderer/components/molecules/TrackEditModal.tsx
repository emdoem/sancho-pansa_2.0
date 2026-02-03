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
import { trackEditFormFields } from './TrackEditModal.consts';

interface TrackEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: {
    title: string;
    artist: string;
    albumArtist: string;
    album: string;
    bpm: string;
  };
  onFormChange: (form: {
    title: string;
    artist: string;
    albumArtist: string;
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
          {trackEditFormFields.map((field) => (
            <FormControl key={field.key}>
              <FormLabel>{field.label}</FormLabel>
              <Input
                value={form[field.key as keyof typeof form]}
                onChange={(e) =>
                  onFormChange({
                    ...form,
                    [field.key]: e.target.value,
                  })
                }
                placeholder={field.placeholder}
              />
            </FormControl>
          ))}          
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
