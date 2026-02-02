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
  Chip,
  Box,
} from '@mui/joy';
import { SearchInput } from '../atoms';
import type { OrganizePlan } from '../../../types/electron';

interface OrganizePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: OrganizePlan | null;
  onApply: () => void;
}

export const OrganizePlanModal = ({
  isOpen,
  onClose,
  plan,
  onApply,
}: OrganizePlanModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActions = useMemo(() => {
    if (!plan) return [];
    const nonKeepActions = plan.actions.filter((a) => a.type !== 'KEEP');

    if (!searchQuery.trim()) return nonKeepActions;

    const query = searchQuery.toLowerCase();
    return nonKeepActions.filter(
      (action) =>
        action.sourcePath.toLowerCase().includes(query) ||
        (action.targetPath &&
          action.targetPath.toLowerCase().includes(query)) ||
        action.reason.toLowerCase().includes(query) ||
        (action.qualityInfo && action.qualityInfo.toLowerCase().includes(query))
    );
  }, [plan, searchQuery]);

  if (!plan) return null;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalDialog sx={{ minWidth: 700, maxWidth: '90vw', maxHeight: '85vh' }}>
        <DialogTitle>Library Reorganization Plan (Dry Run)</DialogTitle>
        <DialogContent sx={{ overflow: 'auto', mt: 2 }}>
          <Stack gap={3}>
            {/* Stats Summary */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 2,
              }}
            >
              <Box>
                <Typography level="body-xs">Files to Move</Typography>
                <Typography level="h4" color="primary">
                  {plan.stats.toMove}
                </Typography>
              </Box>
              <Box>
                <Typography level="body-xs">Duplicates to Delete</Typography>
                <Typography level="h4" color="danger">
                  {plan.stats.toDelete}
                </Typography>
              </Box>
              <Box>
                <Typography level="body-xs">Files to Keep</Typography>
                <Typography level="h4" color="success">
                  {plan.stats.toKeep}
                </Typography>
              </Box>
              <Box>
                <Typography level="body-xs">Space to Recover</Typography>
                <Typography level="h4" color="warning">
                  {formatSize(plan.stats.totalSizeToRecover)}
                </Typography>
              </Box>
            </Box>

            <Divider />

            {/* Actions List */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography level="title-md">Proposed Actions</Typography>
              <SearchInput
                placeholder="Search paths or reasons..."
                value={searchQuery}
                onChange={setSearchQuery}
                sx={{ width: 300 }}
              />
            </Stack>

            <List sx={{ '--ListItem-paddingY': '0.75rem' }}>
              {filteredActions.map((action, index) => (
                <ListItem
                  key={index}
                  variant="outlined"
                  sx={{
                    borderRadius: 'md',
                    mb: 1,
                    borderColor:
                      action.type === 'DELETE' ? 'danger.200' : 'primary.200',
                  }}
                >
                  <ListItemContent>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box sx={{ flex: 1 }}>
                        <Stack
                          direction="row"
                          gap={1}
                          alignItems="center"
                          sx={{ mb: 1 }}
                        >
                          <Chip
                            size="sm"
                            color={
                              action.type === 'DELETE' ? 'danger' : 'primary'
                            }
                            variant="solid"
                          >
                            {action.type}
                          </Chip>
                          <Typography level="title-sm" noWrap>
                            {path.basename(action.sourcePath)}
                          </Typography>
                        </Stack>

                        <Typography level="body-xs" sx={{ opacity: 0.7 }}>
                          FROM: {action.sourcePath}
                        </Typography>
                        {action.targetPath && (
                          <Typography level="body-xs" color="primary">
                            TO: {action.targetPath}
                          </Typography>
                        )}
                        <Typography
                          level="body-xs"
                          sx={{ mt: 1, fontStyle: 'italic' }}
                        >
                          Reason: {action.reason}
                        </Typography>
                      </Box>
                      <Chip variant="soft" size="sm">
                        {action.qualityInfo}
                      </Chip>
                    </Stack>
                  </ListItemContent>
                </ListItem>
              ))}
            </List>

            {filteredActions.length === 0 && (
              <Typography color="neutral" textAlign="center" sx={{ py: 2 }}>
                {searchQuery
                  ? 'No matching actions found.'
                  : 'No actions proposed.'}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="plain" color="neutral" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="solid" color="primary" onClick={onApply}>
            Apply Changes
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

// Helper for path basename since we can't easily import path in renderer without issues sometimes
const path = {
  basename: (p: string) => p.split(/[\\/]/).pop() || '',
};
