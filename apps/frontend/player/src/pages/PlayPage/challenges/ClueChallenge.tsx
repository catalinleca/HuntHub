import React from 'react';
import { AnswerType, ChallengeType } from '@hunthub/shared';
import type { CluePF } from '@hunthub/shared';
import { CHALLENGE_BADGES } from '@/constants';
import { ChallengeCard, ActionButton, FeedbackDisplay } from './components';
import type { ChallengeProps } from '@/types';

export const ClueChallenge = ({
  challenge,
  onValidate,
  isValidating,
  isLastStep,
  feedback,
}: ChallengeProps<CluePF>) => {
  const handleContinue = () => {
    onValidate(AnswerType.Clue, { clue: {} });
  };

  return (
    <ChallengeCard
      badge={CHALLENGE_BADGES[ChallengeType.Clue]}
      title={challenge.title}
      description={challenge.description}
      footer={
        <ActionButton onClick={handleContinue} isValidating={isValidating} isLastStep={isLastStep} label="Continue" />
      }
    >
      <FeedbackDisplay feedback={feedback} />
    </ChallengeCard>
  );
};
