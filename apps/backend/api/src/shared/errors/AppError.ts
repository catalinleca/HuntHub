import { ErrorCode } from './error-codes';

export class AppError extends Error {
  constructor(
    public message: string = 'An unexpected error occurred',
    public statusCode: number = 500,
    public code: ErrorCode = ErrorCode.INTERNAL_ERROR,
  ) {
    super(message);

    this.name = this.constructor.name;

    Object.setPrototypeOf(this, AppError.prototype);

    if (Error?.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
