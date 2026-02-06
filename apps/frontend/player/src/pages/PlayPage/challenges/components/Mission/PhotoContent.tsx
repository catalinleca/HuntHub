import { useRef, type ChangeEvent } from 'react';
import { Typography, Alert, Stack, CircularProgress } from '@mui/material';
import { CameraIcon, ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { PhotoStatus } from '@/constants';
import * as S from './Mission.styles';

export interface PhotoContentState {
  status: PhotoStatus;
  file: File | null;
  preview: string | null;
  hasPhoto: boolean;
  error: string | null;
  handleCapture: (event: ChangeEvent<HTMLInputElement>) => void;
  reset: () => void;
}

interface PhotoContentProps {
  state: PhotoContentState;
  uploadError?: string | null;
  isCorrect?: boolean | null;
}

const CapturePrompt = () => (
  <>
    <S.IconWrapper>
      <CameraIcon size={32} weight="duotone" />
    </S.IconWrapper>
    <Typography variant="body1" fontWeight={500}>
      Capture Your Photo
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Tap to open camera
    </Typography>
  </>
);

interface PhotoPreviewProps {
  src: string;
  onRetake?: () => void;
  showRetake?: boolean;
}

const PhotoPreview = ({ src, onRetake, showRetake = true }: PhotoPreviewProps) => (
  <Stack gap={2} alignItems="center" sx={{ width: '100%' }}>
    <S.PreviewImage src={src} alt="Captured photo" />
    {showRetake && onRetake && (
      <S.ActionLink type="button" onClick={onRetake}>
        <ArrowCounterClockwiseIcon size={16} />
        Retake photo
      </S.ActionLink>
    )}
  </Stack>
);

export const PhotoContent = ({ state, uploadError, isCorrect }: PhotoContentProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { status, preview, error, handleCapture, reset } = state;

  const openCamera = () => inputRef.current?.click();
  const isValidated = isCorrect === true;

  const views: Record<PhotoStatus, React.ReactNode> = {
    [PhotoStatus.Empty]: (
      <S.InteractionZone $hasContent={false} $clickable onClick={openCamera}>
        <CapturePrompt />
      </S.InteractionZone>
    ),
    [PhotoStatus.Compressing]: (
      <S.InteractionZone $hasContent={false}>
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary">
          Processing image...
        </Typography>
      </S.InteractionZone>
    ),
    [PhotoStatus.HasPhoto]: (
      <S.InteractionZone $hasContent>
        <PhotoPreview src={preview!} onRetake={reset} showRetake={!isValidated} />
      </S.InteractionZone>
    ),
    [PhotoStatus.Submitting]: (
      <S.InteractionZone $hasContent>
        <PhotoPreview src={preview!} showRetake={false} />
      </S.InteractionZone>
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
