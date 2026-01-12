import { useEffect } from 'react';
import { usePreviewCore } from '@/hooks/preview/usePreviewCore';
import { loadMockPreviewHunt } from '@/api/preview';
import type { ValidationResult } from '@/context';
import { PreviewContent } from './PreviewContent';

export const StandalonePreview = () => {
  const core = usePreviewCore();
  const { hunt, setHunt, setLoading, setError } = core;

  useEffect(() => {
    if (hunt) {
      return;
    }

    const loadMockHuntData = async () => {
      setLoading(true);

      try {
        const mockHunt = await loadMockPreviewHunt();
        setHunt(mockHunt);
      } catch {
        setError('Failed to load mock hunt data');
      }
    };

    loadMockHuntData();
  }, [hunt, setHunt, setLoading, setError]);

  const handleValidated = (result: ValidationResult) => {
    if (result.isCorrect && !core.isLastStep) {
      core.goToNextStep();
    }
  };

  return (
    <PreviewContent
      hunt={core.hunt}
      currentStep={core.currentStep}
      stepIndex={core.stepIndex}
      totalSteps={core.totalSteps}
      isLastStep={core.isLastStep}
      isLoading={core.isLoading}
      error={core.error}
      showToolbar={true}
      onValidated={handleValidated}
      onPrev={core.goToPrevStep}
      onNext={core.goToNextStep}
      emptyStateMessage="Loading mock hunt data..."
    />
  );
};
