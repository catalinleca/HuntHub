import { useState, useMemo, useCallback } from 'react';
import type { HuntMetaPF, StepPF } from '@hunthub/shared';
import type { PreviewData } from '@hunthub/player-sdk';

interface PreviewCoreState {
  hunt: HuntMetaPF | null;
  steps: StepPF[];
  stepIndex: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: PreviewCoreState = {
  hunt: null,
  steps: [],
  stepIndex: 0,
  isLoading: false,
  error: null,
};

const clampStepIndex = (steps: StepPF[], requestedIndex: number): number => {
  const maxIndex = Math.max(0, steps.length - 1);
  return Math.max(0, Math.min(maxIndex, requestedIndex));
};

export const usePreviewCore = () => {
  const [state, setState] = useState<PreviewCoreState>(initialState);

  const steps = state.steps;
  const totalSteps = steps.length;
  const lastStepIndex = Math.max(0, totalSteps - 1);

  const currentStep: StepPF | null = steps[state.stepIndex] ?? null;
  const isFirstStep = state.stepIndex === 0;
  const isLastStep = state.stepIndex === lastStepIndex;

  const goToStep = useCallback((index: number) => {
    setState((prev) => {
      return { ...prev, stepIndex: clampStepIndex(prev.steps, index) };
    });
  }, []);

  const goToNextStep = useCallback(() => {
    setState((prev) => {
      return { ...prev, stepIndex: clampStepIndex(prev.steps, prev.stepIndex + 1) };
    });
  }, []);

  const goToPrevStep = useCallback(() => {
    setState((prev) => {
      return { ...prev, stepIndex: clampStepIndex(prev.steps, prev.stepIndex - 1) };
    });
  }, []);

  /**
   * Set hunt data from Editor via SDK
   * Receives sanitized PreviewData { hunt: HuntMetaPF, steps: StepPF[] }
   */
  const setHunt = useCallback((data: PreviewData) => {
    setState((prev) => {
      const preservedStepIndex = clampStepIndex(data.steps, prev.stepIndex);
      return {
        ...prev,
        hunt: data.hunt,
        steps: data.steps,
        stepIndex: preservedStepIndex,
        isLoading: false,
        error: null,
      };
    });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => {
      return { ...prev, isLoading };
    });
  }, []);

  const setError = useCallback((error: string | null) => {
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
