import { useStartSession, useGetSession, useCurrentStep, usePrefetchNextStep } from '@/api';
import { sessionStorage } from '@/context';
import { useClearInvalidSession } from './useClearInvalidSession';
import type { PlaySessionContextValue } from './context';

export const useSessionLogic = (huntId: number): PlaySessionContextValue => {
  const savedSessionId = sessionStorage.get(huntId);

  const sessionQuery = useGetSession(huntId, savedSessionId);
  const startMutation = useStartSession(huntId);

  useClearInvalidSession({
    huntId,
    savedSessionId,
    isLoading: sessionQuery.isLoading,
    hasData: !!sessionQuery.data,
  });

  const session = sessionQuery.data;
  const sessionId = session?.sessionId ?? null;

  // Fetch current step via HATEOAS endpoint
  const currentStepQuery = useCurrentStep(sessionId);
  const currentStepData = currentStepQuery.data;

  // Prefetch next step if link exists (HATEOAS-driven)
  const hasNextLink = !!currentStepData?._links.next;
  usePrefetchNextStep(sessionId, hasNextLink);

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

  const currentStep = currentStepData?.step ?? null;
  const stepLinks = currentStepData?._links ?? null;
  const currentStepIndex = session?.currentStepIndex ?? 0;
  const totalSteps = session?.hunt?.totalSteps ?? 0;

  // HATEOAS-driven navigation: isLastStep when no "next" link
  const isLastStep = !!session && !hasNextLink && currentStep !== null;
  // isComplete when session exists but no current step (all steps done)
  const isComplete = !!session && currentStep === null;

  return {
    isLoading: sessionQuery.isLoading || currentStepQuery.isLoading || startMutation.isPending,
    error: sessionQuery.error ?? currentStepQuery.error ?? startMutation.error ?? null,

    sessionId,
    huntMeta: session?.hunt ?? null,
    currentStep,
    stepLinks,
    currentStepIndex,
    totalSteps,

    startSession,

    hasSession: !!session,
    isLastStep,
    isComplete,
  };
};
