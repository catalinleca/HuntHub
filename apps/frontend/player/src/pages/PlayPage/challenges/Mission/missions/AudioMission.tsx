import { useCallback } from 'react';
import { AnswerType } from '@hunthub/shared';
import type { MissionPF } from '@hunthub/shared';
import { getColor } from '@hunthub/compass';
import { MISSION_BADGES, SubmissionStatus, getSubmissionStatus } from '@/constants';
import { useUploadAudio, useAudioRecorder } from '@/hooks';
import { useSessionId } from '@/context';
import { useIsCorrect } from '@/context/Validation';
import { useAdvanceToNextStep } from '@/context/PlaySession';
import { ChallengeCard, ActionButton } from '../../components';
import { AudioContent, type AudioContentState } from '../../components/Mission';
import type { ChallengeProps } from '@/types';

export const AudioMission = ({
  challenge,
  onValidate,
  isValidating,
  isLastStep,
  feedback,
  currentAttempts,
  media,
  timeLimit,
  maxAttempts,
  hasHint,
}: ChallengeProps<MissionPF>) => {
  const sessionId = useSessionId();
  const { upload: uploadAudio, isUploading, error: uploadError } = useUploadAudio();
  const audioRecorder = useAudioRecorder();

  const isCorrect = useIsCorrect();
  const advanceToNextStep = useAdvanceToNextStep();

  const isSubmitting = isValidating || isUploading;
  const status = getSubmissionStatus(audioRecorder.status, isSubmitting);

  const state: AudioContentState = {
    status,
    audioUrl: audioRecorder.audioUrl,
    audioBlob: audioRecorder.audioBlob,
    mimeType: audioRecorder.mimeType,
    duration: audioRecorder.duration,
    error: audioRecorder.error,
    startRecording: audioRecorder.startRecording,
    stopRecording: audioRecorder.stopRecording,
    discardRecording: audioRecorder.discardRecording,
  };

  const handleSubmit = useCallback(async () => {
    if (!sessionId || !audioRecorder.audioBlob || !audioRecorder.mimeType) {
      return;
    }

    const assetId = await uploadAudio(sessionId, audioRecorder.audioBlob, audioRecorder.mimeType);
    if (assetId !== -1) {
      onValidate(AnswerType.MissionMedia, { missionMedia: { assetId } });
    }
  }, [sessionId, uploadAudio, onValidate, audioRecorder.audioBlob, audioRecorder.mimeType]);

  const isRecording = status === SubmissionStatus.Recording;
  const canSubmit = status === SubmissionStatus.Stopped;

  const getFooter = () => {
    if (isRecording) {
      return (
        <ActionButton
          onClick={audioRecorder.stopRecording}
          isValidating={false}
          isLastStep={false}
          disabled={false}
          label="Stop Recording"
          color={getColor('error.main')}
        />
      );
    }

    const handleClick = () => {
      if (isCorrect) {
        advanceToNextStep();
      } else {
        handleSubmit();
      }
    };

    return (
      <ActionButton
        onClick={handleClick}
        isValidating={isSubmitting}
        isLastStep={isLastStep}
        isCorrect={isCorrect === true}
        disabled={!isCorrect && !canSubmit}
        label="Submit Recording"
      />
    );
  };

  return (
    <ChallengeCard
      badge={MISSION_BADGES[challenge.type]}
      title={challenge.title}
      description={challenge.description}
      media={media}
      timeLimit={timeLimit}
      maxAttempts={maxAttempts}
      currentAttempts={currentAttempts}
      feedback={feedback}
      showHint={hasHint}
      footer={getFooter()}
    >
      <AudioContent state={state} uploadError={uploadError} isCorrect={isCorrect} />
    </ChallengeCard>
  );
};
