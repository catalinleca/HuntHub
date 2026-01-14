import { useQuery, skipToken } from '@tanstack/react-query';
import { playKeys, SKIP_KEY } from './keys';
import { getStep } from './api';

/**
 * Prefetch next step using HATEOAS link
 *
 * The step response includes _links.next with the next step URL.
 * We extract the stepId and prefetch that step.
 *
 * @param sessionId - Current session
 * @param nextStepId - Next step ID (extracted from _links.next)
 */
export const usePrefetchNextStep = (sessionId: string | null, nextStepId: number | null) => {
  const shouldFetch = !!sessionId && nextStepId !== null;

  return useQuery({
    queryKey: shouldFetch ? playKeys.step(sessionId, nextStepId) : playKeys.nextStepSkip(SKIP_KEY),
    queryFn: shouldFetch ? () => getStep(sessionId, nextStepId) : skipToken,
    staleTime: Infinity,
  });
};
