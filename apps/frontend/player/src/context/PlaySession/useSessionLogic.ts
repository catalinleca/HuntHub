import { useSessionLayer } from './useSessionLayer';
import { useStepLayer } from './useStepLayer';
import type { PlaySessionContextValue } from './context';

/**
 * Session logic for REGULAR mode only.
 * Preview mode is handled separately by PreviewFlow/usePreviewSession.
 */
export const useSessionLogic = (playSlug: string): PlaySessionContextValue => {
  const sessionLayer = useSessionLayer(playSlug);
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
    isPreview: false, // Regular mode is never preview
    stepOrder: sessionLayer.stepOrder,

    startSession: sessionLayer.startSession,
    abandonSession: sessionLayer.abandonSession,
    goToStep: () => {}, // No-op in regular mode (server-driven navigation)

    hasSession,
    isLastStep,
    isComplete,

    nextStepId: stepLayer.nextStepId,
  };
};
