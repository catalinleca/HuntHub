import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface AbandonDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const AbandonDialog = ({ open, onClose, onConfirm }: AbandonDialogProps) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Abandon Hunt?</DialogTitle>
    <DialogContent>
      <Typography>Are you sure you want to abandon this hunt? Your progress will be lost.</Typography>
    </DialogContent>
    <DialogActions>
      <Button variant="outlined" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="contained" color="error" onClick={onConfirm}>
        Abandon
      </Button>
    </DialogActions>
  </Dialog>
);
