import { useQuery, skipToken } from '@tanstack/react-query';
import { playKeys, SKIP_KEY } from './keys';
import { mockGetNextStep } from './mockData';

export const usePrefetchNextStep = (sessionId: string | null, hasNextLink: boolean) => {
  const shouldFetch = !!sessionId && hasNextLink;

  return useQuery({
    queryKey: playKeys.nextStep(sessionId ?? SKIP_KEY),
    queryFn: shouldFetch ? () => mockGetNextStep(sessionId) : skipToken,
    staleTime: Infinity,
  });
};
