import { AppError } from './AppError';
import { ErrorCode } from './error-codes';

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict detected') {
    super(message, 409, ErrorCode.CONFLICT);
  }
}
