import { useState, useCallback } from 'react';
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
  currentAttempts,
  media,
  timeLimit,
  maxAttempts,
  hasHint,
}: ChallengeProps<QuizPF>) => {
  const [selectedOptionId, setSelectedOptionId] = useState('');
  const [inputAnswer, setInputAnswer] = useState('');

  const isChoiceMode = challenge.type === OptionType.Choice;
  const hasAnswer = isChoiceMode ? selectedOptionId !== '' : inputAnswer.trim() !== '';

  const handleSubmit = useCallback(() => {
    if (!hasAnswer) return;

    if (isChoiceMode) {
      onValidate(AnswerType.QuizChoice, { quizChoice: { optionId: selectedOptionId } });
    } else {
      onValidate(AnswerType.QuizInput, { quizInput: { answer: inputAnswer.trim() } });
    }
  }, [hasAnswer, isChoiceMode, selectedOptionId, inputAnswer, onValidate]);

  return (
    <ChallengeCard
      badge={QUIZ_BADGES[challenge.type]}
      title={challenge.title}
      description={challenge.description}
      media={media}
      timeLimit={timeLimit}
      maxAttempts={maxAttempts}
      currentAttempts={currentAttempts}
      feedback={feedback}
      onTimeExpire={handleSubmit}
      onMaxAttempts={handleSubmit}
      showHint={hasHint}
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
