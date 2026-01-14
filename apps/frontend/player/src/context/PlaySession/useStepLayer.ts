import { usePrefetchNextStep } from '@/api';
import type { StepResponse } from '@hunthub/shared';

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
 * Step layer now uses the currentStep from SessionResponse
 * and handles prefetching of the next step via HATEOAS links
 */
export const useStepLayer = (sessionId: string | null, currentStepResponse: StepResponse | null | undefined) => {
  const nextStepId = extractStepIdFromLink(currentStepResponse?._links?.next);
  const prefetchQuery = usePrefetchNextStep(sessionId, nextStepId);

  const hasNextLink = nextStepId !== null;

  return {
    currentStep: currentStepResponse?.step ?? null,
    stepResponse: currentStepResponse,
    hasNextLink,
    nextStepId,
    // Prefetch is loading if we have a next link and the query is loading
    isPrefetching: hasNextLink && prefetchQuery.isLoading,
    prefetchError: prefetchQuery.error ?? null,
  };
};
