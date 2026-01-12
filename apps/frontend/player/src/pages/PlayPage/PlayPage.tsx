import { useParams } from 'react-router-dom';
import { Typography, CircularProgress } from '@mui/material';
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
        <ApiValidationProvider sessionId={sessionId!} stepId={currentStep.stepId}>
          <StepRenderer step={currentStep} isLastStep={isLastStep} />
        </ApiValidationProvider>
      </S.Content>
    </S.Container>
  );
};

export const PlayPage = () => {
  const { huntId } = useParams<{ huntId?: string }>();
  const huntIdNum = Number(huntId);
  const isValidHuntId = Number.isInteger(huntIdNum) && huntIdNum > 0;

  if (!isValidHuntId) {
    return (
      <S.Container>
        <Typography color="error">Invalid hunt ID</Typography>
      </S.Container>
    );
  }

  return (
    <PlaySessionProvider huntId={huntIdNum}>
      <PlayPageContent />
    </PlaySessionProvider>
  );
};
