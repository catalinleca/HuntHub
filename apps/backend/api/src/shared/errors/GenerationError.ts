import { AppError } from './AppError';
import { ErrorCode } from './error-codes';

export class GenerationError extends AppError {
  constructor(message = 'Failed to generate content') {
    super(message, 500, ErrorCode.GENERATION_FAILED);

    Object.setPrototypeOf(this, GenerationError.prototype);
  }
}
