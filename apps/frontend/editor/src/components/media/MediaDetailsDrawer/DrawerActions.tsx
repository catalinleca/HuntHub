import { Stack, Button } from '@mui/material';

export interface DrawerActionsProps {
  onSave: () => void;
  onClose: () => void;
}

export const DrawerActions = ({ onSave, onClose }: DrawerActionsProps) => (
  <Stack direction="row" justifyContent="flex-end" gap={1} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
    <Button onClick={onClose}>Cancel</Button>
    <Button variant="contained" onClick={onSave}>
      Save
    </Button>
  </Stack>
);
