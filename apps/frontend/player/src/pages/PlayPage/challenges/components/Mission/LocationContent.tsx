import React, { useEffect } from 'react';
import { Typography, Button, CircularProgress } from '@mui/material';
import { MapPinIcon, NavigationArrowIcon } from '@phosphor-icons/react';
import type { MissionPF } from '@hunthub/shared';
import { useGeolocation } from '@/hooks';
import * as S from './Mission.styles';

interface LocationContentProps {
  mission: MissionPF;
  onSubmit: (position: { lat: number; lng: number }) => void;
  disabled?: boolean;
}

type LocationStatus = 'idle' | 'loading' | 'error' | 'ready';

const getStatus = (isLoading: boolean, error: string | null, hasPosition: boolean): LocationStatus => {
  if (error) return 'error';
  if (hasPosition) return 'ready';
  if (isLoading) return 'loading';
  return 'idle';
};

const LoadingPrompt = () => (
  <>
    <CircularProgress size={24} />
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

export const LocationContent = ({ onSubmit, disabled = false }: LocationContentProps) => {
  const { position, error, isLoading, watchPosition, clearWatch } = useGeolocation();

  useEffect(() => {
    watchPosition();
    return clearWatch;
  }, [watchPosition, clearWatch]);

  const status = getStatus(isLoading, error, !!position);

  const prompts: Record<LocationStatus, React.ReactNode> = {
    idle: <IdlePrompt />,
    loading: <LoadingPrompt />,
    error: <ErrorPrompt message={error || 'Location error'} />,
    ready: <ReadyPrompt />,
  };

  const handleCheckLocation = () => {
    if (position) {
      onSubmit(position);
    }
  };

  return (
    <S.ContentContainer>
      <S.UploadZone as="div" style={{ cursor: 'default' }}>
        <S.IconWrapper>
          <MapPinIcon size={32} weight="duotone" />
        </S.IconWrapper>
        {prompts[status]}
      </S.UploadZone>

      {status === 'ready' && (
        <S.StatusIndicator>
          <NavigationArrowIcon size={20} weight="fill" />
          <Typography variant="body2">GPS signal active</Typography>
        </S.StatusIndicator>
      )}

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handleCheckLocation}
        disabled={disabled || status !== 'ready'}
        startIcon={<MapPinIcon size={20} weight="bold" />}
      >
        {status === 'loading' ? 'Getting location...' : 'Check Location'}
      </Button>
    </S.ContentContainer>
  );
};
