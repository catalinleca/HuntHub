import pinoHttp from 'pino-http';
import { randomUUID } from 'crypto';
import { logger } from '@/utils/logger';

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req) => {
    const header = req.headers['x-correlation-id'];
    const correlationId = Array.isArray(header) ? header[0] : header;

    return correlationId || randomUUID();
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
