import { NextFunction, Request, Response, ErrorRequestHandler } from 'express';
import { AppError, ValidationError, InternalServerError } from '@/shared/errors';
import { logger } from '@/utils/logger';
import { Sentry } from '@/config/sentry';

const logAppError = (err: AppError, req: Request): void => {
  const logData = {
    errorCode: err.code,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
  };

  if (err.statusCode >= 500) {
    logger.error(logData, err.message);
  } else {
    logger.warn(logData, err.message);
  }
};

export const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ValidationError) {
    logAppError(err, req);

    res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      errors: err.errors,
    });

    return;
  }

  if (err instanceof AppError) {
    logAppError(err, req);

    res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
    });

    return;
  }

  const internalError = new InternalServerError(undefined, err);

  logger.error({ err, path: req.path, method: req.method }, internalError.message);
  Sentry.captureException(err);

  res.status(internalError.statusCode).json({
    code: internalError.code,
    message: internalError.message,
  });
};
