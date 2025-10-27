import { AppError } from '@/common/errors/AppError';

export class FirebaseAuthError extends AppError {
  readonly originalError: Error;
  readonly errorCode: string;

  private static ERROR_MAP: Record<string, { message: string; statusCode: number }> = {
    'auth/invalid-email': {
      message: 'Invalid email format',
      statusCode: 400,
    },
    'auth/user-disabled': {
      message: 'Account has been disabled',
      statusCode: 403,
    },
    'auth/user-not-found': {
      message: 'Invalid email or password',
      statusCode: 401,
    },
    'auth/email-already-in-use': {
      message: 'Email already in use',
      statusCode: 409,
    },
    'auth/wrong-password': {
      message: 'Invalid email or password',
      statusCode: 401,
    },
    'auth/weak-password': {
      message: 'Password must be at least 6 characters',
      statusCode: 400,
    },
    'auth/too-many-requests': {
      message: 'Too many attempts. Try again later',
      statusCode: 429,
    },
    'auth/operation-not-allowed': {
      message: 'Authentication method disabled',
      statusCode: 403,
    },
    'auth/expired-action-code': {
      message: 'Expired authentication code',
      statusCode: 401,
    },
    'auth/invalid-action-code': {
      message: 'Invalid authentication code',
      statusCode: 401,
    },
  };

  constructor(error: unknown) {
    const originalError = error instanceof Error ? error : new Error(String(error));
    const errorCode = (originalError as any).code || 'unknown';

    const errorConfig = FirebaseAuthError.ERROR_MAP[errorCode] || {
      message: 'Authentication failed',
      statusCode: 500,
    };

    super(errorConfig.message, errorConfig.statusCode);

    this.errorCode = errorCode;
    this.originalError = originalError;

    Object.setPrototypeOf(this, FirebaseAuthError.prototype);
  }
}
