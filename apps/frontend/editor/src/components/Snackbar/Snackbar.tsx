import { Snackbar as MuiSnackbar, Alert } from '@mui/material';
import { useSnackbarStore } from '@/stores';

export const Snackbar = () => {
  const { open, message, severity, close } = useSnackbarStore();

  return (
    <MuiSnackbar
      open={open}
      autoHideDuration={4000}
      onClose={close}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={close} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </MuiSnackbar>
  );
};
