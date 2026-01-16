import { useSessionLayer } from './useSessionLayer';
import { useStepLayer } from './useStepLayer';
import type { PlaySessionContextValue } from './context';

export const useSessionLogic = (huntId: number): PlaySessionContextValue => {
  const sessionLayer = useSessionLayer(huntId);
  const stepLayer = useStepLayer(sessionLayer.sessionId, sessionLayer.currentStepId);

  const hasSession = !!sessionLayer.session;
  const isLastStep = hasSession && !stepLayer.hasNextLink && stepLayer.currentStep !== null;
  const isComplete = hasSession && sessionLayer.status === 'completed';

  return {
    isLoading: sessionLayer.isLoading || stepLayer.isLoading,
    error: sessionLayer.error ?? stepLayer.error,

    sessionId: sessionLayer.sessionId,
    huntMeta: sessionLayer.huntMeta,
    currentStep: stepLayer.currentStep,
    currentStepIndex: sessionLayer.currentStepIndex,
    totalSteps: sessionLayer.totalSteps,

    startSession: sessionLayer.startSession,
    abandonSession: sessionLayer.abandonSession,

    hasSession,
    isLastStep,
    isComplete,

    nextStepId: stepLayer.nextStepId,
  };
};
