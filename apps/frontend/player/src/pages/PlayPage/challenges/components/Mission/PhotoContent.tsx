import { useRef } from 'react';
import { Typography, Button, Alert } from '@mui/material';
import { CameraIcon, ArrowCounterClockwiseIcon, CheckIcon } from '@phosphor-icons/react';
import type { MissionPF } from '@hunthub/shared';
import { usePhotoCapture } from '@/hooks';
import * as S from './Mission.styles';

interface PhotoContentProps {
  mission: MissionPF;
  onSubmit: () => void;
  disabled?: boolean;
}

export const PhotoContent = ({ mission, onSubmit, disabled }: PhotoContentProps) => {
  const { preview, error, handleCapture, reset, hasPhoto } = usePhotoCapture();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleZoneClick = () => {
    if (!hasPhoto) {
      inputRef.current?.click();
    }
  };

  const handleSubmit = () => {
    if (hasPhoto) {
      onSubmit();
    }
  };

  // Note: referenceAssetIds would need to be resolved to URLs via API
  // For POC, we skip reference image display
  const hasReferenceImages = mission.referenceAssetIds && mission.referenceAssetIds.length > 0;

  return (
    <S.ContentContainer>
      {hasReferenceImages && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Reference images available (asset resolution not implemented in POC)
        </Typography>
      )}

      {error && (
        <Alert severity="error" onClose={() => reset()}>
          {error}
        </Alert>
      )}

      {hasPhoto && preview ? (
        <S.PreviewContainer>
          <S.PreviewImage src={preview} alt="Captured photo" />
          <Button variant="outlined" size="small" onClick={reset} startIcon={<ArrowCounterClockwiseIcon size={18} />}>
            Retake
          </Button>
        </S.PreviewContainer>
      ) : (
        <S.UploadZone onClick={handleZoneClick}>
          <S.IconWrapper>
            <CameraIcon size={32} weight="duotone" />
          </S.IconWrapper>
          <Typography variant="body1" fontWeight={500}>
            Tap to open camera
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Capture your photo
          </Typography>
        </S.UploadZone>
      )}

      <S.HiddenInput ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleCapture} />

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handleSubmit}
        disabled={disabled || !hasPhoto}
        startIcon={hasPhoto ? <CheckIcon size={20} weight="bold" /> : <CameraIcon size={20} weight="bold" />}
      >
        {hasPhoto ? 'Submit Photo' : 'Take Photo'}
      </Button>
    </S.ContentContainer>
  );
};
