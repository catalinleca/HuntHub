import { useState, useCallback, type ReactNode } from 'react';
import { CircularProgress, Typography } from '@mui/material';
import { HuntProgressStatus } from '@hunthub/shared';
import { PlaySessionContext } from './context';
import { usePreviewSession } from './usePreviewSession';
import { useStepLayer } from './useStepLayer';

interface PreviewFlowProps {
  playSlug: string;
  previewToken: string;
  children: ReactNode;
}

export const PreviewFlow = ({ playSlug, previewToken, children }: PreviewFlowProps) => {
  const { data: session, isLoading, error } = usePreviewSession(playSlug, previewToken);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error || !session) {
    return <Typography color="error">Failed to start preview: {error?.message}</Typography>;
  }

  return (
    <PreviewSessionReady session={session} playSlug={playSlug}>
      {children}
    </PreviewSessionReady>
  );
};

interface PreviewSessionReadyProps {
  session: NonNullable<ReturnType<typeof usePreviewSession>['data']>;
  playSlug: string;
  children: ReactNode;
}

const PreviewSessionReady = ({ session, playSlug, children }: PreviewSessionReadyProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const stepOrder = session.stepOrder ?? [];
  const currentStepId = stepOrder[currentStepIndex] ?? null;

  const stepLayer = useStepLayer(session.sessionId, currentStepId);

  // Guard against stale step data during navigation
  // When navigating, currentStepId updates immediately but stepLayer.currentStep may lag
  // This ensures we never render with mismatched step data (which causes wrong answer types)
  const isStepSynced = stepLayer.currentStep?.stepId === currentStepId;
  const effectiveIsLoading = stepLayer.isLoading || (currentStepId !== null && !isStepSynced);

  const goToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex >= 0 && stepIndex < stepOrder.length) {
        setCurrentStepIndex(stepIndex);
      }
    },
    [stepOrder.length],
  );

  const abandonSession = useCallback(() => {
    window.location.reload();
  }, []);

  // No-op for preview
  const startSession = useCallback(() => {}, []);

  const value = {
    isLoading: effectiveIsLoading,
    error: stepLayer.error,

    sessionId: session.sessionId,
    huntMeta: session.hunt,
    currentStep: isStepSynced ? stepLayer.currentStep : null,
    currentStepIndex,
    totalSteps: stepOrder.length,
    isPreview: true,
    stepOrder,

    startSession,
    abandonSession,
    goToStep,

    hasSession: true,
    isLastStep: currentStepIndex === stepOrder.length - 1,
    isComplete: session.status === HuntProgressStatus.Completed,
    nextStepId: stepLayer.nextStepId,
  };

  return <PlaySessionContext.Provider value={value}>{children}</PlaySessionContext.Provider>;
};
