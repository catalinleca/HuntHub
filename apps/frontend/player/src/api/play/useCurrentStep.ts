import { useQuery } from '@tanstack/react-query';
import { playKeys, SKIP_KEY } from './keys';
import { mockGetCurrentStep } from './mockData';
import { queryFnOrSkip } from '@/utils';

export const useCurrentStep = (sessionId: string | null) => {
  return useQuery({
    queryKey: playKeys.currentStep(sessionId ?? SKIP_KEY),
    queryFn: queryFnOrSkip(mockGetCurrentStep, sessionId),
  });
};
