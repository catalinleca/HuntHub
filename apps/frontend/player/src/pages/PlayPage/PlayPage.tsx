import { useParams } from 'react-router-dom';
import { Typography, CircularProgress } from '@mui/material';
import { ChallengeType } from '@hunthub/shared';
import { PlaySessionProvider, usePlaySession, ApiValidationProvider } from '@/context';
import { PlayerIdentification } from './components/PlayerIdentification';
import { StepRenderer } from './components/StepRenderer';
import * as S from './PlayPage.styles';

const PlayPageContent = () => {
  const {
    isLoading,
    isComplete,
    hasSession,
    sessionId,
    huntMeta,
    currentStep,
    currentStepIndex,
    totalSteps,
    isLastStep,
    startSession,
    nextStepId,
  } = usePlaySession();

  if (isLoading) {
    return (
      <S.Container>
        <CircularProgress />
      </S.Container>
    );
  }

  if (!hasSession) {
    return (
      <S.Container>
        <PlayerIdentification onSubmit={startSession} isLoading={isLoading} />
      </S.Container>
    );
  }

  if (isComplete) {
    return (
      <S.Container>
        <Typography variant="h4">Hunt Complete!</Typography>
        <Typography color="text.secondary">Congratulations on finishing {huntMeta?.name}</Typography>
      </S.Container>
    );
  }

  if (!currentStep) {
    return (
      <S.Container>
        <Typography>Loading step...</Typography>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <S.Header>
        <Typography variant="h6">{huntMeta?.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          Step {currentStepIndex + 1} of {totalSteps}
        </Typography>
      </S.Header>

      <S.Content>
        <ApiValidationProvider
          key={currentStep.stepId}
          sessionId={sessionId!}
          nextStepId={nextStepId}
          showSuccessDialog={currentStep.type === ChallengeType.Task || currentStep.type === ChallengeType.Mission}
        >
          <StepRenderer step={currentStep} isLastStep={isLastStep} />
        </ApiValidationProvider>
      </S.Content>
    </S.Container>
  );
};

export const PlayPage = () => {
  const { playSlug } = useParams<{ playSlug?: string }>();

  if (!playSlug) {
    return (
      <S.Container>
        <Typography color="error">Invalid hunt link</Typography>
      </S.Container>
    );
  }

  return (
    <PlaySessionProvider playSlug={playSlug}>
      <PlayPageContent />
    </PlaySessionProvider>
  );
};
