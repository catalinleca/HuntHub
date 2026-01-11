import { useQueryClient } from '@tanstack/react-query';
import type { StepPF } from '@hunthub/shared';
import { useStartSession, useGetSession, playKeys } from '@/api';
import { sessionStorage } from '@/context';
import { useClearInvalidSession } from './useClearInvalidSession';
import type { PlaySessionContextValue } from './context';

export const useSessionLogic = (huntId: number): PlaySessionContextValue => {
  const queryClient = useQueryClient();
  const savedSessionId = sessionStorage.get(huntId);

  const sessionQuery = useGetSession(huntId, savedSessionId);
  const startMutation = useStartSession(huntId);

  useClearInvalidSession({
    huntId,
    savedSessionId,
    isLoading: sessionQuery.isLoading,
    hasData: !!sessionQuery.data,
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
  const currentStepIndex = session?.currentStepIndex ?? 0;
  const totalSteps = session?.hunt?.totalSteps ?? 0;
  const currentStep = queryClient.getQueryData<StepPF>(playKeys.step(huntId, currentStepIndex)) ?? null;

  return {
    isLoading: sessionQuery.isLoading || startMutation.isPending,
    error: sessionQuery.error ?? startMutation.error ?? null,

    sessionId: session?.sessionId ?? null,
    huntMeta: session?.hunt ?? null,
    currentStepIndex,
    currentStep,
    totalSteps,

    startSession,

    hasSession: !!session,
    isLastStep: currentStepIndex >= totalSteps - 1,
    isComplete: currentStepIndex >= totalSteps,
  };
};
