import { AppError } from './AppError';
import { ErrorCode } from './error-codes';

interface FieldError {
  field: string;
  message: string;
}

export class ValidationError extends AppError {
  errors: FieldError[] = [];

  constructor(message = 'Validation error', errors: FieldError[]) {
    super(message, 400, ErrorCode.VALIDATION_ERROR);
    this.errors = errors;

    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
