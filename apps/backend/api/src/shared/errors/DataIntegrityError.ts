import { AppError } from './AppError';
import { ErrorCode } from './error-codes';
import { logger } from '@/utils/logger';

export class DataIntegrityError extends AppError {
  constructor(message: string) {
    super(message, 500, ErrorCode.DATA_INTEGRITY_ERROR);

    logger.error(message);

    Object.setPrototypeOf(this, DataIntegrityError.prototype);
  }
}
