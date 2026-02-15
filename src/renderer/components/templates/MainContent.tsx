import { Stack, Typography, AccordionGroup } from '@mui/joy';
import { useEffect } from 'react';
import { useMusicLibraryStore } from '../../stores/musicLibraryStore';
import { useModalFormStore } from '../../stores/modalFormStore';
import { ConfigMessage } from '../atoms';
import { TrackEditModal, BulkEditModal } from '../molecules';
import { LibraryInfo, QuickActions, TrackListing } from '../organisms';
import { mixins } from '../../theme/utilities';

export const MainContent = () => {
  const { initializeLibrary, configMessage } = useMusicLibraryStore();
  const {
    isEditModalOpen,
    editForm,
    setEditForm,
    saveTrack,
    closeEditModal,
    isBulkEditModalOpen,
    bulkEditForm,
    setBulkEditForm,
    saveBulkEdit,
  } = useModalFormStore();

  useEffect(() => {
    initializeLibrary();
  }, []);

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
          overflow: 'auto',
        }}
        alignItems="stretch"
      >
        <Typography level="h2" sx={{ mb: 2 }}>
          Music Library
        </Typography>

        {configMessage && (
          <ConfigMessage type={configMessage.type} text={configMessage.text} />
        )}

        <Stack direction="column" gap={3}>
          <AccordionGroup
            sx={{
              '& .MuiAccordion-root': {
                ...mixins.cardContainer(),
              },
            }}
          >
            <LibraryInfo />
            <QuickActions />
          </AccordionGroup>

          <TrackListing />
        </Stack>
      </Stack>

      <TrackEditModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        form={editForm}
        onFormChange={setEditForm}
        onSave={saveTrack}
      />

      <BulkEditModal
        isOpen={isBulkEditModalOpen}
        onClose={closeEditModal}
        selectedCount={useModalFormStore.getState().selectedTrackIds.length}
        form={bulkEditForm}
        onFormChange={setBulkEditForm}
        onSave={saveBulkEdit}
      />
    </Stack>
  );
};
