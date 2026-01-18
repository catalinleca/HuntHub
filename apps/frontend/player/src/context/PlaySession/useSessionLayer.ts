import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStartSession, useGetSession, playKeys } from '@/api';
import { sessionStorage } from '@/context';
import { useClearInvalidSession } from './useClearInvalidSession';

/**
 * Session layer for REGULAR mode only.
 * Preview mode is handled separately by PreviewFlow/usePreviewSession.
 */
export const useSessionLayer = (playSlug: string) => {
  const queryClient = useQueryClient();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => sessionStorage.get(playSlug));

  const { startSession: startSessionMutation, isStartingSession, startSessionError } = useStartSession(playSlug);
  const sessionQuery = useGetSession(activeSessionId);

  const session = sessionQuery.data;

  useClearInvalidSession({
    playSlug,
    savedSessionId: activeSessionId,
    isLoading: sessionQuery.isLoading,
    hasData: !!sessionQuery.data,
    error: sessionQuery.error,
  });

  const handleSessionStarted = useCallback(
    (sessionId: string) => {
      sessionStorage.set(playSlug, sessionId);
      setActiveSessionId(sessionId);
    },
    [playSlug],
  );

  const startSession = useCallback(
    (playerName: string, email?: string) => {
      startSessionMutation({ playerName, email }, { onSuccess: (data) => handleSessionStarted(data.sessionId) });
    },
    [startSessionMutation, handleSessionStarted],
  );

  const abandonSession = useCallback(() => {
    sessionStorage.clear(playSlug);
    setActiveSessionId(null);
    queryClient.removeQueries({ queryKey: playKeys.all, exact: false });
    window.location.reload();
  }, [playSlug, queryClient]);

  return {
    session,
    sessionId: session?.sessionId ?? null,
    huntMeta: session?.hunt ?? null,
    currentStepIndex: session?.currentStepIndex ?? 0,
    currentStepId: session?.currentStepId ?? null,
    totalSteps: session?.totalSteps ?? 0,
    status: session?.status ?? null,
    stepOrder: session?.stepOrder ?? [],
    startSession,
    abandonSession,
    isLoading: sessionQuery.isLoading || isStartingSession,
    error: sessionQuery.error ?? startSessionError ?? null,
  };
};
