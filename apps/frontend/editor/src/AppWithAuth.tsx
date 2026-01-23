import { Stack, CircularProgress } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import { Router } from './router';
import { LoginPage } from './pages/LoginPage';

// Authenticated users skip LoginPage entirely, so prompt must be extracted before any render
(() => {
  const params = new URLSearchParams(window.location.search);
  const prompt = params.get('prompt');

  if (prompt) {
    sessionStorage.setItem('pendingPrompt', prompt);
    window.history.replaceState({}, '', window.location.pathname);
  }
})();

export const AppWithAuth = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: '100vh' }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <Router />;
};
