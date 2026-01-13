import { useEffect } from 'react';
import { Typography, Button, Alert, CircularProgress } from '@mui/material';
import { MapPinIcon, NavigationArrowIcon } from '@phosphor-icons/react';
import type { MissionPF } from '@hunthub/shared';
import { useGeolocation } from '@/hooks';
import * as S from './Mission.styles';

interface LocationContentProps {
  mission: MissionPF;
  onSubmit: (position: { lat: number; lng: number }) => void;
  disabled?: boolean;
}

export const LocationContent = ({ onSubmit, disabled }: LocationContentProps) => {
  const { position, error, isLoading, watchPosition, clearWatch } = useGeolocation();

  useEffect(() => {
    watchPosition();
    return () => {
      clearWatch();
    };
  }, [watchPosition, clearWatch]);

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

        {isLoading && !position && (
          <>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Getting your location...
            </Typography>
          </>
        )}

        {error && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}

        {!isLoading && !error && !position && (
          <>
            <Typography variant="body1" fontWeight={500}>
              Find the Location
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Navigate to the target area and check your position
            </Typography>
          </>
        )}

        {position && (
          <>
            <Typography variant="body1" fontWeight={500}>
              Location Acquired
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tap "Check Location" to verify you're at the right spot
            </Typography>
          </>
        )}
      </S.UploadZone>

      {position && (
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
        disabled={disabled || !position || isLoading}
        startIcon={<MapPinIcon size={20} weight="bold" />}
      >
        {isLoading ? 'Getting location...' : 'Check Location'}
      </Button>
    </S.ContentContainer>
  );
};
