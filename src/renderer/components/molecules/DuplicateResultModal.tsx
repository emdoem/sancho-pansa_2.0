import { useState, useMemo } from 'react';
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
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useModalFormStore } from '../../stores/modalFormStore';
import { SearchInput } from '../atoms';
import { modalSizes } from '../../theme/utilities';

interface DuplicateResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCleanUp: () => void;
}

export const DuplicateResultModal = ({
  isOpen,
  onClose,
  onCleanUp,
}: DuplicateResultModalProps) => {
  const { duplicateResult, isLoading } = useModalFormStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDuplicates = useMemo(() => {
    if (!duplicateResult) return [];
    if (!searchQuery.trim()) return duplicateResult.duplicates;

    const query = searchQuery.toLowerCase();
    return duplicateResult.duplicates.filter(
      (group) =>
        group.title?.toLowerCase().includes(query) ||
        group.artist?.toLowerCase().includes(query) ||
        group.album?.toLowerCase().includes(query)
    );
  }, [duplicateResult, searchQuery]);

  if (!duplicateResult) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalDialog sx={modalSizes.medium}>
        <DialogTitle>Duplicate Detection Results</DialogTitle>
        <DialogContent>
          <Stack gap={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography level="body-md">
                Total Tracks: <b>{duplicateResult.totalTracks}</b>
              </Typography>
              <Typography level="body-md">
                Unique Tracks: <b>{duplicateResult.uniqueTracks}</b>
              </Typography>
              <Typography level="body-md" color="danger">
                Duplicates:{' '}
                <b>
                  {duplicateResult.totalTracks - duplicateResult.uniqueTracks}
                </b>
              </Typography>
            </Stack>

            <Divider />

            <SearchInput
              placeholder="Search by title, artist, or album..."
              value={searchQuery}
              onChange={setSearchQuery}
              sx={{ mb: 1, width: '100%' }}
            />

            <Typography level="title-md">
              Duplicate Groups ({filteredDuplicates.length})
            </Typography>

            <List sx={{ '--ListItem-paddingY': '1rem' }}>
              {filteredDuplicates.map((group, index) => (
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
                    <Typography level="body-xs" sx={{ mt: 0.3, opacity: 0.7 }}>
                      Hash: {group.file_hash.slice(0, 12)}...
                    </Typography>
                    <Typography
                      level="body-xs"
                      color="warning"
                      sx={{ mt: 0.2 }}
                    >
                      Occurrences: {group.count} | Metadata:{' '}
                      {group.metadataCompleteness}/10 fields
                    </Typography>
                  </ListItemContent>
                </ListItem>
              ))}
            </List>

            {filteredDuplicates.length === 0 && (
              <Typography color="neutral" textAlign="center" sx={{ py: 2 }}>
                {searchQuery ? 'No matches found.' : 'No duplicates found!'}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="solid"
            color="success"
            startDecorator={<AutoFixHighIcon />}
            onClick={onCleanUp}
            loading={isLoading}
          >
            Clean up and Organize
          </Button>
          <Button variant="plain" color="neutral" onClick={onClose}>
            Close
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};
