import React from 'react';
import { RadioGroup, FormControlLabel, Radio } from '@mui/material';
import type { QuizPF } from '@hunthub/shared';

interface ChoiceContentProps {
  quiz: QuizPF;
  selectedOptionId: string;
  onSelect: (optionId: string) => void;
  disabled: boolean;
}

export const ChoiceContent = ({ quiz, selectedOptionId, onSelect, disabled }: ChoiceContentProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(event.target.value);
  };

  return (
    <RadioGroup value={selectedOptionId} onChange={handleChange}>
      {quiz.options?.map((option) => (
        <FormControlLabel
          key={option.id}
          value={option.id}
          control={<Radio />}
          label={option.text}
          disabled={disabled}
        />
      ))}
    </RadioGroup>
  );
};
