import axios from 'axios';

export const ErrorCode = {
  NOT_FOUND: 'NOT_FOUND',
  NOT_INVITED: 'NOT_INVITED',
  FORBIDDEN: 'FORBIDDEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface ApiError {
  code: ErrorCode;
  message: string;
  status: number;
}

const knownErrorCodes = new Set(Object.values(ErrorCode));

const isKnownErrorCode = (code: unknown): code is ErrorCode =>
  typeof code === 'string' && knownErrorCodes.has(code as ErrorCode);

export const parseApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return {
        code: ErrorCode.NETWORK_ERROR,
        message: 'Unable to connect to server',
        status: 0,
      };
    }

    const { status, data } = error.response;
    const code = isKnownErrorCode(data?.code) ? data.code : ErrorCode.UNKNOWN;

    return {
      code,
      message: data?.message || 'An unexpected error occurred',
      status,
    };
  }

  return {
    code: ErrorCode.UNKNOWN,
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    status: 0,
  };
};
