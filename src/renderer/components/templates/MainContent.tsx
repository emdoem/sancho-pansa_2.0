import { Stack, AccordionGroup } from '@mui/joy';
import React, { useEffect, useState } from 'react';
import { useMusicLibraryStore } from '../../stores/musicLibraryStore';
import { useModalFormStore } from '../../stores/modalFormStore';
import { ConfigMessage } from '../atoms';
import { TrackEditModal, BulkEditModal } from '../molecules';
import { LibraryInfo, QuickActions, TrackListing } from '../organisms';
import { mixins } from '../../theme/utilities';

export const MainContent = () => {
  const { initializeLibrary, configMessage } = useMusicLibraryStore();
  const { isEditModalOpen, isBulkEditModalOpen } = useModalFormStore();

  const [libraryInfoExpanded, setLibraryInfoExpanded] = useState(true);
  const [quickActionsExpanded, setQuickActionsExpanded] = useState(false);

  useEffect(() => {
    initializeLibrary();
  }, []);

  const handleAccordionChange =
    (setter: (v: boolean) => void) =>
    (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setter(isExpanded);
    };

  const handleAccordionWheel =
    (setter: (v: boolean) => void) => (event: React.WheelEvent) => {
      if (event.deltaY > 0) {
        setter(false);
      } else if (event.deltaY < 0) {
        setter(true);
      }
    };

  return (
    <Stack
      direction="column"
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="column"
        sx={{
          width: '100%',
          height: '100%',
          backgroundColor: 'background.body',
          padding: 3,
          overflow: 'hidden',
        }}
        alignItems="stretch"
      >
        {configMessage && (
          <ConfigMessage type={configMessage.type} text={configMessage.text} />
        )}

        <Stack
          direction="column"
          gap={3}
          sx={{ flexGrow: 1, overflow: 'hidden' }}
        >
          <AccordionGroup
            sx={{
              '& .MuiAccordion-root': {
                ...mixins.cardContainer(),
              },
            }}
          >
            <LibraryInfo
              expanded={libraryInfoExpanded}
              onChange={handleAccordionChange(setLibraryInfoExpanded)}
              onWheel={handleAccordionWheel(setLibraryInfoExpanded)}
            />
            <QuickActions
              expanded={quickActionsExpanded}
              onChange={handleAccordionChange(setQuickActionsExpanded)}
              onWheel={handleAccordionWheel(setQuickActionsExpanded)}
            />
          </AccordionGroup>

          <TrackListing />
        </Stack>
      </Stack>

      <TrackEditModal isOpen={isEditModalOpen} />

      <BulkEditModal isOpen={isBulkEditModalOpen} />
    </Stack>
  );
};
