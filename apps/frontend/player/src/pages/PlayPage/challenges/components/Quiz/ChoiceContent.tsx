import React from 'react';
import { Stack, Typography, Radio } from '@mui/material';
import type { QuizPF } from '@hunthub/shared';
import * as S from './Quiz.styles';

interface ChoiceContentProps {
  quiz: QuizPF;
  selectedOptionId: string;
  onSelect: (optionId: string) => void;
  disabled: boolean;
}

export const ChoiceContent = ({ quiz, selectedOptionId, onSelect, disabled }: ChoiceContentProps) => {
  const handleSelect = (optionId: string) => {
    if (!disabled) {
      onSelect(optionId);
    }
  };

  return (
    <Stack gap={2}>
      {quiz.options?.map((option) => {
        const isSelected = selectedOptionId === option.id;

        return (
          <S.OptionCard
            key={option.id}
            $selected={isSelected}
            $disabled={disabled}
            onClick={() => handleSelect(option.id)}
          >
            <Stack direction="row" alignItems="center" gap={2}>
              <Radio checked={isSelected} disabled={disabled} size="small" />
              <Typography>{option.text}</Typography>
            </Stack>
          </S.OptionCard>
        );
      })}
    </Stack>
  );
};
