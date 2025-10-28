import { NextFunction, Request, Response, ErrorRequestHandler } from 'express';
import { AppError, ValidationError } from '@/shared/errors';

export const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, _: NextFunction) => {
  console.error(err);

  if (err instanceof ValidationError) {
    res.status(err.statusCode).send({ message: err.message, errors: err.errors });
  } else if (err instanceof AppError) {
    res.status(err.statusCode).send({ message: err.message });
  } else {
    res.status(500).send({
      message: 'Something went wrong',
    });
  }
};
