import { useAuth } from './contexts/AuthContext';
import { Router } from './router';
import { Login } from './pages/Login';
import { Box, CircularProgress } from '@mui/material';

export function AppWithAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <Router />;
}
