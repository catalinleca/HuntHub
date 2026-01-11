import { useQuery } from '@tanstack/react-query';
import { playKeys } from './keys';
import { mockGetCurrentStep } from './mockData';
import { queryFnOrSkip } from '@/utils';

export const useCurrentStep = (sessionId: string | null) => {
  return useQuery({
    queryKey: playKeys.currentStep(sessionId ?? ''),
    queryFn: queryFnOrSkip(mockGetCurrentStep, sessionId),
  });
};
