import { useMemo, type ReactNode } from 'react';
import type { HuntMetaPF, StepResponse } from '@hunthub/shared';
import { SessionStatus, SessionStateContext, SessionActionsContext } from './SessionContexts';
import type { SessionState, SessionActions } from './SessionContexts';

const NOOP = () => {};

interface EditorPreviewSessionProviderProps {
  children: ReactNode;
  previewHint?: string;
  huntMeta?: HuntMetaPF | null;
  stepIndex?: number;
  totalSteps?: number;
  isLastStep?: boolean;
}

export const EditorPreviewSessionProvider = ({
  children,
  previewHint,
  huntMeta,
  stepIndex,
  totalSteps,
  isLastStep = false,
}: EditorPreviewSessionProviderProps) => {
  const stepResponse: Partial<StepResponse> | null = useMemo(() => {
    if (stepIndex === undefined || totalSteps === undefined) {
      return null;
    }

    return {
      stepIndex,
      totalSteps,
    };
  }, [stepIndex, totalSteps]);

  const stateValue: SessionState = useMemo(
    () => ({
      status: SessionStatus.Playing,
      error: null,
      sessionId: null,
      huntMeta: huntMeta ?? null,
      stepResponse: stepResponse as StepResponse | null,
      isLastStep,
      startedAt: null,
      completedAt: null,
      previewHint,
    }),
    [huntMeta, stepResponse, isLastStep, previewHint],
  );

  const actionsValue: SessionActions = useMemo(
    () => ({
      startSession: NOOP,
      abandonSession: NOOP,
      advanceToNextStep: NOOP,
    }),
    [],
  );

  return (
    <SessionActionsContext.Provider value={actionsValue}>
      <SessionStateContext.Provider value={stateValue}>{children}</SessionStateContext.Provider>
    </SessionActionsContext.Provider>
  );
};
