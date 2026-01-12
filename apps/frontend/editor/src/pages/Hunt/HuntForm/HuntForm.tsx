import React from 'react';
import { Typography } from '@mui/material';
import { ChallengeType } from '@hunthub/shared';
import { ClueInput, QuizInput, MissionInput, TaskInput } from '../HuntSteps';
import * as S from './HuntForm.styles';

interface HuntFormProps {
  stepIndex: number;
  stepType?: ChallengeType;
  isPreviewOpen?: boolean;
}

const STEP_INPUT_COMPONENTS: Record<ChallengeType, React.ComponentType<{ stepIndex: number }>> = {
  [ChallengeType.Clue]: ClueInput,
  [ChallengeType.Quiz]: QuizInput,
  [ChallengeType.Mission]: MissionInput,
  [ChallengeType.Task]: TaskInput,
};

export const HuntForm = ({ stepIndex, stepType, isPreviewOpen = false }: HuntFormProps) => {
  if (!stepType) {
    return (
      <S.FormArea $isPreviewOpen={isPreviewOpen}>
        <S.FormCard>
          <Typography color="text.secondary">Select a step to edit</Typography>
        </S.FormCard>
      </S.FormArea>
    );
  }

  const StepInputComponent = STEP_INPUT_COMPONENTS[stepType];

  return (
    <S.FormArea $isPreviewOpen={isPreviewOpen}>
      <S.FormCard>
        <StepInputComponent key={stepIndex} stepIndex={stepIndex} />
      </S.FormCard>
    </S.FormArea>
  );
};
