import { AppError } from './AppError';
import { ErrorCode } from './error-codes';

export class DataIntegrityError extends AppError {
  constructor(message: string) {
    super(message, 500, ErrorCode.DATA_INTEGRITY_ERROR);

    Object.setPrototypeOf(this, DataIntegrityError.prototype);
  }
}
