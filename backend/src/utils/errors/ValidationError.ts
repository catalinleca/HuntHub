import { AppError } from '@/utils/errors/AppError';

interface FieldError {
  field: string;
  message: string;
}

export class ValidationError extends AppError {
  errors: FieldError[] = [];

  constructor(message = 'Validation error', errors: FieldError[]) {
    super(message, 400);
    this.errors = errors;

    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
