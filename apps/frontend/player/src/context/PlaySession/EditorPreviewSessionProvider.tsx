import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { PlaySessionContext, type PlaySessionContextValue } from './context';

const NOOP = () => {};

interface EditorPreviewSessionProviderProps {
  children: ReactNode;
  previewHint?: string;
}

export const EditorPreviewSessionProvider = ({ children, previewHint }: EditorPreviewSessionProviderProps) => {
  const value = useMemo<PlaySessionContextValue>(
    () => ({
      isLoading: false,
      error: null,
      sessionId: null,
      huntMeta: null,
      currentStep: null,
      currentStepIndex: 0,
      totalSteps: 0,
      isPreview: false,
      stepOrder: [],
      startSession: NOOP,
      abandonSession: NOOP,
      goToStep: NOOP,
      hasSession: false,
      isLastStep: false,
      isComplete: false,
      nextStepId: null,
      previewHint,
    }),
    [previewHint],
  );

  return <PlaySessionContext.Provider value={value}>{children}</PlaySessionContext.Provider>;
};
