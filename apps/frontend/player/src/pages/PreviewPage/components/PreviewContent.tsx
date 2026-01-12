import { Typography, CircularProgress } from '@mui/material';
import type { Hunt, Step } from '@hunthub/shared';
import { MockValidationProvider, type ValidationResult } from '@/context';
import { stripAnswers } from '@/utils';
import { StepRenderer } from '../../PlayPage/components/StepRenderer';
import { PreviewToolbar } from './PreviewToolbar';
import * as S from '../PreviewPage.styles';

interface PreviewContentProps {
  hunt: Hunt | null;
  currentStep: Step | null;
  stepIndex: number;
  totalSteps: number;
  isLastStep: boolean;
  isLoading: boolean;
  error: string | null;
  showToolbar: boolean;
  onValidated: (result: ValidationResult) => void;
  onPrev: () => void;
  onNext: () => void;
  emptyStateMessage: string;
}

export const PreviewContent = ({
  hunt,
  currentStep,
  stepIndex,
  totalSteps,
  isLastStep,
  isLoading,
  error,
  showToolbar,
  onValidated,
  onPrev,
  onNext,
  emptyStateMessage,
}: PreviewContentProps) => {
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
        <Typography color="text.secondary">{emptyStateMessage}</Typography>
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
      {showToolbar && (
        <PreviewToolbar currentStep={stepIndex} totalSteps={totalSteps} onPrev={onPrev} onNext={onNext} />
      )}

      <S.Content>
        <MockValidationProvider key={currentStep.stepId} step={currentStep} onValidated={onValidated}>
          <StepRenderer step={stepForPlayer} isLastStep={isLastStep} />
        </MockValidationProvider>
      </S.Content>
    </S.Container>
  );
};
