import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/joy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LibraryInfoDisplay, LibraryInfoNotConfigured } from '../molecules';

interface LibraryInfoProps {
  isLibraryConfigured: boolean;
  trackCount: number;
  totalSize: string;
  totalDuration: string;
  onConfigure: () => void;
  isConfiguring: boolean;
  onRescan: () => void;
  isScanning: boolean;
}

export const LibraryInfo = ({
  isLibraryConfigured,
  trackCount,
  totalSize,
  totalDuration,
  onConfigure,
  isConfiguring,
  onRescan,
  isScanning,
}: LibraryInfoProps) => (
  <Accordion defaultExpanded>
    <AccordionSummary indicator={<ExpandMoreIcon />}>
      <Typography level="title-lg" sx={{ fontWeight: 600 }}>
        Library Info
      </Typography>
    </AccordionSummary>
    <AccordionDetails>
      {!isLibraryConfigured ? (
        <LibraryInfoNotConfigured
          onConfigure={onConfigure}
          isConfiguring={isConfiguring}
        />
      ) : (
        <LibraryInfoDisplay
          trackCount={trackCount}
          totalSize={totalSize}
          totalDuration={totalDuration}
          onRescan={onRescan}
          isScanning={isScanning}
        />
      )}
    </AccordionDetails>
  </Accordion>
);
