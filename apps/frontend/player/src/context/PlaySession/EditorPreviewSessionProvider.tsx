import { useMemo, type ReactNode } from 'react';
import { SessionStateContext, SessionActionsContext } from './contexts';
import type { SessionState, SessionActions } from './types';

const NOOP = () => {};

interface EditorPreviewSessionProviderProps {
  children: ReactNode;
  previewHint?: string;
}

export const EditorPreviewSessionProvider = ({ children, previewHint }: EditorPreviewSessionProviderProps) => {
  const stateValue: SessionState = useMemo(
    () => ({
      status: 'playing',
      error: null,
      sessionId: null,
      huntMeta: null,
      currentStep: null,
      currentStepIndex: 0,
      totalSteps: 0,
      isLastStep: false,
      previewHint,
    }),
    [previewHint],
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
