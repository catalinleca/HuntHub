import { useQuery, skipToken } from '@tanstack/react-query';
import type { StepResponse } from '@hunthub/shared';
import { httpClient } from '@/services/http-client';
import { playKeys, SKIP_KEY } from './keys';

const getStep = async (sessionId: string, stepId: number): Promise<StepResponse> => {
  const { data } = await httpClient.get<StepResponse>(`/play/sessions/${sessionId}/step/${stepId}`);
  return data;
};

/**
 * Fetch a specific step by ID.
 *
 * Cache key: ['play', 'step', sessionId, stepId]
 *
 * Used for both current step and prefetch - when prefetched step becomes current,
 * the same cache entry is used, enabling zero-latency step transitions.
 *
 * Access control: Server only allows fetching current or next step.
 */
export const useStep = (sessionId: string | null, stepId: number | null) => {
  const canFetch = !!sessionId && stepId !== null;

  return useQuery({
    queryKey: canFetch ? playKeys.step(sessionId, stepId) : playKeys.currentStepSkip(SKIP_KEY),
    queryFn: canFetch ? () => getStep(sessionId, stepId) : skipToken,
    staleTime: Infinity,
  });
};
