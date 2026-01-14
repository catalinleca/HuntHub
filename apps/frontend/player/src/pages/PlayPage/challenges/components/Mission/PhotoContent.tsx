import { useRef } from 'react';
import { Typography, Button, Alert } from '@mui/material';
import { CameraIcon, ArrowCounterClockwiseIcon, CheckIcon } from '@phosphor-icons/react';
import { usePhotoCapture } from '@/hooks';
import * as S from './Mission.styles';

interface PhotoContentProps {
  onSubmit: () => void;
  disabled?: boolean;
}

const CapturePrompt = ({ onClick }: { onClick: () => void }) => (
  <S.UploadZone onClick={onClick}>
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
);

const PhotoPreview = ({ src, onRetake }: { src: string; onRetake: () => void }) => (
  <S.PreviewContainer>
    <S.PreviewImage src={src} alt="Captured photo" />
    <Button variant="outlined" size="small" onClick={onRetake} startIcon={<ArrowCounterClockwiseIcon size={18} />}>
      Retake
    </Button>
  </S.PreviewContainer>
);

export const PhotoContent = ({ onSubmit, disabled = false }: PhotoContentProps) => {
  const { preview, error, handleCapture, reset, hasPhoto } = usePhotoCapture();
  const inputRef = useRef<HTMLInputElement>(null);

  const openCamera = () => inputRef.current?.click();

  return (
    <S.ContentContainer>
      {error && (
        <Alert severity="error" onClose={reset}>
          {error}
        </Alert>
      )}

      {hasPhoto ? <PhotoPreview src={preview!} onRetake={reset} /> : <CapturePrompt onClick={openCamera} />}

      <S.HiddenInput ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleCapture} />

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={onSubmit}
        disabled={disabled || !hasPhoto}
        startIcon={hasPhoto ? <CheckIcon size={20} weight="bold" /> : <CameraIcon size={20} weight="bold" />}
      >
        {hasPhoto ? 'Submit Photo' : 'Take Photo'}
      </Button>
    </S.ContentContainer>
  );
};
