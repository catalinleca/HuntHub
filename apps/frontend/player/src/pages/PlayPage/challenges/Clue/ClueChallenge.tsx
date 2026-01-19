import { ChallengeType, AnswerType } from '@hunthub/shared';
import type { CluePF } from '@hunthub/shared';
import { CHALLENGE_BADGES } from '@/constants';
import { useAdvanceToNextStep } from '@/context/PlaySession';
import { ChallengeCard, ActionButton } from '../components';
import type { ChallengeProps } from '@/types';

export const ClueChallenge = ({ challenge, media, isLastStep, onValidate, isValidating }: ChallengeProps<CluePF>) => {
  const advanceToNextStep = useAdvanceToNextStep();

  const handleContinue = async () => {
    await onValidate(AnswerType.Clue, { clue: {} });
    advanceToNextStep();
  };

  return (
    <ChallengeCard
      badge={CHALLENGE_BADGES[ChallengeType.Clue]}
      title={challenge.title}
      description={challenge.description}
      media={media}
      showHint={false}
      footer={
        <ActionButton onClick={handleContinue} isValidating={isValidating} isLastStep={isLastStep} label="Continue" />
      }
    />
  );
};
