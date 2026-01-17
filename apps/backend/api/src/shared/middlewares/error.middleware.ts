import { NextFunction, Request, Response, ErrorRequestHandler } from 'express';
import { AppError, ValidationError, InternalServerError } from '@/shared/errors';
import { logger } from '@/utils/logger';
import { Sentry } from '@/config/sentry';

export const errorHandler: ErrorRequestHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ValidationError) {
    logger.warn({ err }, err.message);

    res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      errors: err.errors,
    });

    return;
  }

  if (err instanceof AppError) {
    logger.warn({ err }, err.message);

    res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
    });

    return;
  }

  const internalError = new InternalServerError(undefined, err);
  logger.error({ err }, internalError.message);
  Sentry.captureException(err);

  res.status(internalError.statusCode).json({
    code: internalError.code,
    message: internalError.message,
  });
};
