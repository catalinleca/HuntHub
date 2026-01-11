import { useCurrentStep, usePrefetchNextStep } from '@/api';

export const useStepLayer = (sessionId: string | null) => {
  const stepQuery = useCurrentStep(sessionId);
  const stepResponse = stepQuery.data;

  const hasNextLink = !!stepResponse?._links.next;
  usePrefetchNextStep(sessionId, hasNextLink);

  return {
    currentStep: stepResponse?.step ?? null,
    hasNextLink,
    isLoading: stepQuery.isLoading,
    error: stepQuery.error ?? null,
  };
};
