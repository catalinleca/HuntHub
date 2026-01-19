import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { APIProvider } from '@vis.gl/react-google-maps';
import * as Sentry from '@sentry/react';
import { AuthProvider } from './contexts/AuthContext';
import { AppWithAuth } from './AppWithAuth';
import { treasureMapTheme as theme } from '@hunthub/compass';
import { ConfirmationDialog, ErrorFallback, Snackbar } from '@/components';
import { GOOGLE_MAPS_API_KEY } from '@/config/google-maps';
import { useSnackbarStore } from '@/stores';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
  mutationCache: new MutationCache({
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      useSnackbarStore.getState().error(message);
    },
  }),
});

function App() {
  return (
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY ?? ''} version="beta">
            <AuthProvider>
              <AppWithAuth />
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
            <ConfirmationDialog />
            <Snackbar />
          </APIProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
}

export default App;
