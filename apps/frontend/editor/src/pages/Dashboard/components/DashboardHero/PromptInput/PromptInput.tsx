import type { KeyboardEvent } from 'react';
import { CircularProgress } from '@mui/material';
import { SparkleIcon } from '@phosphor-icons/react';
import * as S from './PromptInput.styles';

const PROMPT_MIN_LENGTH = 10;
const PROMPT_MAX_LENGTH = 500;
const PROMPT_WARNING_THRESHOLD = 450;

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const PromptInput = ({ value, onChange, onSubmit, isLoading }: PromptInputProps) => {
  const isValid = value.trim().length >= PROMPT_MIN_LENGTH && value.trim().length <= PROMPT_MAX_LENGTH;
  const isNearLimit = value.length >= PROMPT_WARNING_THRESHOLD;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const isEnterWithoutShift = e.key === 'Enter' && !e.shiftKey;

    if (isEnterWithoutShift && isValid && !isLoading) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <S.Card>
      <S.InputWrapper>
        <S.StyledTextField
          multiline
          rows={3}
          fullWidth
          placeholder="Describe your treasure hunt..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          slotProps={{ htmlInput: { maxLength: PROMPT_MAX_LENGTH } }}
        />
        <S.CharacterCount $isNearLimit={isNearLimit}>
          {value.length}/{PROMPT_MAX_LENGTH}
        </S.CharacterCount>
        <S.GenerateButton onClick={onSubmit} disabled={!isValid || isLoading}>
          {isLoading ? <CircularProgress size={20} color="inherit" /> : <SparkleIcon size={20} weight="fill" />}
        </S.GenerateButton>
      </S.InputWrapper>
    </S.Card>
  );
};
