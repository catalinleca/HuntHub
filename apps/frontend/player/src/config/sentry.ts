import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
const IS_PRODUCTION = import.meta.env.PROD;

export const initSentry = () => {
  if (!SENTRY_DSN) {
    console.info('Sentry DSN not configured - error tracking disabled');

    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: IS_PRODUCTION ? 'production' : 'development',
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    tracesSampleRate: IS_PRODUCTION ? 0.1 : 1.0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: IS_PRODUCTION ? 1.0 : 0,
  });
};

export { Sentry };
