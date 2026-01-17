import { useRef } from 'react';
import { Typography, Button, Alert, Stack } from '@mui/material';
import { CameraIcon, ArrowCounterClockwiseIcon, CheckIcon } from '@phosphor-icons/react';
import { Spinner } from '@/components/core';
import { PhotoStatus, getPhotoStatus } from '@/constants';
import { usePhotoCapture } from '@/hooks';
import * as S from './Mission.styles';

interface PhotoContentProps {
  onSubmit: (file: File) => void;
  isSubmitting?: boolean;
  uploadError?: string | null;
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

interface PhotoPreviewProps {
  src: string;
  onRetake?: () => void;
  showRetake?: boolean;
}

const PhotoPreview = ({ src, onRetake, showRetake = true }: PhotoPreviewProps) => (
  <Stack gap={2} alignItems="center">
    <S.PreviewImage src={src} alt="Captured photo" />
    {showRetake && onRetake && (
      <Button variant="outlined" size="small" onClick={onRetake} startIcon={<ArrowCounterClockwiseIcon size={18} />}>
        Retake
      </Button>
    )}
  </Stack>
);

export const PhotoContent = ({ onSubmit, isSubmitting = false, uploadError }: PhotoContentProps) => {
  const { file, preview, error, handleCapture, reset, hasPhoto } = usePhotoCapture();
  const inputRef = useRef<HTMLInputElement>(null);

  const openCamera = () => inputRef.current?.click();
  const status = getPhotoStatus(hasPhoto, isSubmitting);

  const handleSubmit = () => {
    if (file) {
      onSubmit(file);
    }
  };

  const views: Record<PhotoStatus, React.ReactNode> = {
    [PhotoStatus.Empty]: (
      <>
        <CapturePrompt onClick={openCamera} />
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={openCamera}
          startIcon={<CameraIcon size={20} weight="bold" />}
        >
          Take Photo
        </Button>
      </>
    ),
    [PhotoStatus.HasPhoto]: (
      <>
        <PhotoPreview src={preview!} onRetake={reset} />
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleSubmit}
          disabled={!file}
          startIcon={<CheckIcon size={20} weight="bold" />}
        >
          Submit Photo
        </Button>
      </>
    ),
    [PhotoStatus.Submitting]: (
      <>
        <PhotoPreview src={preview!} showRetake={false} />
        <Button variant="contained" fullWidth size="large" disabled startIcon={<Spinner />}>
          Checking...
        </Button>
      </>
    ),
  };

  return (
    <Stack gap={2}>
      {error && (
        <Alert severity="error" onClose={reset}>
          {error}
        </Alert>
      )}
      {uploadError && !error && <Alert severity="error">{uploadError}</Alert>}
      <S.HiddenInput ref={inputRef} type="file" accept="image/*" capture="environment" onChange={handleCapture} />
      {views[status]}
    </Stack>
  );
};
