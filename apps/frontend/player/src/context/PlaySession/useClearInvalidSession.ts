import { useEffect } from 'react';
import { sessionStorage } from './sessionStorage';

interface UseClearInvalidSessionParams {
  huntId: number;
  savedSessionId: string | null;
  isLoading: boolean;
  hasData: boolean;
  error: Error | null;
}

export const useClearInvalidSession = ({
  huntId,
  savedSessionId,
  isLoading,
  hasData,
  error,
}: UseClearInvalidSessionParams) => {
  useEffect(() => {
    const querySucceeded = !isLoading && !error;
    const sessionNotFound = !hasData;

    if (savedSessionId && querySucceeded && sessionNotFound) {
      sessionStorage.clear(huntId);
    }
  }, [savedSessionId, isLoading, hasData, error, huntId]);
};
