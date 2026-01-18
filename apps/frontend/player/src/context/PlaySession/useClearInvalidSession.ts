import { useEffect } from 'react';
import { sessionStorage } from './sessionStorage';

interface UseClearInvalidSessionParams {
  playSlug: string;
  savedSessionId: string | null;
  isLoading: boolean;
  hasData: boolean;
  error: Error | null;
}

export const useClearInvalidSession = ({
  playSlug,
  savedSessionId,
  isLoading,
  hasData,
  error,
}: UseClearInvalidSessionParams) => {
  useEffect(() => {
    const querySucceeded = !isLoading && !error;
    const sessionNotFound = !hasData;

    if (savedSessionId && querySucceeded && sessionNotFound) {
      sessionStorage.clear(playSlug);
    }
  }, [savedSessionId, isLoading, hasData, error, playSlug]);
};
