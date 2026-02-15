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
import { useModalFormStore } from '../../stores/modalFormStore';
import { trackEditFormFields } from './TrackEditModal.consts';
import { modalSizes } from '../../theme/utilities';

interface TrackEditModalProps {
  isOpen: boolean;
}

export const TrackEditModal = ({ isOpen }: TrackEditModalProps) => {
  const { editForm, setEditForm, saveTrack, closeEditModal } =
    useModalFormStore();

  return (
    <Modal open={isOpen} onClose={closeEditModal}>
      <ModalDialog sx={modalSizes.small}>
        <DialogTitle>Edit Track</DialogTitle>
        <DialogContent>
          <Stack direction="column" gap={2}>
            {trackEditFormFields.map((field) => (
              <FormControl key={field.key}>
                <FormLabel>{field.label}</FormLabel>
                <Input
                  value={editForm[field.key as keyof typeof editForm]}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
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
          <Button variant="plain" color="neutral" onClick={closeEditModal}>
            Cancel
          </Button>
          <Button onClick={saveTrack}>Save</Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};
