import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { APIProvider } from '@vis.gl/react-google-maps';
import { AuthProvider } from './contexts/AuthContext';
import { AppWithAuth } from './AppWithAuth';
import { theme } from './theme';
import { ConfirmationDialog } from '@/components';
import { GOOGLE_MAPS_API_KEY } from '@/config/google-maps';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY} version="beta">
          <AuthProvider>
            <AppWithAuth />
          </AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <ConfirmationDialog />
        </APIProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
