import { useContext } from 'react';
import type { StepResponse } from '@hunthub/shared';
import { SessionStateContext, SessionActionsContext } from './SessionContexts';
import type { SessionState, SessionActions } from './SessionContexts';

export type StepPlayProgress = Pick<StepResponse, 'attempts' | 'hintsUsed' | 'startedAt'>;

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
export const useHuntMeta = () => useSessionState().huntMeta;
export const useIsLastStep = () => useSessionState().isLastStep;
export const usePreviewHint = () => useSessionState().previewHint;

export const useStepResponse = () => useSessionState().stepResponse;
export const useCurrentStep = () => useSessionState().stepResponse?.step ?? null;

export const useStepProgress = () => {
  const { stepResponse, isLastStep } = useSessionState();

  return {
    currentStepIndex: stepResponse?.stepIndex ?? 0,
    totalSteps: stepResponse?.totalSteps ?? 0,
    isLastStep,
  };
};

export const useStepPlayProgress = (): StepPlayProgress | null => {
  const stepResponse = useSessionState().stepResponse;
  if (!stepResponse) {
    return null;
  }

  return {
    attempts: stepResponse.attempts,
    hintsUsed: stepResponse.hintsUsed,
    startedAt: stepResponse.startedAt,
  };
};

export const useSessionActions = () => useSessionActionsContext();
export const useAdvanceToNextStep = () => useSessionActionsContext().advanceToNextStep;

export const usePlaySession = () => ({
  ...useSessionState(),
  ...useSessionActionsContext(),
});
