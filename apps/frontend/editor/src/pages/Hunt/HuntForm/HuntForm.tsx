import React from 'react';
import { Typography } from '@mui/material';
import { ChallengeType } from '@hunthub/shared';
import { ClueForm } from './forms';
import * as S from './HuntForm.styles';

interface HuntFormProps {
  stepIndex: number;
  stepType?: ChallengeType;
}

const FORM_COMPONENTS = {
  [ChallengeType.Clue]: ClueForm,
  [ChallengeType.Quiz]: null,
  [ChallengeType.Mission]: null,
  [ChallengeType.Task]: null,
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

  const FormComponent = FORM_COMPONENTS[stepType];

  if (!FormComponent) {
    return (
      <S.FormArea>
        <S.FormCard>
          <Typography color="text.secondary">{stepType} form coming soon...</Typography>
        </S.FormCard>
      </S.FormArea>
    );
  }

  return (
    <S.FormArea>
      <S.FormCard>
        <FormComponent stepIndex={stepIndex} />
      </S.FormCard>
    </S.FormArea>
  );
};
