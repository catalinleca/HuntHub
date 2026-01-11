import { useQuery } from '@tanstack/react-query';
import { playKeys } from './keys';
import { mockGetNextStep } from './mockData';

export const usePrefetchNextStep = (sessionId: string | null, hasNextLink: boolean) => {
  return useQuery({
    queryKey: playKeys.nextStep(sessionId!),
    queryFn: () => mockGetNextStep(sessionId!),
    enabled: !!sessionId && hasNextLink,
    staleTime: Infinity,
  });
};
