import { useMemo, useRef, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { HuntProgressStatus, type SessionResponse } from '@hunthub/shared';
import { useGetSession, useStartSession, playKeys } from '@/api';
import { SessionStatus, SessionStateContext, SessionActionsContext } from './SessionContexts';
import { deriveStatus } from './internal/deriveStatus';
import { sessionStorage } from './internal/sessionStorage';
import { useClearInvalidSession } from './internal/useClearInvalidSession';
import { useStepManagement } from './internal/useStepManagement';
import type { SessionState, SessionActions } from './SessionContexts';

interface PlaySessionProviderProps {
  playSlug: string;
  children: ReactNode;
}

export const PlaySessionProvider = ({ playSlug, children }: PlaySessionProviderProps) => {
  const queryClient = useQueryClient();

  const savedSessionId = sessionStorage.get(playSlug);
  const sessionQuery = useGetSession(savedSessionId);
  const session = sessionQuery.data;

  useClearInvalidSession({
    playSlug,
    savedSessionId,
    isLoading: sessionQuery.isLoading,
    hasData: !!session,
    error: sessionQuery.error,
  });

  const { stepQuery, nextStepId } = useStepManagement(session?.sessionId ?? null, session?.currentStepId ?? null);

  const { mutate: startSessionMutate, error: startError } = useStartSession(playSlug);

  const sessionIdRef = useRef<string | null>(null);
  const nextStepIdRef = useRef<number | null>(null);

  sessionIdRef.current = session?.sessionId ?? null;
  nextStepIdRef.current = nextStepId;

  const derivedStatus = deriveStatus(sessionQuery, stepQuery);
  const status = startError ? SessionStatus.Error : derivedStatus;
  const error = sessionQuery.error ?? stepQuery.error ?? startError ?? null;

  const isLastStep = !!session && nextStepId === null && !!stepQuery.data;

  const stateValue: SessionState = useMemo(
    () => ({
      status,
      error,
      sessionId: session?.sessionId ?? null,
      huntMeta: session?.hunt ?? null,
      stepResponse: stepQuery.data ?? null,
      isLastStep,
    }),
    [status, error, session, stepQuery.data, isLastStep],
  );

  const actionsValue: SessionActions = useMemo(
    () => ({
      startSession: (playerName: string, email?: string) => {
        startSessionMutate(
          { playerName, email },
          { onSuccess: (data) => sessionStorage.set(playSlug, data.sessionId) },
        );
      },
      abandonSession: () => {
        sessionStorage.clear(playSlug);
        queryClient.removeQueries({ queryKey: playKeys.all });
        window.location.reload();
      },
      advanceToNextStep: () => {
        const currentSessionId = sessionIdRef.current;
        const currentNextStepId = nextStepIdRef.current;
        if (!currentSessionId) {
          return;
        }

        const isComplete = currentNextStepId === null;

        queryClient.setQueryData<SessionResponse>(playKeys.session(currentSessionId), (old) => {
          if (!old) {
            return old;
          }

          if (isComplete) {
            return {
              ...old,
              status: HuntProgressStatus.Completed,
              currentStepId: null,
              completedAt: new Date().toISOString(),
            };
          }

          return {
            ...old,
            currentStepIndex: old.currentStepIndex + 1,
            currentStepId: currentNextStepId,
          };
        });
      },
    }),
    [playSlug, queryClient, startSessionMutate],
  );

  return (
    <SessionActionsContext.Provider value={actionsValue}>
      <SessionStateContext.Provider value={stateValue}>{children}</SessionStateContext.Provider>
    </SessionActionsContext.Provider>
  );
};
