import React from 'react';
import { Typography, Button, Alert, Stack } from '@mui/material';
import { MicrophoneIcon, StopIcon, ArrowCounterClockwiseIcon, CheckIcon } from '@phosphor-icons/react';
import { useAudioRecorder, type Status } from '@/hooks';
import * as S from './Mission.styles';

interface AudioContentProps {
  onSubmit: (blob: Blob, mimeType: string) => void;
  disabled?: boolean;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ReadyPrompt = () => (
  <S.UploadZone as="div" style={{ cursor: 'default' }}>
    <S.IconWrapper>
      <MicrophoneIcon size={32} weight="duotone" />
    </S.IconWrapper>
    <Typography variant="body1" fontWeight={500}>
      Ready to Record
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Tap the button below to start
    </Typography>
  </S.UploadZone>
);

const RecordingDisplay = ({ duration }: { duration: number }) => (
  <S.UploadZone as="div" style={{ cursor: 'default' }}>
    <Stack direction="row" alignItems="center" gap={1}>
      <S.RecordingDot />
      <Typography variant="body2" color="error">
        Recording
      </Typography>
    </Stack>
    <S.TimerDisplay variant="h4">{formatDuration(duration)}</S.TimerDisplay>
  </S.UploadZone>
);

const AudioPreview = ({ audioUrl, duration, onReset }: { audioUrl: string; duration: number; onReset: () => void }) => (
  <Stack gap={2} alignItems="center">
    <S.AudioPlayerContainer>
      <audio src={audioUrl} controls style={{ width: '100%' }} />
    </S.AudioPlayerContainer>
    <Typography variant="body2" color="text.secondary">
      Duration: {formatDuration(duration)}
    </Typography>
    <Button variant="outlined" size="small" onClick={onReset} startIcon={<ArrowCounterClockwiseIcon size={18} />}>
      Re-record
    </Button>
  </Stack>
);

export const AudioContent = ({ onSubmit, disabled = false }: AudioContentProps) => {
  const { status, audioUrl, audioBlob, mimeType, duration, error, startRecording, stopRecording, discardRecording } =
    useAudioRecorder();

  const views: Record<Status, React.ReactNode> = {
    idle: (
      <>
        <ReadyPrompt />
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={startRecording}
          disabled={disabled}
          startIcon={<MicrophoneIcon size={20} weight="bold" />}
        >
          Start Recording
        </Button>
      </>
    ),
    requesting: (
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
    error: (
      <>
        <ReadyPrompt />
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={startRecording}
          disabled={disabled}
          startIcon={<MicrophoneIcon size={20} weight="bold" />}
        >
          Try Again
        </Button>
      </>
    ),
    recording: (
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
    stopped: (
      <>
        <AudioPreview audioUrl={audioUrl!} duration={duration} onReset={discardRecording} />
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={() => onSubmit(audioBlob!, mimeType!)}
          disabled={disabled}
          startIcon={<CheckIcon size={20} weight="bold" />}
        >
          Submit Recording
        </Button>
      </>
    ),
  };

  return (
    <Stack gap={2}>
      {error && (
        <Alert severity="error" onClose={discardRecording}>
          {error}
        </Alert>
      )}
      {views[status]}
    </Stack>
  );
};
