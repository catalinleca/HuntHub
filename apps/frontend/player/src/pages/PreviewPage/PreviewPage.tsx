import { Typography, CircularProgress } from '@mui/material';
import { usePreviewMode } from '@/hooks';
import { MockValidationProvider, type ValidationResult } from '@/context';
import { stripAnswers } from '@/utils';
import { StepRenderer } from '../PlayPage/components/StepRenderer';
import { PreviewToolbar } from './components/PreviewToolbar';
import * as S from './PreviewPage.styles';

export const PreviewPage = () => {
  const {
    hunt,
    currentStep,
    stepIndex,
    setStepIndex,
    isEmbedded,
    totalSteps,
    isLastStep,
    isLoading,
    error,
  } = usePreviewMode();

  /**
   * Handle validation result
   * - Embedded mode: notify Editor via postMessage (don't auto-advance)
   * - Standalone mode: auto-advance to next step on correct answer
   */
  const handleValidated = (result: ValidationResult) => {
    if (isEmbedded) {
      // Notify Editor, don't advance (Editor controls navigation)
      window.parent.postMessage(
        {
          type: 'STEP_VALIDATED',
          isCorrect: result.isCorrect,
          feedback: result.feedback,
        },
        '*'
      );
    } else {
      // Standalone: advance on correct answer
      if (result.isCorrect && !isLastStep) {
        setStepIndex((i) => i + 1);
      }
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <S.CenteredContainer>
        <CircularProgress />
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Loading preview...
        </Typography>
      </S.CenteredContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <S.CenteredContainer>
        <Typography color="error" variant="h6">
          Error
        </Typography>
        <Typography color="text.secondary">{error}</Typography>
      </S.CenteredContainer>
    );
  }

  // No hunt data
  if (!hunt) {
    return (
      <S.CenteredContainer>
        <Typography variant="h5">Preview Mode</Typography>
        <Typography color="text.secondary">
          Waiting for hunt data from Editor...
        </Typography>
      </S.CenteredContainer>
    );
  }

  // No current step (shouldn't happen if hunt has steps)
  if (!currentStep) {
    return (
      <S.CenteredContainer>
        <Typography color="text.secondary">No steps in this hunt</Typography>
      </S.CenteredContainer>
    );
  }

  // Convert full Step to StepPF (strip answers for display)
  const stepPF = stripAnswers(currentStep);

  return (
    <S.Container>
      {/* Toolbar - only show in standalone mode */}
      {!isEmbedded && (
        <PreviewToolbar
          currentStep={stepIndex}
          totalSteps={totalSteps}
          onPrev={() => setStepIndex((i) => i - 1)}
          onNext={() => setStepIndex((i) => i + 1)}
        />
      )}

      {/* Step content */}
      <S.Content>
        <MockValidationProvider key={currentStep.stepId} step={currentStep} onValidated={handleValidated}>
          <StepRenderer step={stepPF} isLastStep={isLastStep} />
        </MockValidationProvider>
      </S.Content>
    </S.Container>
  );
};
