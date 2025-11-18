import { Dialog } from '@mui/material';
import { CreateHuntForm } from '@/components';

interface CreateHuntDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateHuntDialog({ open, onClose }: CreateHuntDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <CreateHuntForm />
    </Dialog>
  );
}
