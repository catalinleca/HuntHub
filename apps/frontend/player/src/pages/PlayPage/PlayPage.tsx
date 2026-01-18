import { useParams, useSearchParams } from 'react-router-dom';
import { Typography, CircularProgress } from '@mui/material';
import { ChallengeType, HuntAccessMode } from '@hunthub/shared';
import { useGetHuntInfo } from '@/api';
import { PlaySessionProvider, usePlaySession, ApiValidationProvider } from '@/context';
import { PlayerIdentification } from './components/PlayerIdentification';
import { StepRenderer } from './components/StepRenderer';
import { PreviewToolbar } from '../PreviewPage/components/PreviewToolbar';
import * as S from './PlayPage.styles';

interface PlayPageContentProps {
  accessMode: HuntAccessMode;
}

const PlayPageContent = ({ accessMode }: PlayPageContentProps) => {
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
    isPreview,
    startSession,
    goToStep,
    nextStepId,
    error,
  } = usePlaySession();

  const handlePrev = () => goToStep(currentStepIndex - 1);
  const handleNext = () => goToStep(currentStepIndex + 1);

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
        <PlayerIdentification
          onSubmit={startSession}
          isLoading={isLoading}
          requireEmail={accessMode === HuntAccessMode.InviteOnly}
          error={error?.message}
        />
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
    <>
      {isPreview && (
        <PreviewToolbar
          currentStep={currentStepIndex}
          totalSteps={totalSteps}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
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
            stepId={isPreview ? currentStep.stepId : undefined}
            showSuccessDialog={currentStep.type === ChallengeType.Task || currentStep.type === ChallengeType.Mission}
          >
            <StepRenderer step={currentStep} isLastStep={isLastStep} />
          </ApiValidationProvider>
        </S.Content>
      </S.Container>
    </>
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

  return <PlayPageWithSlug playSlug={playSlug} />;
};

const PlayPageWithSlug = ({ playSlug }: { playSlug: string }) => {
  const [searchParams] = useSearchParams();
  const hasPreviewToken = searchParams.has('preview');
  const { data: huntInfo, isLoading, error } = useGetHuntInfo(playSlug);

  if (isLoading) {
    return (
      <S.Container>
        <CircularProgress />
      </S.Container>
    );
  }

  if (error || !huntInfo) {
    return (
      <S.Container>
        <Typography variant="h5" gutterBottom>
          Hunt not found
        </Typography>
        <Typography color="text.secondary">This hunt doesn't exist or the link may be incorrect.</Typography>
      </S.Container>
    );
  }

  // Allow access if released OR if preview token is present
  if (!huntInfo.isReleased && !hasPreviewToken) {
    return (
      <S.Container>
        <Typography variant="h5" gutterBottom>
          {huntInfo.name}
        </Typography>
        <Typography color="text.secondary">This hunt isn't available yet. Check back later!</Typography>
      </S.Container>
    );
  }

  return (
    <PlaySessionProvider playSlug={playSlug}>
      <PlayPageContent accessMode={huntInfo.accessMode} />
    </PlaySessionProvider>
  );
};
