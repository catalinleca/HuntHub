import { useParams } from 'react-router-dom';
import { Typography, CircularProgress } from '@mui/material';
import { ChallengeType } from '@hunthub/shared';
import {
  PlaySessionProvider,
  useSessionStatus,
  useSessionError,
  useSessionActions,
  useCurrentStep,
  useHuntMeta,
  useIsLastStep,
  useStepProgress,
  ApiValidationProvider,
} from '@/context';
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

const LoadingView = () => (
  <S.Container>
    <CircularProgress />
  </S.Container>
);

const ErrorView = () => {
  const error = useSessionError();
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
};

const IdentifyingView = () => {
  const { startSession } = useSessionActions();

  return (
    <S.Container>
      <PlayerIdentification onSubmit={startSession} isLoading={false} />
    </S.Container>
  );
};

const CompletedView = () => {
  const huntMeta = useHuntMeta();

  return (
    <S.Container>
      <Typography variant="h4">Hunt Complete!</Typography>
      <Typography color="text.secondary">Congratulations on finishing {huntMeta?.name}</Typography>
    </S.Container>
  );
};

const PlayingView = () => {
  const currentStep = useCurrentStep();
  const huntMeta = useHuntMeta();
  const isLastStep = useIsLastStep();
  const { currentStepIndex, totalSteps } = useStepProgress();
  const { advanceToNextStep } = useSessionActions();

  if (!currentStep) {
    return <LoadingView />;
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
          onAdvance={advanceToNextStep}
          showSuccessDialog={currentStep.type === ChallengeType.Task || currentStep.type === ChallengeType.Mission}
        >
          <StepRenderer step={currentStep} isLastStep={isLastStep} />
        </ApiValidationProvider>
      </S.Content>
    </S.Container>
  );
};

const PlayPageContent = () => {
  const status = useSessionStatus();

  switch (status) {
    case 'loading':
      return <LoadingView />;
    case 'error':
      return <ErrorView />;
    case 'identifying':
      return <IdentifyingView />;
    case 'completed':
      return <CompletedView />;
    case 'playing':
      return <PlayingView />;
  }
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
