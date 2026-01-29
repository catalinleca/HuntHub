import { Typography, Alert, Stack } from '@mui/material';
import { MicrophoneIcon, ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { Spinner } from '@/components/core';
import { SubmissionStatus } from '@/constants';
import * as S from './Mission.styles';

export interface AudioContentState {
  status: SubmissionStatus;
  audioUrl: string | null;
  audioBlob: Blob | null;
  mimeType: string | null;
  duration: number;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  discardRecording: () => void;
}

interface AudioContentProps {
  state: AudioContentState;
  uploadError?: string | null;
  isCorrect?: boolean | null;
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const IdlePrompt = () => (
  <>
    <S.IconWrapper>
      <MicrophoneIcon size={32} weight="duotone" />
    </S.IconWrapper>
    <Typography variant="body1" fontWeight={500}>
      Record Your Answer
    </Typography>
    <Typography variant="body2" color="text.secondary">
      Tap to start recording
    </Typography>
  </>
);

const RequestingPrompt = () => (
  <>
    <S.IconWrapper>
      <MicrophoneIcon size={32} weight="duotone" />
    </S.IconWrapper>
    <Stack direction="row" alignItems="center" gap={1}>
      <Spinner size="small" />
      <Typography variant="body2" color="text.secondary">
        Requesting microphone access...
      </Typography>
    </Stack>
  </>
);

const RecordingDisplay = ({ duration }: { duration: number }) => (
  <>
    <Stack direction="row" alignItems="center" gap={1}>
      <S.RecordingDot />
      <Typography variant="body2" color="error">
        Recording
      </Typography>
    </Stack>
    <S.TimerDisplay variant="h4">{formatDuration(duration)}</S.TimerDisplay>
  </>
);

interface AudioPreviewProps {
  audioUrl: string;
  duration: number;
  onRerecord?: () => void;
  showRerecord?: boolean;
}

const AudioPreview = ({ audioUrl, duration, onRerecord, showRerecord = true }: AudioPreviewProps) => (
  <Stack gap={2} alignItems="center" sx={{ width: '100%' }}>
    <S.AudioPlayerContainer>
      <audio src={audioUrl} controls style={{ width: '100%' }} />
    </S.AudioPlayerContainer>
    <Typography variant="body2" color="text.secondary">
      Duration: {formatDuration(duration)}
    </Typography>
    {showRerecord && onRerecord && (
      <S.ActionLink type="button" onClick={onRerecord}>
        <ArrowCounterClockwiseIcon size={16} />
        Re-record
      </S.ActionLink>
    )}
  </Stack>
);

export const AudioContent = ({ state, uploadError, isCorrect }: AudioContentProps) => {
  const { status, audioUrl, duration, error, startRecording, discardRecording } = state;
  const displayError = error || uploadError;
  const isValidated = isCorrect === true;

  const views: Record<SubmissionStatus, React.ReactNode> = {
    [SubmissionStatus.Idle]: (
      <S.InteractionZone $hasContent={false} $clickable onClick={startRecording}>
        <IdlePrompt />
      </S.InteractionZone>
    ),
    [SubmissionStatus.Requesting]: (
      <S.InteractionZone $hasContent={false}>
        <RequestingPrompt />
      </S.InteractionZone>
    ),
    [SubmissionStatus.Error]: (
      <S.InteractionZone $hasContent={false} $clickable onClick={startRecording}>
        <S.IconWrapper>
          <MicrophoneIcon size={32} weight="duotone" />
        </S.IconWrapper>
        <Typography variant="body1" fontWeight={500}>
          Tap to try again
        </Typography>
      </S.InteractionZone>
    ),
    [SubmissionStatus.Recording]: (
      <S.InteractionZone $hasContent>
        <RecordingDisplay duration={duration} />
      </S.InteractionZone>
    ),
    [SubmissionStatus.Stopped]: (
      <S.InteractionZone $hasContent>
        <AudioPreview
          audioUrl={audioUrl!}
          duration={duration}
          onRerecord={discardRecording}
          showRerecord={!isValidated}
        />
      </S.InteractionZone>
    ),
    [SubmissionStatus.Submitting]: (
      <S.InteractionZone $hasContent>
        <AudioPreview audioUrl={audioUrl!} duration={duration} showRerecord={false} />
      </S.InteractionZone>
    ),
  };

  return (
    <Stack gap={2}>
      {displayError && (
        <Alert severity="error" onClose={discardRecording}>
          {displayError}
        </Alert>
      )}
      {views[status]}
    </Stack>
  );
};
