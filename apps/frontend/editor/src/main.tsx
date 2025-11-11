import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import App from './App';
import { theme } from './theme';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {/* styled-components needs access to MUI theme */}
        <StyledThemeProvider theme={theme}>
          <CssBaseline />
          <App />
          <ReactQueryDevtools initialIsOpen={false} />
        </StyledThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
