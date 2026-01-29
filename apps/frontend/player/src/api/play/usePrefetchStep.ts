import { useStep } from './useStep';

export const usePrefetchStep = (sessionId: string | null, stepId: number | null) => {
  return useStep(sessionId, stepId);
};
