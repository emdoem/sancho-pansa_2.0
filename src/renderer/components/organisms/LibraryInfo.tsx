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

export const LibraryInfo = () => {
  const { isLibraryConfigured } = useMusicLibraryStore();
  const { configureMusicLibrary, rescanLibrary } = useModalFormStore();
  const { trackCount, totalSize, totalDuration } = useLibraryStats();
  const { isConfiguring, isScanning } = useModalFormStore.getState();

  return (
    <Accordion defaultExpanded>
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
