import { useCallback } from 'react';
import { AnswerType, ChallengeType } from '@hunthub/shared';
import type { CluePF } from '@hunthub/shared';
import { CHALLENGE_BADGES } from '@/constants';
import { ChallengeCard, ActionButton } from '../components';
import type { ChallengeProps } from '@/types';

export const ClueChallenge = ({
  challenge,
  media,
  onValidate,
  isValidating,
  isLastStep,
  feedback,
  currentAttempts,
  timeLimit,
  maxAttempts,
}: ChallengeProps<CluePF>) => {
  const handleContinue = useCallback(() => {
    onValidate(AnswerType.Clue, { clue: {} });
  }, [onValidate]);

  return (
    <ChallengeCard
      badge={CHALLENGE_BADGES[ChallengeType.Clue]}
      title={challenge.title}
      description={challenge.description}
      media={media}
      timeLimit={timeLimit}
      maxAttempts={maxAttempts}
      currentAttempts={currentAttempts}
      feedback={feedback}
      onTimeExpire={handleContinue}
      onMaxAttempts={handleContinue}
      showHint
      footer={
        <ActionButton onClick={handleContinue} isValidating={isValidating} isLastStep={isLastStep} label="Continue" />
      }
    >
      {null}
    </ChallengeCard>
  );
};
