import { ChallengeType } from '@hunthub/shared';
import type { CluePF } from '@hunthub/shared';
import { CHALLENGE_BADGES } from '@/constants';
import { useAdvanceToNextStep } from '@/context/PlaySession';
import { ChallengeCard, ActionButton } from '../components';
import type { ChallengeProps } from '@/types';

export const ClueChallenge = ({ challenge, media, isLastStep }: ChallengeProps<CluePF>) => {
  const advanceToNextStep = useAdvanceToNextStep();

  return (
    <ChallengeCard
      badge={CHALLENGE_BADGES[ChallengeType.Clue]}
      title={challenge.title}
      description={challenge.description}
      media={media}
      showHint={false}
      footer={
        <ActionButton onClick={advanceToNextStep} isValidating={false} isLastStep={isLastStep} label="Continue" />
      }
    />
  );
};
