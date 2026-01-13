import { useState, useCallback, useEffect, useRef, type ChangeEvent } from 'react';
import { Button } from '@mui/material';
import { ChallengeType, AnswerType } from '@hunthub/shared';
import type { TaskPF } from '@hunthub/shared';
import { PaperPlaneTiltIcon } from '@phosphor-icons/react';
import { CHALLENGE_BADGES } from '@/constants';
import { ChallengeCard } from '../components';
import type { ChallengeProps } from '@/types';
import * as S from './TaskChallenge.styles';

const MIN_CHAR_DEFAULT = 1;
const MAX_CHAR_DEFAULT = 2000;

export const TaskChallenge = ({
  challenge,
  onValidate,
  isValidating,
  feedback,
  media,
  timeLimit,
  maxAttempts,
}: ChallengeProps<TaskPF>) => {
  const [response, setResponse] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const prevFeedbackRef = useRef<string | null>(null);

  const minChars = MIN_CHAR_DEFAULT;
  const maxChars = MAX_CHAR_DEFAULT;
  const charCount = response.length;
  const isValidLength = charCount >= minChars && charCount <= maxChars;
  const isOverLimit = charCount > maxChars;
  const isNearLimit = charCount > maxChars * 0.9;

  // Track attempts when validation returns incorrect
  useEffect(() => {
    if (feedback && feedback !== prevFeedbackRef.current) {
      const isIncorrect = !feedback.toLowerCase().includes('correct') && !feedback.toLowerCase().includes('received');
      if (isIncorrect) {
        setAttemptCount((prev) => prev + 1);
      }
    }
    prevFeedbackRef.current = feedback;
  }, [feedback]);

  const handleChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setResponse(event.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    if (isValidLength && response.trim()) {
      onValidate(AnswerType.Task, { task: { response: response.trim() } });
    }
  }, [isValidLength, response, onValidate]);

  const handleTimeExpire = useCallback(() => {
    // Auto-submit current response when time expires
    if (response.trim()) {
      onValidate(AnswerType.Task, { task: { response: response.trim() } });
    }
  }, [response, onValidate]);

  const handleMaxAttempts = useCallback(() => {
    // Auto-submit current response when max attempts reached
    if (response.trim()) {
      onValidate(AnswerType.Task, { task: { response: response.trim() } });
    }
  }, [response, onValidate]);

  return (
    <ChallengeCard
      badge={CHALLENGE_BADGES[ChallengeType.Task]}
      title={challenge.title}
      description={challenge.instructions}
      media={media}
      timeLimit={timeLimit}
      maxAttempts={maxAttempts}
      currentAttempts={attemptCount}
      feedback={feedback}
      onTimeExpire={handleTimeExpire}
      onMaxAttempts={handleMaxAttempts}
      showHint
      footer={<></>}
    >
      <S.ContentContainer>
        <S.TextareaContainer>
          <S.StyledTextarea
            value={response}
            onChange={handleChange}
            placeholder="Type your response here..."
            disabled={isValidating}
            maxLength={maxChars + 100}
          />
          <S.CharacterCount variant="caption" $isWarning={isNearLimit && !isOverLimit} $isError={isOverLimit}>
            {charCount} / {maxChars}
          </S.CharacterCount>
        </S.TextareaContainer>

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handleSubmit}
          disabled={isValidating || !isValidLength || !response.trim()}
          startIcon={<PaperPlaneTiltIcon size={20} weight="bold" />}
        >
          {isValidating ? 'Submitting...' : 'Submit Response'}
        </Button>
      </S.ContentContainer>
    </ChallengeCard>
  );
};
