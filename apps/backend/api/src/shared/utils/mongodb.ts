import { MongoServerError } from 'mongodb';

export const isDuplicateKeyError = (error: unknown): boolean =>
  error instanceof MongoServerError && error.code === 11000;
