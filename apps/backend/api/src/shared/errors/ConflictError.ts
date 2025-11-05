import { AppError } from './AppError';

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict detected') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}
