import { Dialog, DialogTitle, DialogContent, Stack, IconButton, CircularProgress } from '@mui/material';
import { XIcon } from '@phosphor-icons/react';
import { useHuntDialogStore } from '@/stores';
import { useGetHunt } from '@/api/Hunt';
import { HuntDialogForm } from './HuntDialogForm';

// TODO: improve this and HuntDialogForm once you add functinality. Apply recommnded appraoc
export const HuntDialog = () => {
  const { isOpen, huntId, close } = useHuntDialogStore();
  const isEditMode = huntId !== null;

  const { data: hunt, isLoading } = useGetHunt(huntId);

  const title = isEditMode ? 'Edit Hunt' : 'Create New Hunt';

  return (
    <Dialog open={isOpen} onClose={close} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {title}
          <IconButton onClick={close} edge="end" aria-label="close">
            <XIcon size={24} />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {isEditMode && isLoading ? (
          <Stack justifyContent="center" alignItems="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <HuntDialogForm hunt={isEditMode ? hunt : undefined} />
        )}
      </DialogContent>
    </Dialog>
  );
};
