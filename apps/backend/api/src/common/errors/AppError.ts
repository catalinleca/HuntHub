export class AppError extends Error {
  constructor(
    public message: string = 'Something went wrong',
    public statusCode: number = 500,
  ) {
    super(message);

    // Err name to class name
    this.name = this.constructor.name;

    // Ensure prototype chain
    Object.setPrototypeOf(this, AppError.prototype);

    if (Error?.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
