import { AppError } from '@/utils/errors/AppError';

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}
