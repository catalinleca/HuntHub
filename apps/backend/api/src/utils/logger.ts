import pino from 'pino';
import { isDev, logLevel } from '@/config/env.config';

export const logger = pino({
  level: logLevel,
  transport: isDev ? { target: 'pino-pretty' } : undefined,
  base: {
    service: 'hunthub-api',
  },
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', '*.password', '*.token'],
    remove: true,
  },
});

export type Logger = typeof logger;
