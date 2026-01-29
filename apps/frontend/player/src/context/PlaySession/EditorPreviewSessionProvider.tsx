import { useMemo, type ReactNode } from 'react';
import type { HuntMetaPF, StepPF, StepResponse } from '@hunthub/shared';
import { SessionStatus, SessionStateContext, SessionActionsContext } from './SessionContexts';
import type { SessionState, SessionActions } from './SessionContexts';

const NOOP = () => {};

const buildPreviewStepResponse = (
  step: StepPF | null | undefined,
  stepIndex: number | undefined,
  totalSteps: number | undefined,
): StepResponse | null => {
  if (!step || stepIndex === undefined || totalSteps === undefined) {
    return null;
  }

  return {
    step,
    stepIndex,
    totalSteps,
    attempts: 0,
    maxAttempts: step.maxAttempts ?? null,
    hintsUsed: 0,
    maxHints: step.hasHint ? 1 : 0,
    startedAt: null,
    _links: {
      self: { href: '' },
      validate: { href: '' },
    },
  };
};

interface EditorPreviewSessionProviderProps {
  children: ReactNode;
  previewHint?: string;
  huntMeta?: HuntMetaPF | null;
  step?: StepPF | null;
  stepIndex?: number;
  totalSteps?: number;
  isLastStep?: boolean;
}

export const EditorPreviewSessionProvider = ({
  children,
  previewHint,
  huntMeta,
  step,
  stepIndex,
  totalSteps,
  isLastStep = false,
}: EditorPreviewSessionProviderProps) => {
  const stepResponse = useMemo(
    () => buildPreviewStepResponse(step, stepIndex, totalSteps),
    [step, stepIndex, totalSteps],
  );

  const stateValue: SessionState = useMemo(
    () => ({
      status: SessionStatus.Playing,
      error: null,
      sessionId: null,
      huntMeta: huntMeta ?? null,
      stepResponse,
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
