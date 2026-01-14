import { useStep } from '@/api';

/**
 * Helper to extract stepId from HATEOAS link
 * Link format: "/api/play/sessions/{sessionId}/step/{stepId}"
 */
const extractStepIdFromLink = (link: { href: string } | undefined): number | null => {
  if (!link) {
    return null;
  }

  const match = link.href.match(/\/step\/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Step layer fetches current step and prefetches next step.
 *
 * Flow:
 * 1. Fetch current step by currentStepId (from session)
 * 2. Extract nextStepId from HATEOAS links
 * 3. Prefetch next step (same useStep hook, same cache pattern)
 *
 * When user completes a step:
 * - Session updates currentStepId via setQueryData
 * - This hook re-runs with new currentStepId
 * - New current step is already in cache (was prefetched)
 * - Zero network latency on step transitions
 */
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
