import { useEffect } from 'react';
import { sessionStorage } from './sessionStorage';

interface UseClearInvalidSessionParams {
  huntId: number;
  savedSessionId: string | null;
  isLoading: boolean;
  hasData: boolean;
}

export const useClearInvalidSession = ({
  huntId,
  savedSessionId,
  isLoading,
  hasData,
}: UseClearInvalidSessionParams) => {
  useEffect(() => {
    if (savedSessionId && !isLoading && !hasData) {
      sessionStorage.clear(huntId);
    }
  }, [savedSessionId, isLoading, hasData, huntId]);
};