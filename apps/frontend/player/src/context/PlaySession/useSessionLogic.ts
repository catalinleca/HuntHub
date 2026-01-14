import { useSessionLayer } from './useSessionLayer';
import { useStepLayer } from './useStepLayer';
import type { PlaySessionContextValue } from './context';

export const useSessionLogic = (huntId: number): PlaySessionContextValue => {
  const sessionLayer = useSessionLayer(huntId);

  // Pass currentStep from session to step layer for prefetching
  const stepLayer = useStepLayer(sessionLayer.sessionId, sessionLayer.session?.currentStep);

  const hasSession = !!sessionLayer.session;
  const isLastStep = hasSession && !stepLayer.hasNextLink && stepLayer.currentStep !== null;
  const isComplete = hasSession && sessionLayer.session?.status === 'completed';

  return {
    isLoading: sessionLayer.isLoading,
    error: sessionLayer.error ?? stepLayer.prefetchError,

    sessionId: sessionLayer.sessionId,
    huntMeta: sessionLayer.huntMeta,
    currentStep: stepLayer.currentStep,
    currentStepIndex: sessionLayer.currentStepIndex,
    totalSteps: sessionLayer.huntMeta?.totalSteps ?? 0,

    startSession: sessionLayer.startSession,

    hasSession,
    isLastStep,
    isComplete,
  };
};
