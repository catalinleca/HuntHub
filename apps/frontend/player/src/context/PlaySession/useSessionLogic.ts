import { useSessionLayer } from './useSessionLayer';
import { useStepLayer } from './useStepLayer';
import type { PlaySessionContextValue } from './context';

export const useSessionLogic = (huntId: number): PlaySessionContextValue => {
  const sessionLayer = useSessionLayer(huntId);
  const stepLayer = useStepLayer(sessionLayer.sessionId);

  const hasSession = !!sessionLayer.session;
  const isLastStep = hasSession && !stepLayer.hasNextLink && stepLayer.currentStep !== null;
  const isComplete = hasSession && stepLayer.currentStep === null;

  return {
    isLoading: sessionLayer.isLoading || stepLayer.isLoading,
    error: sessionLayer.error ?? stepLayer.error,

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
