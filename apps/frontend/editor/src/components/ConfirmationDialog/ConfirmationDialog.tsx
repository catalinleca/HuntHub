import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

import { DialogVariants, useDialogStore } from '@/stores';

export const ConfirmationDialog = () => {
  const { isOpen, title, message, confirmText, cancelText, variant, handleConfirm, handleCancel } = useDialogStore();

  return (
    <Dialog open={isOpen} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} variant="outlined">
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color={variant === DialogVariants.Danger ? 'error' : 'primary'}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
