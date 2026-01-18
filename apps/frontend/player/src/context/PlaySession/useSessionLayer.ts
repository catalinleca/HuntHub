import { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStartSession, useGetSession, playKeys } from '@/api';
import { sessionStorage } from '@/context';
import { useClearInvalidSession } from './useClearInvalidSession';

const getPreviewToken = (): string | undefined => {
  const params = new URLSearchParams(window.location.search);
  return params.get('preview') ?? undefined;
};

export const useSessionLayer = (playSlug: string) => {
  const queryClient = useQueryClient();
  const previewToken = useMemo(() => getPreviewToken(), []);

  // Session ID as state so it updates when we create a new session
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => sessionStorage.get(playSlug));
  const [viewingStepIndex, setViewingStepIndex] = useState<number | null>(null);
  const hasAttemptedAutoStart = useRef(false);

  const { startSession: startSessionMutation, isStartingSession, startSessionError } = useStartSession(playSlug);
  const sessionQuery = useGetSession(activeSessionId);

  const session = sessionQuery.data;
  const stepOrder = session?.stepOrder ?? [];
  const isPreview = session?.isPreview ?? false;

  const handleSessionStarted = useCallback(
    (sessionId: string) => {
      sessionStorage.set(playSlug, sessionId);
      setActiveSessionId(sessionId);
      setViewingStepIndex(0);
    },
    [playSlug],
  );

  // Auto-start session for preview mode (no player identification needed)
  useEffect(() => {
    if (previewToken && !activeSessionId && !isStartingSession && !hasAttemptedAutoStart.current) {
      hasAttemptedAutoStart.current = true;
      startSessionMutation(
        { playerName: 'Preview', previewToken },
        { onSuccess: (data) => handleSessionStarted(data.sessionId) },
      );
    }
  }, [previewToken, activeSessionId, isStartingSession, startSessionMutation, handleSessionStarted]);

  // Sync viewingStepIndex with currentStepIndex when session loads
  useEffect(() => {
    if (session && viewingStepIndex === null) {
      setViewingStepIndex(session.currentStepIndex);
    }
  }, [session, viewingStepIndex]);

  useClearInvalidSession({
    playSlug,
    savedSessionId: activeSessionId,
    isLoading: sessionQuery.isLoading,
    hasData: !!sessionQuery.data,
    error: sessionQuery.error,
  });

  const startSession = useCallback(
    (playerName: string, email?: string) => {
      startSessionMutation(
        { playerName, email, previewToken },
        { onSuccess: (data) => handleSessionStarted(data.sessionId) },
      );
    },
    [startSessionMutation, previewToken, handleSessionStarted],
  );

  const abandonSession = useCallback(() => {
    sessionStorage.clear(playSlug);
    setActiveSessionId(null);
    queryClient.removeQueries({ queryKey: playKeys.all, exact: false });
    window.location.reload();
  }, [playSlug, queryClient]);

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (!isPreview || stepIndex < 0 || stepIndex >= stepOrder.length) {
        return;
      }
      setViewingStepIndex(stepIndex);
    },
    [isPreview, stepOrder.length],
  );

  // In preview mode, use viewingStepIndex; otherwise use currentStepIndex
  const effectiveStepIndex = viewingStepIndex ?? session?.currentStepIndex ?? 0;
  const effectiveStepId =
    isPreview && stepOrder.length > 0 ? stepOrder[effectiveStepIndex] : (session?.currentStepId ?? null);

  return {
    session,
    sessionId: session?.sessionId ?? null,
    huntMeta: session?.hunt ?? null,
    currentStepIndex: effectiveStepIndex,
    currentStepId: effectiveStepId,
    totalSteps: session?.totalSteps ?? 0,
    status: session?.status ?? null,
    isPreview,
    stepOrder,
    startSession,
    abandonSession,
    goToStep,
    isLoading: sessionQuery.isLoading || isStartingSession,
    error: sessionQuery.error ?? startSessionError ?? null,
  };
};
