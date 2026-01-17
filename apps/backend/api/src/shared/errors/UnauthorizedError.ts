import { AppError } from './AppError';
import { ErrorCode } from './error-codes';

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, ErrorCode.UNAUTHORIZED);
  }
}
