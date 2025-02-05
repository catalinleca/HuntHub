import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '@/utils/errors/ValidationError';
import { validateSchema } from '@/utils/validation/validateSchema';

export const validationMiddleware = (schema: ZodSchema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await validateSchema(schema, req.body);

    if (result.success) {
      throw new Error();
      return next();
    }

    return next(new ValidationError('Wrong payload', result.errors));
  } catch (error) {
    next(error);
  }
};
