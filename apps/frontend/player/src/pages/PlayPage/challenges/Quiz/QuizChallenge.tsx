import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnswerType, OptionType } from '@hunthub/shared';
import type { QuizPF } from '@hunthub/shared';
import { QUIZ_BADGES } from '@/constants';
import { ChallengeCard, ActionButton } from '../components';
import { ChoiceContent, InputContent } from '../components/Quiz';
import type { ChallengeProps } from '@/types';

export const QuizChallenge = ({
  challenge,
  onValidate,
  isValidating,
  isLastStep,
  feedback,
  media,
  timeLimit,
  maxAttempts,
}: ChallengeProps<QuizPF>) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [inputAnswer, setInputAnswer] = useState<string>('');
  const [attemptCount, setAttemptCount] = useState(0);
  const prevFeedbackRef = useRef<string | null>(null);

  const isChoiceMode = challenge.type === OptionType.Choice;
  const hasAnswer = isChoiceMode ? selectedOptionId !== '' : inputAnswer.trim() !== '';

  // Track attempts when validation returns incorrect
  useEffect(() => {
    if (feedback && feedback !== prevFeedbackRef.current) {
      const isIncorrect = !feedback.toLowerCase().includes('correct');
      if (isIncorrect) {
        setAttemptCount((prev) => prev + 1);
      }
    }
    prevFeedbackRef.current = feedback;
  }, [feedback]);

  const handleSubmit = useCallback(() => {
    if (!hasAnswer) {
      return;
    }

    if (isChoiceMode) {
      onValidate(AnswerType.QuizChoice, { quizChoice: { optionId: selectedOptionId } });
    } else {
      onValidate(AnswerType.QuizInput, { quizInput: { answer: inputAnswer.trim() } });
    }
  }, [hasAnswer, isChoiceMode, selectedOptionId, inputAnswer, onValidate]);

  const handleTimeExpire = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  const handleMaxAttempts = useCallback(() => {
    // Auto-submit current answer when max attempts reached
    handleSubmit();
  }, [handleSubmit]);

  const badge = QUIZ_BADGES[challenge.type];

  return (
    <ChallengeCard
      badge={badge}
      title={challenge.title}
      description={challenge.description}
      media={media}
      timeLimit={timeLimit}
      maxAttempts={maxAttempts}
      currentAttempts={attemptCount}
      feedback={feedback}
      onTimeExpire={handleTimeExpire}
      onMaxAttempts={handleMaxAttempts}
      showHint
      footer={
        <ActionButton
          onClick={handleSubmit}
          isValidating={isValidating}
          isLastStep={isLastStep}
          disabled={!hasAnswer}
          label="Submit Answer"
        />
      }
    >
      {isChoiceMode ? (
        <ChoiceContent
          quiz={challenge}
          selectedOptionId={selectedOptionId}
          onSelect={setSelectedOptionId}
          disabled={isValidating}
        />
      ) : (
        <InputContent value={inputAnswer} onChange={setInputAnswer} disabled={isValidating} />
      )}
    </ChallengeCard>
  );
};
