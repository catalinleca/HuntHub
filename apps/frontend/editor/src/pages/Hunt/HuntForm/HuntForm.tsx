import React from 'react';
import { Typography } from '@mui/material';
import { ChallengeType } from '@hunthub/shared';
import { ClueInput, QuizInput, MissionInput, TaskInput } from '../HuntSteps';
import * as S from './HuntForm.styles';

interface HuntFormProps {
  stepIndex: number;
  stepType?: ChallengeType;
}

const STEP_INPUT_COMPONENTS: Record<ChallengeType, React.ComponentType<{ stepIndex: number }>> = {
  [ChallengeType.Clue]: ClueInput,
  [ChallengeType.Quiz]: QuizInput,
  [ChallengeType.Mission]: MissionInput,
  [ChallengeType.Task]: TaskInput,
};

export const HuntForm = ({ stepIndex, stepType }: HuntFormProps) => {
  if (!stepType) {
    return (
      <S.FormArea>
        <S.FormCard>
          <Typography color="text.secondary">Select a step to edit</Typography>
        </S.FormCard>
      </S.FormArea>
    );
  }

  const StepInputComponent = STEP_INPUT_COMPONENTS[stepType];

  return (
    <S.FormArea>
      <S.FormCard>
        <StepInputComponent stepIndex={stepIndex} />
      </S.FormCard>
    </S.FormArea>
  );
};
