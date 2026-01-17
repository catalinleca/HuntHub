import { AppError } from './AppError';
import { ErrorCode } from './error-codes';

export class InternalServerError extends AppError {
  readonly originalError?: Error;

  constructor(message = 'An unexpected error occurred', originalError?: Error) {
    super(message, 500, ErrorCode.INTERNAL_ERROR);
    this.originalError = originalError;

    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
