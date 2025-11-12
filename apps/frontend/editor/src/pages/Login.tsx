import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Box, Button, Typography, Alert } from '@mui/material';
import { useEffect } from 'react';

export const Login = () => {
  const { user, signInWithGoogle, error, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
