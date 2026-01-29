import { useCallback } from 'react';
import { AnswerType } from '@hunthub/shared';
import type { MissionPF } from '@hunthub/shared';
import { MISSION_BADGES, PhotoStatus, getPhotoStatus } from '@/constants';
import { useUploadPhoto, usePhotoCapture } from '@/hooks';
import { useSessionId } from '@/context';
import { useIsCorrect } from '@/context/Validation';
import { useAdvanceToNextStep } from '@/context/PlaySession';
import { ChallengeCard, ActionButton } from '../../components';
import { PhotoContent, type PhotoContentState } from '../../components/Mission';
import type { ChallengeProps } from '@/types';

export const PhotoMission = ({
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
  const { upload: uploadPhoto, isUploading, error: uploadError } = useUploadPhoto();
  const photoCapture = usePhotoCapture();

  const isCorrect = useIsCorrect();
  const advanceToNextStep = useAdvanceToNextStep();

  const isSubmitting = isValidating || isUploading;
  const status = getPhotoStatus(photoCapture.hasPhoto, isSubmitting);

  const state: PhotoContentState = {
    status,
    file: photoCapture.file,
    preview: photoCapture.preview,
    hasPhoto: photoCapture.hasPhoto,
    error: photoCapture.error,
    handleCapture: photoCapture.handleCapture,
    reset: photoCapture.reset,
  };

  const handleSubmit = useCallback(async () => {
    if (!sessionId || !photoCapture.file) {
      return;
    }

    const assetId = await uploadPhoto(sessionId, photoCapture.file);
    if (assetId !== -1) {
      onValidate(AnswerType.MissionMedia, { missionMedia: { assetId } });
    }
  }, [sessionId, uploadPhoto, onValidate, photoCapture.file]);

  const handleClick = () => {
    if (isCorrect) {
      advanceToNextStep();
    } else {
      handleSubmit();
    }
  };

  const canSubmit = status === PhotoStatus.HasPhoto;

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
      footer={
        <ActionButton
          onClick={handleClick}
          isValidating={isSubmitting}
          isLastStep={isLastStep}
          isCorrect={isCorrect === true}
          disabled={!isCorrect && !canSubmit}
          label="Submit Photo"
        />
      }
    >
      <PhotoContent state={state} uploadError={uploadError} isCorrect={isCorrect} />
    </ChallengeCard>
  );
};
