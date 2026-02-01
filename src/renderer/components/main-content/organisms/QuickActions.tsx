import { useState } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Stack } from '@mui/joy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { QuickActionButton } from '../atoms';
import {
  handleGetUserDataPath,
  handleDetectDuplicates,
} from '../../../utils/apiHandlers';
import { DuplicateResultModal } from '../molecules/DuplicateResultModal';
import type { DetectDuplicatesResponse } from '../../../types/electron';

export const QuickActions = () => {
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateResult, setDuplicateResult] = useState<
    DetectDuplicatesResponse['result'] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const onScanDuplicates = async () => {
    setIsLoading(true);
    const response = await handleDetectDuplicates();
    setIsLoading(false);

    if (response.success && response.result) {
      setDuplicateResult(response.result);
      setIsDuplicateModalOpen(true);
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
              label={isLoading ? 'Scanning...' : 'Scan for Duplicates'}
              icon={<SearchIcon />}
              color="primary"
              onClick={onScanDuplicates}
              disabled={isLoading}
            />
            <QuickActionButton
              label="Rename Files"
              icon={<DriveFileRenameOutlineIcon />}
              color="neutral"
            />
            <QuickActionButton
              label="Import Playlist"
              icon={<PlaylistAddIcon />}
              color="neutral"
              onClick={handleGetUserDataPath}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <DuplicateResultModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        result={duplicateResult}
      />
    </>
  );
};
