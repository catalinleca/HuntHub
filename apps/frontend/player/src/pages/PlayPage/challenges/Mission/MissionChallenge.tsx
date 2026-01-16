import React, { useCallback } from 'react';
import { MissionType, AnswerType } from '@hunthub/shared';
import type { MissionPF } from '@hunthub/shared';
import { MISSION_BADGES } from '@/constants';
import { useUploadAudio } from '@/hooks';
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
  const { upload: uploadAudio, isUploading, error: uploadError } = useUploadAudio();

  const handleLocationSubmit = useCallback(
    (position: { lat: number; lng: number }) => {
      onValidate(AnswerType.MissionLocation, { missionLocation: position });
    },
    [onValidate],
  );

  const handlePhotoSubmit = useCallback(() => {
    onValidate(AnswerType.MissionMedia, { missionMedia: { assetId: 1 } });
  }, [onValidate]);

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

  const isDisabled = isValidating || isUploading;

  const contents: Record<MissionType, React.ReactNode> = {
    [MissionType.MatchLocation]: <LocationContent onSubmit={handleLocationSubmit} disabled={isDisabled} />,
    [MissionType.UploadMedia]: <PhotoContent onSubmit={handlePhotoSubmit} disabled={isDisabled} />,
    [MissionType.UploadAudio]: (
      <AudioContent onSubmit={handleAudioSubmit} disabled={isDisabled} uploadError={uploadError} />
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
