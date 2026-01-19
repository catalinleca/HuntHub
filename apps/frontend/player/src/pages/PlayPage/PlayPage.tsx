import { useParams } from 'react-router-dom';
import { Typography, CircularProgress } from '@mui/material';
import { ChallengeType } from '@hunthub/shared';
import { PlaySessionProvider, usePlaySession, ApiValidationProvider } from '@/context';
import { parseApiError, ErrorCode } from '@/utils';
import { PlayerIdentification } from './components/PlayerIdentification';
import { StepRenderer } from './components/StepRenderer';
import { ErrorState } from './components/ErrorState';
import * as S from './PlayPage.styles';

const playErrorContent: Record<string, { title: string; description: string }> = {
  [ErrorCode.NOT_FOUND]: {
    title: 'Hunt Not Found',
    description: 'This hunt link may be invalid or the hunt no longer exists.',
  },
  [ErrorCode.NOT_INVITED]: {
    title: 'Not Invited',
    description: 'You have not been invited to this hunt. Please check with the hunt creator.',
  },
  [ErrorCode.FORBIDDEN]: {
    title: 'Hunt Not Available',
    description: 'This hunt has been taken offline by its creator.',
  },
  [ErrorCode.NETWORK_ERROR]: {
    title: 'Connection Error',
    description: 'Unable to connect to the server. Please check your internet connection.',
  },
};

const defaultErrorContent = {
  title: 'Something Went Wrong',
  description: 'Please try again.',
};

const PlayPageContent = () => {
  const {
    isLoading,
    error,
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

  if (error) {
    const { code } = parseApiError(error);
    const content = playErrorContent[code] || defaultErrorContent;
    const isRecoverable = code === ErrorCode.NETWORK_ERROR;

    return (
      <ErrorState
        title={content.title}
        description={content.description}
        onRetry={isRecoverable ? () => window.location.reload() : undefined}
      />
    );
  }

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
    return <ErrorState title="Invalid Link" description="This hunt link appears to be invalid." />;
  }

  return (
    <PlaySessionProvider playSlug={playSlug}>
      <PlayPageContent />
    </PlaySessionProvider>
  );
};
