import { useMemo } from 'react';
import { Typography, Stack } from '@mui/material';
import { MapPinIcon, NavigationArrowIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { Spinner } from '@/components/core';
import { LocationStatus } from '@/constants';
import * as S from './Mission.styles';

export interface LocationContentState {
  status: LocationStatus;
  position: { lat: number; lng: number } | null;
  error: string | null;
}

interface LocationContentProps {
  state: LocationContentState;
  isCorrect: boolean | null;
  feedback: string | null;
}

const LoadingPrompt = () => (
  <>
    <Spinner size="large" />
    <Typography variant="body2" color="text.secondary">
      Getting your location...
    </Typography>
  </>
);

const IdlePrompt = () => (
  <>
    <S.IconWrapper>
      <MapPinIcon size={32} weight="duotone" />
    </S.IconWrapper>
    <Typography variant="body1" fontWeight={500}>
      Find the Location
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Navigate to the target area
    </Typography>
  </>
);

const ReadyPrompt = () => (
  <>
    <S.IconWrapper>
      <MapPinIcon size={32} weight="duotone" />
    </S.IconWrapper>
    <Typography variant="body1" fontWeight={500}>
      Location Acquired
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Ready to check your position
    </Typography>
  </>
);

const SubmittingPrompt = () => (
  <>
    <Spinner size="large" />
    <Typography variant="body2" color="text.secondary">
      Checking your location...
    </Typography>
  </>
);

const ErrorPrompt = ({ message }: { message: string }) => (
  <>
    <S.IconWrapper $variant="error">
      <MapPinIcon size={32} weight="duotone" />
    </S.IconWrapper>
    <Typography variant="body2" color="error">
      {message}
    </Typography>
  </>
);

const SuccessPrompt = () => (
  <>
    <S.IconWrapper $variant="success">
      <CheckCircleIcon size={32} weight="fill" />
    </S.IconWrapper>
    <Typography variant="body1" fontWeight={500} color="success.main">
      You've arrived!
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Location verified successfully
    </Typography>
  </>
);

const TooFarPrompt = ({ feedback }: { feedback: string }) => (
  <>
    <S.IconWrapper $variant="warning">
      <MapPinIcon size={32} weight="duotone" />
    </S.IconWrapper>
    <Typography variant="body1" fontWeight={500} color="warning.main">
      Not quite there yet
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {feedback}
    </Typography>
  </>
);

export const LocationContent = ({ state, isCorrect, feedback }: LocationContentProps) => {
  const { status, error } = state;
  const hasFeedback = !!feedback;
  const hasValidationFailure = isCorrect === false;

  const prompts: Record<LocationStatus, React.ReactNode> = useMemo(
    () => ({
      [LocationStatus.Idle]: <IdlePrompt />,
      [LocationStatus.Loading]: <LoadingPrompt />,
      [LocationStatus.Error]: <ErrorPrompt message={error || 'Location error'} />,
      [LocationStatus.Ready]: <ReadyPrompt />,
      [LocationStatus.Submitting]: <SubmittingPrompt />,
    }),
    [error],
  );

  const getInteractionZone = (): React.ReactNode => {
    if (isCorrect === true) {
      return (
        <S.InteractionZone $hasContent>
          <SuccessPrompt />
        </S.InteractionZone>
      );
    }

    if (hasValidationFailure && hasFeedback) {
      return (
        <S.InteractionZone $hasContent>
          <TooFarPrompt feedback={feedback!} />
        </S.InteractionZone>
      );
    }

    if (hasValidationFailure) {
      return (
        <S.InteractionZone $hasContent $error>
          <ErrorPrompt message="Location verification failed. Try again." />
        </S.InteractionZone>
      );
    }

    const hasError = status === LocationStatus.Error;
    return (
      <S.InteractionZone $hasContent={false} $error={hasError}>
        {prompts[status]}
      </S.InteractionZone>
    );
  };

  const showGpsIndicator = status === LocationStatus.Ready || status === LocationStatus.Submitting;

  return (
    <Stack gap={2}>
      {getInteractionZone()}

      {showGpsIndicator && !isCorrect && (
        <S.StatusIndicator>
          <NavigationArrowIcon size={20} weight="fill" />
          <Typography variant="body2">GPS signal active</Typography>
        </S.StatusIndicator>
      )}
    </Stack>
  );
};
