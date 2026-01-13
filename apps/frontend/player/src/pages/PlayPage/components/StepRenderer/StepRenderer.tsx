import React from 'react';
import { ChallengeType } from '@hunthub/shared';
import type { StepPF, ChallengePF } from '@hunthub/shared';
import { useValidation } from '@/context';
import { ClueChallenge, QuizChallenge, MissionChallenge, TaskChallenge } from '@/components/challenges';
import type { BaseChallengeProps } from '@/types';

interface StepRendererProps {
  step: StepPF;
  isLastStep: boolean;
}

const CHALLENGES: Record<ChallengeType, (c: ChallengePF, props: BaseChallengeProps) => React.ReactNode> = {
  [ChallengeType.Clue]: (c, props) => c.clue && <ClueChallenge challenge={c.clue} {...props} />,
  [ChallengeType.Quiz]: (c, props) => c.quiz && <QuizChallenge challenge={c.quiz} {...props} />,
  [ChallengeType.Mission]: (c, props) => c.mission && <MissionChallenge challenge={c.mission} {...props} />,
  [ChallengeType.Task]: (c, props) => c.task && <TaskChallenge challenge={c.task} {...props} />,
};

export const StepRenderer = ({ step, isLastStep }: StepRendererProps) => {
  const { validate, isValidating, feedback } = useValidation();
  const baseProps = { onValidate: validate, isValidating, isLastStep, feedback };

  return CHALLENGES[step.type](step.challenge, baseProps);
};
