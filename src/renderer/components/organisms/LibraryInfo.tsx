import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/joy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMusicLibraryStore } from '../../stores/musicLibraryStore';
import { useModalFormStore } from '../../stores/modalFormStore';
import { useLibraryStats } from '../../stores/musicLibraryStore';
import { LibraryInfoDisplay, LibraryInfoNotConfigured } from '../molecules';

interface LibraryInfoProps {
  expanded?: boolean;
  onChange?: (event: React.SyntheticEvent, isExpanded: boolean) => void;
  onWheel?: React.WheelEventHandler<HTMLDivElement>;
}

export const LibraryInfo = ({
  expanded,
  onChange,
  onWheel,
}: LibraryInfoProps) => {
  const { isLibraryConfigured } = useMusicLibraryStore();
  const { configureMusicLibrary, rescanLibrary } = useModalFormStore();
  const { trackCount, totalSize, totalDuration } = useLibraryStats();
  const { isConfiguring, isScanning } = useModalFormStore.getState();

  return (
    <Accordion
      expanded={expanded !== undefined ? expanded : true}
      onChange={onChange}
      onWheel={onWheel}
    >
      <AccordionSummary indicator={<ExpandMoreIcon />}>
        <Typography level="title-lg">Library Info</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {!isLibraryConfigured ? (
          <LibraryInfoNotConfigured
            onConfigure={configureMusicLibrary}
            isConfiguring={isConfiguring}
          />
        ) : (
          <LibraryInfoDisplay
            trackCount={trackCount}
            totalSize={totalSize}
            totalDuration={totalDuration}
            onRescan={rescanLibrary}
            isScanning={isScanning}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};
