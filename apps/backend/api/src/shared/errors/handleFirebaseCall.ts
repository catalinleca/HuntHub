import { FirebaseAuthError } from './FirebaseAuthError';

type FirebaseOperation<T> = () => Promise<T>;

export const handleWithFirebaseError = async <T>(operation: FirebaseOperation<T>): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    throw new FirebaseAuthError(error);
  }
};
