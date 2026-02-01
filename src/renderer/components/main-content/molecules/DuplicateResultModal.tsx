import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemContent,
} from '@mui/joy';
import type { DetectDuplicatesResponse } from '../../../types/electron';

interface DuplicateResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DetectDuplicatesResponse['result'] | null;
}

export const DuplicateResultModal = ({
  isOpen,
  onClose,
  result,
}: DuplicateResultModalProps) => {
  if (!result) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalDialog
        sx={{
          minWidth: 500,
          maxWidth: '80vw',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        <DialogTitle>Duplicate Detection Results</DialogTitle>
        <DialogContent>
          <Stack gap={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography level="body-md">
                Total Tracks: <b>{result.totalTracks}</b>
              </Typography>
              <Typography level="body-md">
                Unique Tracks: <b>{result.uniqueTracks}</b>
              </Typography>
              <Typography level="body-md" color="danger">
                Duplicates: <b>{result.totalTracks - result.uniqueTracks}</b>
              </Typography>
            </Stack>

            <Divider />

            <Typography level="title-md">
              Duplicate Groups ({result.duplicates.length})
            </Typography>

            <List sx={{ '--ListItem-paddingY': '1rem' }}>
              {result.duplicates.map((group, index) => (
                <ListItem
                  key={index}
                  variant="outlined"
                  sx={{ borderRadius: 'md', mb: 1 }}
                >
                  <ListItemContent>
                    <Typography level="title-sm">
                      {group.title || 'Unknown Title'}
                    </Typography>
                    <Typography level="body-xs">
                      {group.artist || 'Unknown Artist'} —{' '}
                      {group.album || 'Unknown Album'}
                    </Typography>
                    <Typography
                      level="body-xs"
                      color="warning"
                      sx={{ mt: 0.5 }}
                    >
                      Occurrences: {group.count}
                    </Typography>
                  </ListItemContent>
                </ListItem>
              ))}
            </List>

            {result.duplicates.length === 0 && (
              <Typography color="success" textAlign="center" sx={{ py: 2 }}>
                No duplicates found!
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="solid" color="primary" onClick={onClose}>
            Close
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};
