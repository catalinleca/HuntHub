import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '@/utils/errors/ValidationError';
import { FieldError, validateSchema, ValidationResult } from '@/utils/validation/validateSchema';

interface ValidationSchemas {
  bodySchema?: ZodSchema;
  paramsSchema?: ZodSchema;
  querySchema?: ZodSchema;
}

export const validationMiddleware =
  ({ bodySchema, paramsSchema, querySchema }: ValidationSchemas) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const results: ValidationResult[] = [];

    try {
      if (bodySchema) {
        results.push(await validateSchema(bodySchema, req.body));
      }
      if (paramsSchema) {
        results.push(await validateSchema(paramsSchema, req.params));
      }
      if (querySchema) {
        results.push(await validateSchema(querySchema, req.query));
      }

      const hasErrors = results.some((r) => !r.success);
      const allErrors = results.flatMap((r) => r.errors || []);

      if (!hasErrors) {
        return next();
      }

      return next(new ValidationError('Wrong payload', allErrors));
    } catch (error) {
      next(error);
    }
  };
