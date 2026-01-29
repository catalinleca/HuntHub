import { useCallback, useEffect } from 'react';
import { AnswerType } from '@hunthub/shared';
import type { MissionPF } from '@hunthub/shared';
import { MISSION_BADGES, LocationStatus } from '@/constants';
import { useIsCorrect, useFeedback } from '@/context/Validation';
import { useAdvanceToNextStep } from '@/context/PlaySession';
import { ChallengeCard, ActionButton } from '../../components';
import { LocationContent, useLocationContentState } from '../../components/Mission';
import type { ChallengeProps } from '@/types';

export const LocationMission = ({
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
  const isCorrect = useIsCorrect();
  const validationFeedback = useFeedback();
  const advanceToNextStep = useAdvanceToNextStep();

  const locationState = useLocationContentState({ isSubmitting: isValidating });
  const { watchPosition, clearWatch } = locationState;

  useEffect(() => {
    watchPosition();
    return clearWatch;
  }, [watchPosition, clearWatch]);

  const handleSubmit = useCallback(() => {
    if (locationState.position) {
      onValidate(AnswerType.MissionLocation, { missionLocation: locationState.position });
    }
  }, [onValidate, locationState.position]);

  const handleClick = () => {
    if (isCorrect) {
      advanceToNextStep();
    } else {
      handleSubmit();
    }
  };

  const canCheck = locationState.status === LocationStatus.Ready;
  const hasTriedBefore = isCorrect === false;

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
          isValidating={isValidating}
          isLastStep={isLastStep}
          isCorrect={isCorrect === true}
          disabled={!isCorrect && !canCheck}
          label={hasTriedBefore ? 'Check Again' : 'Check Location'}
        />
      }
    >
      <LocationContent state={locationState} isCorrect={isCorrect} feedback={validationFeedback} />
    </ChallengeCard>
  );
};
