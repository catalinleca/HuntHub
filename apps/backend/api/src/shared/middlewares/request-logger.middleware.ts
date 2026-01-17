import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';
import { logger } from '@/utils/logger';

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req) => {
    const correlationId = req.headers['x-correlation-id'] as string;
    if (correlationId) {
      return correlationId;
    }
    return randomUUID();
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) {
      return 'error';
    }
    if (res.statusCode >= 400) {
      return 'warn';
    }
    return 'info';
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
});
