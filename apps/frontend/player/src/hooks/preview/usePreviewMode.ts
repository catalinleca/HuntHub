import { useMemo } from 'react';
import { usePreviewCore } from './usePreviewCore';
import { useEmbeddedPreview } from './useEmbeddedPreview';
import { useStandalonePreview } from './useStandalonePreview';

export const usePreviewMode = () => {
  const core = usePreviewCore();
  const { isEmbedded } = useEmbeddedPreview({ core });

  useStandalonePreview({ core, isEmbedded });

  return useMemo(() => {
    return {
      hunt: core.hunt,
      currentStep: core.currentStep,
      stepIndex: core.stepIndex,
      totalSteps: core.totalSteps,
      isFirstStep: core.isFirstStep,
      isLastStep: core.isLastStep,
      isLoading: core.isLoading,
      error: core.error,
      isEmbedded,

      goToStep: core.goToStep,
      goToNextStep: core.goToNextStep,
      goToPrevStep: core.goToPrevStep,
    };
  }, [
    core.hunt,
    core.currentStep,
    core.stepIndex,
    core.totalSteps,
    core.isFirstStep,
    core.isLastStep,
    core.isLoading,
    core.error,
    isEmbedded,
    core.goToStep,
    core.goToNextStep,
    core.goToPrevStep,
  ]);
};