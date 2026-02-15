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
import { useModalFormStore } from '../../stores/modalFormStore';
import { bulkEditFormFields } from './BulkEditModal.consts';
import { modalSizes } from '../../theme/utilities';

interface BulkEditModalProps {
  isOpen: boolean;
}

export const BulkEditModal = ({ isOpen }: BulkEditModalProps) => {
  const {
    selectedTrackIds,
    bulkEditForm,
    setBulkEditForm,
    saveBulkEdit,
    closeBulkEditModal,
  } = useModalFormStore();
  const selectedCount = selectedTrackIds.length;

  return (
    <Modal open={isOpen} onClose={closeBulkEditModal}>
      <ModalDialog sx={modalSizes.small}>
        <DialogTitle>Bulk Edit Tracks</DialogTitle>
        <DialogContent>
          <Stack direction="column" gap={2}>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              Editing {selectedCount} track{selectedCount !== 1 ? 's' : ''}.
              Only filled fields will be updated.
            </Typography>
            {bulkEditFormFields.map((field) => (
              <FormControl key={field.key}>
                <FormLabel>{field.label}</FormLabel>
                <Input
                  value={bulkEditForm[field.key as keyof typeof bulkEditForm]}
                  onChange={(e) =>
                    setBulkEditForm({
                      ...bulkEditForm,
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
          <Button variant="plain" color="neutral" onClick={closeBulkEditModal}>
            Cancel
          </Button>
          <Button onClick={saveBulkEdit}>
            Apply to {selectedCount} Track{selectedCount !== 1 ? 's' : ''}
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};
