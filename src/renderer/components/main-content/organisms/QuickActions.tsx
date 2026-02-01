import { Accordion, AccordionSummary, AccordionDetails, Stack } from '@mui/joy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import { QuickActionButton } from '../atoms';
import { handleGetUserDataPath } from '../../../utils/apiHandlers';

export const QuickActions = () => (
  <Accordion defaultExpanded>
    <AccordionSummary indicator={<ExpandMoreIcon />}>
      Quick Actions
    </AccordionSummary>
    <AccordionDetails>
      <Stack direction="row" gap={2}>
        <QuickActionButton
          label="Scan for Duplicates"
          icon={<SearchIcon />}
          color="primary"
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
);
