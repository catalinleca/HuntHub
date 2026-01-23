import { useRef } from 'react';
import { Stack, CircularProgress } from '@mui/material';
import { useAuth } from './contexts/AuthContext';
import { Router } from './router';
import { LoginPage } from './pages/LoginPage';

const stashPromptFromUrl = (): void => {
  const params = new URLSearchParams(window.location.search);
  const prompt = params.get('prompt');
  if (!prompt) {
    return;
  }
  sessionStorage.setItem('pendingPrompt', prompt);
  window.history.replaceState({}, '', window.location.pathname);
};

export const AppWithAuth = () => {
  const { user, loading } = useAuth();

  // Why: Authenticated users skip LoginPage entirely, so prompt must be extracted before render decision
  const hasExtractedPrompt = useRef(false);
  if (!hasExtractedPrompt.current) {
    stashPromptFromUrl();
    hasExtractedPrompt.current = true;
  }

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
