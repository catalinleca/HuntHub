import { AppError } from './AppError';
import { ErrorCode } from './error-codes';

export class NotInvitedError extends AppError {
  constructor(message = 'You have not been invited to this hunt') {
    super(message, 403, ErrorCode.NOT_INVITED);
  }
}
