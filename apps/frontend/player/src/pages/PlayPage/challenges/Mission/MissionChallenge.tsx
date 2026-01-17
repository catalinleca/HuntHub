import React, { useCallback } from 'react';
import { MissionType, AnswerType } from '@hunthub/shared';
import type { MissionPF } from '@hunthub/shared';
import { MISSION_BADGES } from '@/constants';
import { useUploadAudio, useUploadPhoto } from '@/hooks';
import { usePlaySession } from '@/context';
import { ChallengeCard } from '../components';
import { LocationContent, PhotoContent, AudioContent } from '../components/Mission';
import type { ChallengeProps } from '@/types';

export const MissionChallenge = ({
  challenge,
  onValidate,
  isValidating,
  feedback,
  currentAttempts,
  media,
  timeLimit,
  maxAttempts,
  hasHint,
}: ChallengeProps<MissionPF>) => {
  const { sessionId } = usePlaySession();
  const { upload: uploadAudio, isUploading: isUploadingAudio, error: uploadAudioError } = useUploadAudio();
  const { upload: uploadPhoto, isUploading: isUploadingPhoto, error: uploadPhotoError } = useUploadPhoto();

  const handleLocationSubmit = useCallback(
    (position: { lat: number; lng: number }) => {
      onValidate(AnswerType.MissionLocation, { missionLocation: position });
    },
    [onValidate],
  );

  const handlePhotoSubmit = useCallback(
    async (file: File) => {
      if (!sessionId) {
        return;
      }

      const assetId = await uploadPhoto(sessionId, file);
      if (assetId !== -1) {
        onValidate(AnswerType.MissionMedia, { missionMedia: { assetId } });
      }
    },
    [sessionId, uploadPhoto, onValidate],
  );

  const handleAudioSubmit = useCallback(
    async (blob: Blob, mimeType: string) => {
      if (!sessionId) {
        return;
      }

      const assetId = await uploadAudio(sessionId, blob, mimeType);
      if (assetId !== -1) {
        onValidate(AnswerType.MissionMedia, { missionMedia: { assetId } });
      }
    },
    [sessionId, uploadAudio, onValidate],
  );

  const isSubmitting = isValidating || isUploadingAudio || isUploadingPhoto;

  const contents: Record<MissionType, React.ReactNode> = {
    [MissionType.MatchLocation]: <LocationContent onSubmit={handleLocationSubmit} isSubmitting={isSubmitting} />,
    [MissionType.UploadMedia]: (
      <PhotoContent onSubmit={handlePhotoSubmit} isSubmitting={isSubmitting} uploadError={uploadPhotoError} />
    ),
    [MissionType.UploadAudio]: (
      <AudioContent onSubmit={handleAudioSubmit} isSubmitting={isSubmitting} uploadError={uploadAudioError} />
    ),
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
      footer={<></>}
    >
      {contents[challenge.type]}
    </ChallengeCard>
  );
};
