import { AppError } from './AppError';
import { ErrorCode } from './error-codes';

export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, 503, ErrorCode.SERVICE_UNAVAILABLE);

    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}
