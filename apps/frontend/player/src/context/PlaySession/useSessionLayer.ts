import { useStartSession, useGetSession } from '@/api';
import { sessionStorage } from '@/context';
import { useClearInvalidSession } from './useClearInvalidSession';

export const useSessionLayer = (huntId: number) => {
  const savedSessionId = sessionStorage.get(huntId);
  const sessionQuery = useGetSession(huntId, savedSessionId);
  const startMutation = useStartSession(huntId);

  useClearInvalidSession({
    huntId,
    savedSessionId,
    isLoading: sessionQuery.isLoading,
    hasData: !!sessionQuery.data,
    error: sessionQuery.error,
  });

  const startSession = (playerName: string, email?: string) => {
    startMutation.mutate(
      { playerName, email },
      {
        onSuccess: (data) => {
          sessionStorage.set(huntId, data.sessionId);
        },
      },
    );
  };

  const session = sessionQuery.data;

  return {
    session,
    sessionId: session?.sessionId ?? null,
    huntMeta: session?.hunt ?? null,
    currentStepIndex: session?.currentStepIndex ?? 0,
    startSession,
    isLoading: sessionQuery.isLoading || startMutation.isPending,
    error: sessionQuery.error ?? startMutation.error ?? null,
  };
};
