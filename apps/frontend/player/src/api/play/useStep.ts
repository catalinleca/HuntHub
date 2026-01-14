import { useQuery, skipToken } from '@tanstack/react-query';
import { playKeys, SKIP_KEY } from './keys';
import { getStep } from './api';

/**
 * Fetch a specific step by ID
 *
 * In the new API model:
 * - SessionResponse includes currentStep for initial load
 * - This hook is for fetching steps by ID (e.g., from HATEOAS links)
 *
 * Access control: Server only allows fetching current or next step
 */
export const useStep = (sessionId: string | null, stepId: number | null) => {
  const canFetch = !!sessionId && stepId !== null;

  return useQuery({
    queryKey: canFetch ? playKeys.step(sessionId, stepId) : playKeys.currentStepSkip(SKIP_KEY),
    queryFn: canFetch ? () => getStep(sessionId, stepId) : skipToken,
  });
};

