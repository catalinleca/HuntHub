import { AppError } from './AppError';
import { ErrorCode } from './error-codes';

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, ErrorCode.RATE_LIMIT_EXCEEDED);

    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}
