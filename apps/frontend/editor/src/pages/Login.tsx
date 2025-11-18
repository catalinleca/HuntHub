import { useAuth } from '@/contexts/AuthContext';
import { Box, Button, Typography, Alert } from '@mui/material';

export const Login = () => {
  const { signInWithGoogle, error, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <Typography variant="h3">HuntHub Editor</Typography>
      <Typography variant="body1" color="text.secondary">
        Sign in to create and manage treasure hunts
      </Typography>

      {error && (
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          {error}
        </Alert>
      )}

      <Button variant="contained" size="large" onClick={handleGoogleSignIn} disabled={loading} sx={{ mt: 2 }}>
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </Button>
    </Box>
  );
};
