import { useCallback } from 'react';
import { MissionType, AnswerType } from '@hunthub/shared';
import type { MissionPF } from '@hunthub/shared';
import { MISSION_BADGES } from '@/constants';
import { ChallengeCard, FeedbackDisplay } from '../components';
import { LocationContent, PhotoContent, AudioContent } from '../components/Mission';
import type { ChallengeProps } from '@/types';

export const MissionChallenge = ({ challenge, onValidate, isValidating, feedback }: ChallengeProps<MissionPF>) => {
  const badge = MISSION_BADGES[challenge.type];

  const handleLocationSubmit = useCallback(
    (position: { lat: number; lng: number }) => {
      onValidate(AnswerType.MissionLocation, { missionLocation: position });
    },
    [onValidate],
  );

  const handleMediaSubmit = useCallback(() => {
    // In mock/preview mode, we don't upload to server
    // Just pass an empty payload - mock validation auto-passes
    onValidate(AnswerType.MissionMedia, { missionMedia: { assetId: 0 } });
  }, [onValidate]);

  const renderContent = () => {
    switch (challenge.type) {
      case MissionType.MatchLocation:
        return <LocationContent mission={challenge} onSubmit={handleLocationSubmit} disabled={isValidating} />;

      case MissionType.UploadMedia:
        return <PhotoContent mission={challenge} onSubmit={handleMediaSubmit} disabled={isValidating} />;

      case MissionType.UploadAudio:
        return <AudioContent mission={challenge} onSubmit={handleMediaSubmit} disabled={isValidating} />;

      default:
        return null;
    }
  };

  return (
    <ChallengeCard
      badge={badge}
      title={challenge.title}
      description={challenge.description}
      footer={<FeedbackDisplay feedback={feedback} />}
    >
      {renderContent()}
    </ChallengeCard>
  );
};
