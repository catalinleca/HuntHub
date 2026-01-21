import { NextFunction, Request, Response } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '@/shared/errors';

export const validateRequest = (schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.parseAsync(req.body);
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return next(new ValidationError('Wrong payload', errors));
    }

    return next(error);
  }
};

export const validateQuery = (schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.query = await schema.parseAsync(req.query);
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return next(new ValidationError('Invalid query parameters', errors));
    }

    return next(error);
  }
};
