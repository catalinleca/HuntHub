import { useState, useMemo, useCallback } from 'react';
import type { Hunt, Step } from '@hunthub/shared';

interface PreviewCoreState {
  hunt: Hunt | null;
  stepIndex: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: PreviewCoreState = {
  hunt: null,
  stepIndex: 0,
  isLoading: false,
  error: null,
};

export const usePreviewCore = () => {
  const [state, setState] = useState<PreviewCoreState>(initialState);

  const steps = state.hunt?.steps ?? [];
  const totalSteps = steps.length;
  const lastStepIndex = Math.max(0, totalSteps - 1);

  const currentStep: Step | null = steps[state.stepIndex] ?? null;
  const isFirstStep = state.stepIndex === 0;
  const isLastStep = state.stepIndex === lastStepIndex;

  const ensureValidStepIndex = useCallback(
    (requestedIndex: number): number => {
      const minimumIndex = 0;
      const maximumIndex = lastStepIndex;

      const notBelowMinimum = Math.max(minimumIndex, requestedIndex);
      const notAboveMaximum = Math.min(maximumIndex, notBelowMinimum);

      return notAboveMaximum;
    },
    [lastStepIndex],
  );

  const goToStep = useCallback(
    (index: number) => {
      const validIndex = ensureValidStepIndex(index);
      setState((prev) => {
        return { ...prev, stepIndex: validIndex };
      });
    },
    [ensureValidStepIndex],
  );

  const goToNextStep = useCallback(() => {
    goToStep(state.stepIndex + 1);
  }, [goToStep, state.stepIndex]);

  const goToPrevStep = useCallback(() => {
    goToStep(state.stepIndex - 1);
  }, [goToStep, state.stepIndex]);

  const setHunt = useCallback((hunt: Hunt) => {
    setState((prev) => {
      return { ...prev, hunt, stepIndex: 0, isLoading: false, error: null };
    });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => {
      return { ...prev, isLoading };
    });
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => {
      return { ...prev, error, isLoading: false };
    });
  }, []);

  return useMemo(() => {
    return {
      hunt: state.hunt,
      currentStep,
      stepIndex: state.stepIndex,
      totalSteps,
      isFirstStep,
      isLastStep,
      isLoading: state.isLoading,
      error: state.error,

      goToStep,
      goToNextStep,
      goToPrevStep,
      setHunt,
      setLoading,
      setError,
    };
  }, [
    state.hunt,
    state.stepIndex,
    state.isLoading,
    state.error,
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    goToStep,
    goToNextStep,
    goToPrevStep,
    setHunt,
    setLoading,
    setError,
  ]);
};

export type PreviewCore = ReturnType<typeof usePreviewCore>;
