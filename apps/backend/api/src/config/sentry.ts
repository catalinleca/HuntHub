import * as Sentry from '@sentry/node';
import { logger } from '@/utils/logger';
import { isProduction, sentryDsn } from './env.config';

export const initSentry = () => {
  if (!sentryDsn) {
    logger.info('Sentry DSN not configured - error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment: isProduction ? 'production' : 'development',
    tracesSampleRate: isProduction ? 0.1 : 1.0,
  });

  logger.info('Sentry initialized');
};

export { Sentry };
