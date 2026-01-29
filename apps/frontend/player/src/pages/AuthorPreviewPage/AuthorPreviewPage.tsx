import { useSearchParams } from 'react-router-dom';
import { Stack, Typography, CircularProgress } from '@mui/material';
import { ChallengeType } from '@hunthub/shared';
import {
  AuthorPreviewSessionProvider,
  SessionStatus,
  useSessionStatus,
  useSessionError,
  useCurrentStep,
  useHuntMeta,
  useIsLastStep,
  useSessionActions,
  ApiValidationProvider,
} from '@/context';
import { parseApiError, ErrorCode } from '@/utils';
import { PreviewNavigation } from '@/components/preview';
import { StepRenderer } from '../PlayPage/components/StepRenderer';
import { ErrorState } from '../PlayPage/components/ErrorState';
import * as S from './AuthorPreviewPage.styles';

const previewErrorContent: Record<string, { title: string; description: string }> = {
  [ErrorCode.NOT_FOUND]: {
    title: 'Preview Not Found',
    description: 'This preview link may be invalid or has expired.',
  },
  [ErrorCode.UNAUTHORIZED]: {
    title: 'Preview Expired',
    description: 'This preview link has expired. Please generate a new one from the editor.',
  },
  [ErrorCode.NETWORK_ERROR]: {
    title: 'Connection Error',
    description: 'Unable to connect to the server. Please check your internet connection.',
  },
};

const defaultErrorContent = {
  title: 'Something Went Wrong',
  description: 'Please try again or generate a new preview link.',
};

const LoadingView = () => (
  <S.CenteredContainer>
    <CircularProgress />
  </S.CenteredContainer>
);

const ErrorView = () => {
  const error = useSessionError();
  const { code } = parseApiError(error);
  const content = previewErrorContent[code] || defaultErrorContent;
  const isRecoverable = code === ErrorCode.NETWORK_ERROR;

  return (
    <ErrorState
      title={content.title}
      description={content.description}
      onRetry={isRecoverable ? () => window.location.reload() : undefined}
    />
  );
};

const CompletedView = () => {
  const huntMeta = useHuntMeta();

  return (
    <S.PageContainer>
      <PreviewNavigation />
      <Stack alignItems="center" sx={{ p: 2 }}>
        <Typography variant="h4">Preview Complete</Typography>
        <Typography color="text.secondary">You've previewed all steps of {huntMeta?.name}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Use the navigation above to review any step.
        </Typography>
      </Stack>
    </S.PageContainer>
  );
};

const PlayingView = () => {
  const currentStep = useCurrentStep();
  const isLastStep = useIsLastStep();
  const { advanceToNextStep } = useSessionActions();

  if (!currentStep) {
    return <LoadingView />;
  }

  return (
    <S.PageContainer>
      <PreviewNavigation />

      <S.Content sx={{ p: 2 }}>
        <ApiValidationProvider
          key={currentStep.stepId}
          onAdvance={advanceToNextStep}
          showSuccessDialog={currentStep.type === ChallengeType.Task || currentStep.type === ChallengeType.Mission}
        >
          <StepRenderer step={currentStep} isLastStep={isLastStep} />
        </ApiValidationProvider>
      </S.Content>
    </S.PageContainer>
  );
};

const AuthorPreviewPageContent = () => {
  const status = useSessionStatus();

  switch (status) {
    case SessionStatus.Loading:
      return <LoadingView />;
    case SessionStatus.Error:
      return <ErrorView />;
    case SessionStatus.Completed:
      return <CompletedView />;
    case SessionStatus.Playing:
      return <PlayingView />;
    default:
      return <LoadingView />;
  }
};

export const AuthorPreviewPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <ErrorState
        title="Missing Preview Token"
        description="This preview link appears to be invalid. Please use the link from the editor."
      />
    );
  }

  return (
    <AuthorPreviewSessionProvider previewToken={token}>
      <AuthorPreviewPageContent />
    </AuthorPreviewSessionProvider>
  );
};
