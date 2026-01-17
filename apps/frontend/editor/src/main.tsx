import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initSentry } from './config/sentry';
import App from './App';

initSentry();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
