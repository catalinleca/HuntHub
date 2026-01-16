import { Dialog, DialogContent, DialogActions, Button, Typography, Stack } from '@mui/material';
import { CheckCircleIcon } from '@phosphor-icons/react';

interface SuccessDialogProps {
  open: boolean;
  feedback: string | null;
  isHuntComplete: boolean;
  onContinue: () => void;
}

export const SuccessDialog = ({ open, feedback, isHuntComplete, onContinue }: SuccessDialogProps) => {
  return (
    <Dialog open={open} maxWidth="xs" fullWidth>
      <DialogContent>
        <Stack alignItems="center" gap={2} sx={{ py: 2 }}>
          <CheckCircleIcon size={64} weight="fill" color="#4caf50" />
          <Typography variant="h5" textAlign="center">
            {isHuntComplete ? 'Hunt Complete!' : 'Well Done!'}
          </Typography>
          {feedback && (
            <Typography variant="body1" color="text.secondary" textAlign="center">
              {feedback}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button variant="contained" size="large" onClick={onContinue}>
          {isHuntComplete ? 'Finish' : 'Continue'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
