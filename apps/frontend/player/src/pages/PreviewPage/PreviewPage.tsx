import { Typography, CircularProgress } from '@mui/material';
import { usePreviewMode, playerMessages, sendToEditor } from '@/hooks';
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
    totalSteps,
    isLastStep,
    isLoading,
    error,
    isEmbedded,
    goToNextStep,
    goToPrevStep,
  } = usePreviewMode();

  const handleValidated = (result: ValidationResult) => {
    if (isEmbedded) {
      sendToEditor(playerMessages.stepValidated(result.isCorrect, result.feedback));
      return;
    }

    if (result.isCorrect && !isLastStep) {
      goToNextStep();
    }
  };

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

  if (!hunt) {
    return (
      <S.CenteredContainer>
        <Typography variant="h5">Preview Mode</Typography>
        <Typography color="text.secondary">Waiting for hunt data from Editor...</Typography>
      </S.CenteredContainer>
    );
  }

  if (!currentStep) {
    return (
      <S.CenteredContainer>
        <Typography color="text.secondary">No steps in this hunt</Typography>
      </S.CenteredContainer>
    );
  }

  const stepForPlayer = stripAnswers(currentStep);

  return (
    <S.Container>
      {!isEmbedded && (
        <PreviewToolbar currentStep={stepIndex} totalSteps={totalSteps} onPrev={goToPrevStep} onNext={goToNextStep} />
      )}

      <S.Content>
        <MockValidationProvider key={currentStep.stepId} step={currentStep} onValidated={handleValidated}>
          <StepRenderer step={stepForPlayer} isLastStep={isLastStep} />
        </MockValidationProvider>
      </S.Content>
    </S.Container>
  );
};
