import { AppError } from './AppError';
import { ErrorCode } from './error-codes';

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, ErrorCode.FORBIDDEN);
  }
}
