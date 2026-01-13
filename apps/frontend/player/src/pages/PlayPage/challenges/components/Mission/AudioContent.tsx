import { Typography, Button, Alert } from '@mui/material';
import { MicrophoneIcon, StopIcon, ArrowCounterClockwiseIcon, CheckIcon } from '@phosphor-icons/react';
import type { MissionPF } from '@hunthub/shared';
import { useAudioRecorder } from '@/hooks';
import * as S from './Mission.styles';

interface AudioContentProps {
  mission: MissionPF;
  onSubmit: () => void;
  disabled?: boolean;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const AudioContent = ({ onSubmit, disabled }: AudioContentProps) => {
  const { status, audioUrl, duration, error, startRecording, stopRecording, reset, isRecording, hasRecording } =
    useAudioRecorder();

  const handleSubmit = () => {
    if (hasRecording) {
      onSubmit();
    }
  };

  const renderContent = () => {
    if (hasRecording && audioUrl) {
      return (
        <S.PreviewContainer>
          <S.AudioPlayerContainer>
            <audio src={audioUrl} controls style={{ width: '100%' }} />
          </S.AudioPlayerContainer>
          <Typography variant="body2" color="text.secondary">
            Duration: {formatDuration(duration)}
          </Typography>
          <Button variant="outlined" size="small" onClick={reset} startIcon={<ArrowCounterClockwiseIcon size={18} />}>
            Re-record
          </Button>
        </S.PreviewContainer>
      );
    }

    if (isRecording) {
      return (
        <S.UploadZone as="div" style={{ cursor: 'default' }}>
          <S.RecordingIndicator>
            <S.RecordingDot />
            <Typography variant="body2" color="error">
              Recording
            </Typography>
          </S.RecordingIndicator>
          <S.TimerDisplay variant="h4">{formatDuration(duration)}</S.TimerDisplay>
        </S.UploadZone>
      );
    }

    return (
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
  };

  const renderActionButton = () => {
    if (isRecording) {
      return (
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
      );
    }

    if (hasRecording) {
      return (
        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleSubmit}
          disabled={disabled}
          startIcon={<CheckIcon size={20} weight="bold" />}
        >
          Submit Recording
        </Button>
      );
    }

    return (
      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={startRecording}
        disabled={disabled || status === 'requesting'}
        startIcon={<MicrophoneIcon size={20} weight="bold" />}
      >
        {status === 'requesting' ? 'Requesting access...' : 'Start Recording'}
      </Button>
    );
  };

  return (
    <S.ContentContainer>
      {error && (
        <Alert severity="error" onClose={() => reset()}>
          {error}
        </Alert>
      )}

      {renderContent()}
      {renderActionButton()}
    </S.ContentContainer>
  );
};
