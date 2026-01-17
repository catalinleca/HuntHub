import { useEffect } from 'react';
import { Typography, Button, Stack } from '@mui/material';
import { MapPinIcon, NavigationArrowIcon, CheckIcon } from '@phosphor-icons/react';
import { Spinner } from '@/components/core';
import { LocationStatus, getLocationStatus } from '@/constants';
import { useGeolocation } from '@/hooks';
import * as S from './Mission.styles';

interface LocationContentProps {
  onSubmit: (position: { lat: number; lng: number }) => void;
  isSubmitting?: boolean;
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
    <Typography variant="body1" fontWeight={500}>
      Find the Location
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Navigate to the target area and check your position
    </Typography>
  </>
);

const ReadyPrompt = () => (
  <>
    <Typography variant="body1" fontWeight={500}>
      Location Acquired
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Tap "Check Location" to verify you're at the right spot
    </Typography>
  </>
);

const ErrorPrompt = ({ message }: { message: string }) => (
  <Typography variant="body2" color="error">
    {message}
  </Typography>
);

export const LocationContent = ({ onSubmit, isSubmitting = false }: LocationContentProps) => {
  const { position, error, isLoading, watchPosition, clearWatch } = useGeolocation();

  useEffect(() => {
    watchPosition();
    return clearWatch;
  }, [watchPosition, clearWatch]);

  const status = getLocationStatus(isLoading, error, !!position, isSubmitting);

  const handleCheckLocation = () => {
    if (position) {
      onSubmit(position);
    }
  };

  const prompts: Record<LocationStatus, React.ReactNode> = {
    [LocationStatus.Idle]: <IdlePrompt />,
    [LocationStatus.Loading]: <LoadingPrompt />,
    [LocationStatus.Error]: <ErrorPrompt message={error || 'Location error'} />,
    [LocationStatus.Ready]: <ReadyPrompt />,
    [LocationStatus.Submitting]: <ReadyPrompt />,
  };

  const buttons: Record<LocationStatus, React.ReactNode> = {
    [LocationStatus.Idle]: (
      <Button variant="contained" fullWidth size="large" disabled startIcon={<MapPinIcon size={20} weight="bold" />}>
        Waiting for location...
      </Button>
    ),
    [LocationStatus.Loading]: (
      <Button variant="contained" fullWidth size="large" disabled startIcon={<Spinner />}>
        Getting location...
      </Button>
    ),
    [LocationStatus.Error]: (
      <Button variant="contained" fullWidth size="large" disabled startIcon={<MapPinIcon size={20} weight="bold" />}>
        Check Location
      </Button>
    ),
    [LocationStatus.Ready]: (
      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handleCheckLocation}
        startIcon={<CheckIcon size={20} weight="bold" />}
      >
        Check Location
      </Button>
    ),
    [LocationStatus.Submitting]: (
      <Button variant="contained" fullWidth size="large" disabled startIcon={<Spinner />}>
        Checking...
      </Button>
    ),
  };

  const showGpsIndicator = status === LocationStatus.Ready || status === LocationStatus.Submitting;

  return (
    <Stack gap={2}>
      <S.StatusZone>
        <S.IconWrapper>
          <MapPinIcon size={32} weight="duotone" />
        </S.IconWrapper>
        {prompts[status]}
      </S.StatusZone>

      {showGpsIndicator && (
        <S.StatusIndicator>
          <NavigationArrowIcon size={20} weight="fill" />
          <Typography variant="body2">GPS signal active</Typography>
        </S.StatusIndicator>
      )}

      {buttons[status]}
    </Stack>
  );
};
