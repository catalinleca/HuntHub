import { useContext } from 'react';
import { SessionStateContext, SessionActionsContext } from './SessionContexts';
import type { SessionState, SessionActions } from './SessionContexts';

const useSessionState = (): SessionState => {
  const context = useContext(SessionStateContext);
  if (!context) {
    throw new Error('useSessionState must be used within PlaySessionProvider');
  }

  return context;
};

const useSessionActionsContext = (): SessionActions => {
  const context = useContext(SessionActionsContext);
  if (!context) {
    throw new Error('useSessionActions must be used within PlaySessionProvider');
  }

  return context;
};

export const useSessionId = () => useSessionState().sessionId;
export const useSessionStatus = () => useSessionState().status;
export const useSessionError = () => useSessionState().error;
export const useCurrentStep = () => useSessionState().currentStep;
export const useHuntMeta = () => useSessionState().huntMeta;
export const useIsLastStep = () => useSessionState().isLastStep;
export const usePreviewHint = () => useSessionState().previewHint;

export const useStepProgress = () => {
  const { currentStepIndex, totalSteps, isLastStep } = useSessionState();
  return { currentStepIndex, totalSteps, isLastStep };
};

export const useSessionActions = () => useSessionActionsContext();
export const useAdvanceToNextStep = () => useSessionActionsContext().advanceToNextStep;

export const usePlaySession = () => ({
  ...useSessionState(),
  ...useSessionActionsContext(),
});
