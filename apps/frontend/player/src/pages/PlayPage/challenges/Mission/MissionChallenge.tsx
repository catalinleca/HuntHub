import { useCallback, useState, useEffect, useRef } from 'react';
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
  media,
  timeLimit,
  maxAttempts,
}: ChallengeProps<MissionPF>) => {
  const badge = MISSION_BADGES[challenge.type];
  const [attemptCount, setAttemptCount] = useState(0);
  const prevFeedbackRef = useRef<string | null>(null);

  // Track attempts when validation returns incorrect
  useEffect(() => {
    if (feedback && feedback !== prevFeedbackRef.current) {
      const isIncorrect = !feedback.toLowerCase().includes('correct') && !feedback.toLowerCase().includes('received');
      if (isIncorrect) {
        setAttemptCount((prev) => prev + 1);
      }
    }
    prevFeedbackRef.current = feedback;
  }, [feedback]);

  const handleLocationSubmit = useCallback(
    (position: { lat: number; lng: number }) => {
      onValidate(AnswerType.MissionLocation, { missionLocation: position });
    },
    [onValidate],
  );

  const handleMediaSubmit = useCallback(() => {
    onValidate(AnswerType.MissionMedia, { missionMedia: { assetId: 0 } });
  }, [onValidate]);

  const handleTimeExpire = useCallback(() => {
    // Auto-submit when time expires (for location, submit current position if available)
    if (challenge.type === MissionType.MatchLocation) {
      // Location mission: can't auto-submit without position
      // The user will see the time expired dialog
    } else {
      // Media missions: auto-submit
      handleMediaSubmit();
    }
  }, [challenge.type, handleMediaSubmit]);

  const handleMaxAttempts = useCallback(() => {
    // Similar to time expire - try to auto-submit
    if (challenge.type !== MissionType.MatchLocation) {
      handleMediaSubmit();
    }
  }, [challenge.type, handleMediaSubmit]);

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
      media={media}
      timeLimit={timeLimit}
      maxAttempts={maxAttempts}
      currentAttempts={attemptCount}
      feedback={feedback}
      onTimeExpire={handleTimeExpire}
      onMaxAttempts={handleMaxAttempts}
      showHint
      footer={<></>}
    >
      {renderContent()}
    </ChallengeCard>
  );
};
