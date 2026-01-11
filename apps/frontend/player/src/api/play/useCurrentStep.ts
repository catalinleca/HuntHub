import { useQuery } from '@tanstack/react-query';
import { playKeys } from './keys';
import { mockGetCurrentStep } from './mockData';
import { queryFnOrSkip } from '@/utils';

/**
 * When sessionId is null, skipToken prevents the query from executing,
 * but React Query still creates a cache entry for the queryKey.
 *
 * Without sentinel (empty string):
 *   queryKey: ['play', 'step', '', 'current'] ← looks like a real session with ID ''
 *
 * With sentinel:
 *   queryKey: ['play', 'step', '__skip__', 'current'] ← clearly a placeholder
 *
 * This makes debugging easier - '__skip__' entries are obviously not real data.
 */
const SKIP_KEY = '__skip__';

export const useCurrentStep = (sessionId: string | null) => {
  return useQuery({
    queryKey: playKeys.currentStep(sessionId ?? SKIP_KEY),
    queryFn: queryFnOrSkip(mockGetCurrentStep, sessionId),
  });
};
