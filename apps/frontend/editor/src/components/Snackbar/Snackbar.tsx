import { Snackbar as MuiSnackbar, Alert, Button } from '@mui/material';
import { useSnackbarStore } from '@/stores';

export const Snackbar = () => {
  const { open, message, severity, action, close } = useSnackbarStore();

  const handleActionClick = () => {
    action?.onClick();
    close();
  };

  return (
    <MuiSnackbar
      open={open}
      autoHideDuration={4000}
      onClose={close}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={close}
        severity={severity}
        variant="filled"
        action={
          action && (
            <Button color="inherit" size="small" onClick={handleActionClick}>
              {action.label}
            </Button>
          )
        }
      >
        {message}
      </Alert>
    </MuiSnackbar>
  );
};
