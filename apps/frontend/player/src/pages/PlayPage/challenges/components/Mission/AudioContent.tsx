import { Typography, Button, Alert, Stack } from '@mui/material';
import { MicrophoneIcon, StopIcon, ArrowCounterClockwiseIcon, CheckIcon } from '@phosphor-icons/react';
import { Spinner } from '@/components/core';
import { SubmissionStatus, getSubmissionStatus } from '@/constants';
import { useAudioRecorder } from '@/hooks';
import * as S from './Mission.styles';

interface AudioContentProps {
  onSubmit: (blob: Blob, mimeType: string) => void;
  isSubmitting?: boolean;
  uploadError?: string | null;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ReadyPrompt = () => (
  <S.StatusZone>
    <S.IconWrapper>
      <MicrophoneIcon size={32} weight="duotone" />
    </S.IconWrapper>
    <Typography variant="body1" fontWeight={500}>
      Record Your Answer
    </Typography>
  </S.StatusZone>
);

const RecordingDisplay = ({ duration }: { duration: number }) => (
  <S.StatusZone>
    <Stack direction="row" alignItems="center" gap={1}>
      <S.RecordingDot />
      <Typography variant="body2" color="error">
        Recording
      </Typography>
    </Stack>
    <S.TimerDisplay variant="h4">{formatDuration(duration)}</S.TimerDisplay>
  </S.StatusZone>
);

interface AudioPreviewProps {
  audioUrl: string;
  duration: number;
  onReset?: () => void;
  showReset?: boolean;
}

const AudioPreview = ({ audioUrl, duration, onReset, showReset = true }: AudioPreviewProps) => (
  <Stack gap={2} alignItems="center">
    <S.AudioPlayerContainer>
      <audio src={audioUrl} controls style={{ width: '100%' }} />
    </S.AudioPlayerContainer>
    <Typography variant="body2" color="text.secondary">
      Duration: {formatDuration(duration)}
    </Typography>
    {showReset && onReset && (
      <Button variant="outlined" size="small" onClick={onReset} startIcon={<ArrowCounterClockwiseIcon size={18} />}>
        Re-record
      </Button>
    )}
  </Stack>
);

export const AudioContent = ({ onSubmit, isSubmitting = false, uploadError }: AudioContentProps) => {
  const { status, audioUrl, audioBlob, mimeType, duration, error, startRecording, stopRecording, discardRecording } =
    useAudioRecorder();

  const displayStatus = getSubmissionStatus(status, isSubmitting);
  const displayError = error || uploadError;

  const views: Record<SubmissionStatus, React.ReactNode> = {
    [SubmissionStatus.Idle]: (
      <>
        <ReadyPrompt />
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={startRecording}
          disabled={isSubmitting}
          startIcon={<MicrophoneIcon size={20} weight="bold" />}
        >
          Start Recording
        </Button>
      </>
    ),
    [SubmissionStatus.Requesting]: (
      <>
        <ReadyPrompt />
        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled
          startIcon={<MicrophoneIcon size={20} weight="bold" />}
        >
          Requesting access...
        </Button>
      </>
    ),
    [SubmissionStatus.Error]: (
      <>
        <ReadyPrompt />
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={startRecording}
          disabled={isSubmitting}
          startIcon={<MicrophoneIcon size={20} weight="bold" />}
        >
          Try Again
        </Button>
      </>
    ),
    [SubmissionStatus.Recording]: (
      <>
        <RecordingDisplay duration={duration} />
        <Button
          variant="contained"
          color="error"
          fullWidth
          size="large"
          onClick={stopRecording}
          startIcon={<StopIcon size={20} weight="bold" />}
        >
          Stop Recording
        </Button>
      </>
    ),
    [SubmissionStatus.Stopped]: (
      <>
        <AudioPreview audioUrl={audioUrl!} duration={duration} onReset={discardRecording} />
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => audioBlob && mimeType && onSubmit(audioBlob, mimeType)}
          disabled={!audioBlob || !mimeType}
          startIcon={<CheckIcon size={20} weight="bold" />}
        >
          Submit Recording
        </Button>
      </>
    ),
    [SubmissionStatus.Submitting]: (
      <>
        <AudioPreview audioUrl={audioUrl!} duration={duration} showReset={false} />
        <Button variant="contained" fullWidth size="large" disabled startIcon={<Spinner />}>
          Checking...
        </Button>
      </>
    ),
  };

  return (
    <Stack gap={2}>
      {displayError && (
        <Alert severity="error" onClose={discardRecording}>
          {displayError}
        </Alert>
      )}
      {views[displayStatus]}
    </Stack>
  );
};
