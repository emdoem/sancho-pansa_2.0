import { Stack, Typography, Button, Sheet } from '@mui/joy';

interface SelectionToolbarProps {
  selectedCount: number;
  onCancel: () => void;
  onBulkEdit?: () => void;
}

export const SelectionToolbar = ({
  selectedCount,
  onCancel,
  onBulkEdit,
}: SelectionToolbarProps) => (
  <Sheet
    variant="soft"
    color="primary"
    sx={{
      p: 2,
      mb: 2,
      borderRadius: 'sm',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    <Typography level="body-md" sx={{ fontWeight: 600 }}>
      {selectedCount} track{selectedCount !== 1 ? 's' : ''} selected
    </Typography>
    <Stack direction="row" gap={2}>
      <Button onClick={onCancel} size="sm" color="danger">
        Cancel
      </Button>
      {selectedCount > 0 && onBulkEdit && (
        <Button onClick={onBulkEdit} size="sm">
          Bulk Edit
        </Button>
      )}
    </Stack>
  </Sheet>
);
