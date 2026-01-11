import { useQuery, skipToken } from '@tanstack/react-query';
import { playKeys } from './keys';
import { mockGetNextStep } from './mockData';

const SKIP_KEY = '__skip__';

export const usePrefetchNextStep = (sessionId: string | null, hasNextLink: boolean) => {
  const shouldFetch = !!sessionId && hasNextLink;

  return useQuery({
    queryKey: playKeys.nextStep(sessionId ?? SKIP_KEY),
    queryFn: shouldFetch ? () => mockGetNextStep(sessionId) : skipToken,
    staleTime: Infinity,
  });
};
