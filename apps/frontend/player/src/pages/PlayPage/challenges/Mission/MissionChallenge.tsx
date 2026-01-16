import React, { useCallback } from 'react';
import { MissionType, AnswerType } from '@hunthub/shared';
import type { MissionPF } from '@hunthub/shared';
import { MISSION_BADGES } from '@/constants';
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
  const handleLocationSubmit = useCallback(
    (position: { lat: number; lng: number }) => {
      onValidate(AnswerType.MissionLocation, { missionLocation: position });
    },
    [onValidate],
  );

  /**
   * TODO: Implement proper media upload flow when backend is ready
   *
   * Current: Mock validation auto-passes, assetId is placeholder
   *
   * When BE ready:
   * 1. Change PhotoContent/AudioContent signature: onSubmit(file: File | Blob)
   * 2. PhotoContent passes captured file, AudioContent passes audioBlob
   * 3. Here: upload file to asset endpoint → get assetId → then validate
   *
   * Flow: capture → onSubmit(file) → upload(file) → assetId → validate({ assetId })
   */
  const handleMediaSubmit = useCallback(() => {
    onValidate(AnswerType.MissionMedia, { missionMedia: { assetId: 1 } });
  }, [onValidate]);

  const contents: Record<MissionType, React.ReactNode> = {
    [MissionType.MatchLocation]: <LocationContent onSubmit={handleLocationSubmit} disabled={isValidating} />,
    [MissionType.UploadMedia]: <PhotoContent onSubmit={handleMediaSubmit} disabled={isValidating} />,
    [MissionType.UploadAudio]: <AudioContent onSubmit={handleMediaSubmit} disabled={isValidating} />,
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
