import { useQuery } from '@tanstack/react-query';
import { playKeys } from './keys';
import { mockGetCurrentStep } from './mockData';

export const useCurrentStep = (sessionId: string | null) => {
  return useQuery({
    queryKey: playKeys.currentStep(sessionId!),
    queryFn: () => mockGetCurrentStep(sessionId!),
    enabled: !!sessionId,
  });
};
