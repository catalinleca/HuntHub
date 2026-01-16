import { useStep } from '@/api';

const extractStepIdFromLink = (link: { href: string } | undefined): number | null => {
  if (!link) {
    return null;
  }

  const match = link.href.match(/\/step\/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
};

export const useStepLayer = (sessionId: string | null, currentStepId: number | null) => {
  const currentStepQuery = useStep(sessionId, currentStepId);
  const currentStepResponse = currentStepQuery.data;

  const nextStepId = extractStepIdFromLink(currentStepResponse?._links?.next);
  const prefetchQuery = useStep(sessionId, nextStepId);

  const hasNextLink = nextStepId !== null;

  return {
    currentStep: currentStepResponse?.step ?? null,
    stepResponse: currentStepResponse ?? null,
    attempts: currentStepResponse?.attempts ?? 0,
    maxAttempts: currentStepResponse?.maxAttempts ?? null,
    hintsUsed: currentStepResponse?.hintsUsed ?? 0,
    maxHints: currentStepResponse?.maxHints ?? 1,
    hasNextLink,
    nextStepId,
    isLoading: currentStepQuery.isLoading,
    isPrefetching: hasNextLink && prefetchQuery.isLoading,
    error: currentStepQuery.error ?? null,
  };
};
