import { useState, useCallback, type ChangeEvent } from 'react';
import { ChallengeType, AnswerType } from '@hunthub/shared';
import type { TaskPF } from '@hunthub/shared';
import { CHALLENGE_BADGES } from '@/constants';
import { ChallengeCard, ActionButton } from '../components';
import type { ChallengeProps } from '@/types';
import * as S from './TaskChallenge.styles';

const MAX_CHARS = 2000;

export const TaskChallenge = ({
  challenge,
  onValidate,
  isValidating,
  isLastStep,
  feedback,
  currentAttempts,
  media,
  timeLimit,
  maxAttempts,
}: ChallengeProps<TaskPF>) => {
  const [response, setResponse] = useState('');

  const charCount = response.length;
  const isValidLength = charCount >= 1 && charCount <= MAX_CHARS;
  const isOverLimit = charCount > MAX_CHARS;
  const isNearLimit = charCount > MAX_CHARS * 0.9;
  const canSubmit = isValidLength && response.trim() !== '';

  const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setResponse(event.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    if (canSubmit) {
      onValidate(AnswerType.Task, { task: { response: response.trim() } });
    }
  }, [canSubmit, response, onValidate]);

  return (
    <ChallengeCard
      badge={CHALLENGE_BADGES[ChallengeType.Task]}
      title={challenge.title}
      description={challenge.instructions}
      media={media}
      timeLimit={timeLimit}
      maxAttempts={maxAttempts}
      currentAttempts={currentAttempts}
      feedback={feedback}
      onTimeExpire={handleSubmit}
      onMaxAttempts={handleSubmit}
      showHint
      footer={
        <ActionButton
          onClick={handleSubmit}
          isValidating={isValidating}
          isLastStep={isLastStep}
          disabled={!canSubmit}
          label="Submit Response"
        />
      }
    >
      <S.ContentContainer>
        <S.TextareaContainer>
          <S.StyledTextarea
            value={response}
            onChange={handleChange}
            placeholder="Type your response here..."
            disabled={isValidating}
            maxLength={MAX_CHARS + 100}
          />
          <S.CharacterCount variant="caption" $isWarning={isNearLimit && !isOverLimit} $isError={isOverLimit}>
            {charCount} / {MAX_CHARS}
          </S.CharacterCount>
        </S.TextareaContainer>
      </S.ContentContainer>
    </ChallengeCard>
  );
};
