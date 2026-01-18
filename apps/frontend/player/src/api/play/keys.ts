/**
 * Sentinel value for queryKeys when sessionId is null.
 *
 * skipToken prevents query execution, but React Query still creates a cache entry.
 *
 * Without sentinel (empty string):
 *   queryKey: ['play', 'step', '', 'current'] ← looks like a real session with ID ''
 *
 * With sentinel:
 *   queryKey: ['play', 'step', '__skip__', 'current'] ← clearly a placeholder
 *
 * This makes debugging easier - '__skip__' entries are obviously not real data.
 */
export const SKIP_KEY = '__skip__';

export const playKeys = {
  all: ['play'] as const,
  huntInfo: (playSlug: string) => [...playKeys.all, 'huntInfo', playSlug] as const,
  session: (sessionId: string) => [...playKeys.all, 'session', sessionId] as const,
  step: (sessionId: string, stepId: number) => [...playKeys.all, 'step', sessionId, stepId] as const,
  // Skip placeholders - used with skipToken to identify disabled queries in devtools
  currentStepSkip: (sessionId: string) => [...playKeys.all, 'step', sessionId, 'current'] as const,
  nextStepSkip: (sessionId: string) => [...playKeys.all, 'step', sessionId, 'next'] as const,
};
