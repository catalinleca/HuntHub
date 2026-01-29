import { Typography, CircularProgress } from '@mui/material';
import type { HuntMetaPF, StepPF } from '@hunthub/shared';
import type { ValidationMode } from '@hunthub/player-sdk';
import { EditorPreviewProvider, EditorPreviewSessionProvider } from '@/context';
import { StepRenderer } from '../../PlayPage/components/StepRenderer';
import { PreviewToolbar } from './PreviewToolbar';
import * as S from '../PreviewPage.styles';

interface PreviewContentProps {
  hunt: HuntMetaPF | null;
  currentStep: StepPF | null;
  stepIndex: number;
  totalSteps: number;
  isLastStep: boolean;
  isLoading: boolean;
  error: string | null;
  showToolbar: boolean;
  validationMode: ValidationMode;
  previewHint?: string;
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
  validationMode,
  previewHint,
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

  return (
    <S.Container>
      {showToolbar && (
        <PreviewToolbar currentStep={stepIndex} totalSteps={totalSteps} onPrev={onPrev} onNext={onNext} />
      )}

      <S.Content>
        <EditorPreviewSessionProvider
          previewHint={previewHint}
          huntMeta={hunt}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          isLastStep={isLastStep}
        >
          <EditorPreviewProvider key={currentStep.stepId} validationMode={validationMode}>
            <StepRenderer step={currentStep} isLastStep={isLastStep} />
          </EditorPreviewProvider>
        </EditorPreviewSessionProvider>
      </S.Content>
    </S.Container>
  );
};
