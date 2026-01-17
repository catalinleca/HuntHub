import { AppError } from './AppError';
import { ErrorCode } from './error-codes';

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, ErrorCode.NOT_FOUND);
  }
}
