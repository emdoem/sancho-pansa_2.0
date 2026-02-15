import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  LinearProgress,
  Typography,
} from '@mui/joy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import SyncIcon from '@mui/icons-material/Sync';
import { QuickActionButton } from '../atoms';
import {
  handleDetectDuplicates,
  handleGenerateOrganizePlan,
} from '../../utils/apiHandlers';
import { DuplicateResultModal, OrganizePlanModal } from '../molecules';
import { useModalFormStore } from '../../stores/modalFormStore';

interface SyncProgress {
  total: number;
  current: number;
  track: string;
}

export const QuickActions = () => {
  const {
    toggleBulkEditMode,
    showCheckboxes,
    setDuplicateResult,
    setOrganizePlan,
    isLoading,
    setIsLoading,
  } = useModalFormStore();
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);

  useEffect(() => {
    const cleanup = window.electronAPI.onSyncMetadataProgress(
      (progress: SyncProgress) => {
        setSyncProgress(progress);
      }
    );
    return cleanup;
  }, []);

  const onScanDuplicates = async () => {
    setIsLoading(true);
    const response = await handleDetectDuplicates();
    setIsLoading(false);

    if (response.success && response.result) {
      setDuplicateResult(response.result);
      setIsDuplicateModalOpen(true);
    }
  };

  const onGeneratePlan = async () => {
    setIsLoading(true);
    setIsDuplicateModalOpen(false);
    const response = await handleGenerateOrganizePlan();
    setIsLoading(false);

    if (response.success && response.plan) {
      setOrganizePlan(response.plan);
      setIsOrganizeModalOpen(true);
    }
  };

  const onSyncMetadata = async () => {
    if (
      !confirm(
        'This will write all database metadata to the actual music files. Continue?'
      )
    ) {
      return;
    }

    setIsSyncing(true);
    setSyncProgress({ total: 0, current: 0, track: 'Starting...' });

    try {
      const result = await window.electronAPI.syncMetadata();
      if (result.success) {
        alert(result.message);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('An error occurred during metadata sync');
    } finally {
      setIsSyncing(false);
      setSyncProgress(null);
    }
  };

  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary indicator={<ExpandMoreIcon />}>
          Quick Actions
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" gap={2}>
            <QuickActionButton
              label={isLoading ? 'Loading...' : 'Scan for Duplicates'}
              icon={<SearchIcon />}
              color="neutral"
              onClick={onScanDuplicates}
              disabled={isLoading || isSyncing || showCheckboxes}
            />
            <QuickActionButton
              label="Bulk Edit Tracks"
              icon={<EditIcon />}
              color="neutral"
              onClick={() => toggleBulkEditMode(true)}
              disabled={isSyncing || showCheckboxes}
            />
            <QuickActionButton
              label={isSyncing ? 'Syncing...' : 'Sync Metadata'}
              icon={<SyncIcon />}
              color="neutral"
              onClick={onSyncMetadata}
              disabled={isLoading || isSyncing || showCheckboxes}
            />
          </Stack>
          {isSyncing && syncProgress && (
            <Stack gap={1} sx={{ mt: 2 }}>
              <Typography level="body-sm">
                Syncing: {syncProgress.track} ({syncProgress.current} /{' '}
                {syncProgress.total})
              </Typography>
              <LinearProgress
                determinate
                value={
                  syncProgress.total > 0
                    ? (syncProgress.current / syncProgress.total) * 100
                    : 0
                }
              />
            </Stack>
          )}
        </AccordionDetails>
      </Accordion>

      <DuplicateResultModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        onCleanUp={onGeneratePlan}
      />

      <OrganizePlanModal
        isOpen={isOrganizeModalOpen}
        onClose={() => setIsOrganizeModalOpen(false)}
      />
    </>
  );
};
