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
    const queryCompleted = !isLoading && !error;
    const sessionNotFound = !hasData;

    if (savedSessionId && queryCompleted && sessionNotFound) {
      sessionStorage.clear(huntId);
    }
  }, [savedSessionId, isLoading, hasData, error, huntId]);
};
