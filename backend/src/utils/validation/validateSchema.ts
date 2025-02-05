import { ZodError, ZodSchema } from 'zod';

interface FieldError {
  field: string;
  message: string;
}

export interface ValidationResult {
  success: boolean;
  errors: FieldError[];
}

export const validateSchema = async <T>(schema: ZodSchema, data: T): Promise<ValidationResult> => {
  try {
    await schema.parseAsync(data);
    return { success: true, errors: [] };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return { success: false, errors };
    }

    console.error(error);

    return {
      success: false,
      errors: [
        {
          field: 'unknown',
          message: error instanceof Error ? error.message : 'Unknown validation error',
        },
      ],
    };
  }
};
