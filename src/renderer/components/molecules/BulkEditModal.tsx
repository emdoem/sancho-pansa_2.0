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
  Typography,
} from '@mui/joy';
import { bulkEditFormFields } from './BulkEditModal.consts';
import { modalSizes } from '../../theme/utilities';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCount: number;
  form: {
    artist: string;
    albumArtist: string;
    album: string;
  };
  onFormChange: (form: {
    artist: string;
    albumArtist: string;
    album: string;
  }) => void;
  onSave: () => void;
}

export const BulkEditModal = ({
  isOpen,
  onClose,
  selectedCount,
  form,
  onFormChange,
  onSave,
}: BulkEditModalProps) => (
  <Modal open={isOpen} onClose={onClose}>
    <ModalDialog sx={modalSizes.small}>
      <DialogTitle>Bulk Edit Tracks</DialogTitle>
      <DialogContent>
        <Stack direction="column" gap={2}>
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            Editing {selectedCount} track{selectedCount !== 1 ? 's' : ''}. Only
            filled fields will be updated.
          </Typography>
          {bulkEditFormFields.map((field) => (
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
        <Button onClick={onSave}>
          Apply to {selectedCount} Track{selectedCount !== 1 ? 's' : ''}
        </Button>
      </DialogActions>
    </ModalDialog>
  </Modal>
);
