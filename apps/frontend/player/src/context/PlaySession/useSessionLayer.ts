import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useStartSession, useGetSession, playKeys } from '@/api';
import { sessionStorage } from '@/context';
import { useClearInvalidSession } from './useClearInvalidSession';

export const useSessionLayer = (huntId: number) => {
  const queryClient = useQueryClient();
  const savedSessionId = sessionStorage.get(huntId);
  const sessionQuery = useGetSession(savedSessionId);
  const startMutation = useStartSession(huntId);

  useClearInvalidSession({
    huntId,
    savedSessionId,
    isLoading: sessionQuery.isLoading,
    hasData: !!sessionQuery.data,
    error: sessionQuery.error,
  });

  const startSession = useCallback(
    (playerName: string, email?: string) => {
      startMutation.mutate(
        { playerName, email },
        {
          onSuccess: (data) => {
            sessionStorage.set(huntId, data.sessionId);
          },
        },
      );
    },
    [huntId, startMutation],
  );

  const abandonSession = useCallback(() => {
    sessionStorage.clear(huntId);
    queryClient.removeQueries({ queryKey: playKeys.all, exact: false });
    window.location.reload();
  }, [huntId, queryClient]);

  const session = sessionQuery.data;

  return {
    session,
    sessionId: session?.sessionId ?? null,
    huntMeta: session?.hunt ?? null,
    currentStepIndex: session?.currentStepIndex ?? 0,
    currentStepId: session?.currentStepId ?? null,
    totalSteps: session?.totalSteps ?? 0,
    status: session?.status ?? null,
    startSession,
    abandonSession,
    isLoading: sessionQuery.isLoading || startMutation.isPending,
    error: sessionQuery.error ?? startMutation.error ?? null,
  };
};
