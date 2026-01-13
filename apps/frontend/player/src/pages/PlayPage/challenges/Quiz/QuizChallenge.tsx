import React, { useState } from 'react';
import { AnswerType, OptionType } from '@hunthub/shared';
import type { QuizPF } from '@hunthub/shared';
import { QUIZ_BADGES } from '@/constants';
import { ChallengeCard, ActionButton, FeedbackDisplay } from '../components';
import { ChoiceContent, InputContent } from '../components/Quiz';
import type { ChallengeProps } from '@/types';

export const QuizChallenge = ({
  challenge,
  onValidate,
  isValidating,
  isLastStep,
  feedback,
}: ChallengeProps<QuizPF>) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [inputAnswer, setInputAnswer] = useState<string>('');

  const isChoiceMode = challenge.type === OptionType.Choice;
  const hasAnswer = isChoiceMode ? selectedOptionId !== '' : inputAnswer.trim() !== '';

  const handleSubmit = () => {
    if (!hasAnswer) {
      return;
    }

    if (isChoiceMode) {
      onValidate(AnswerType.QuizChoice, { quizChoice: { optionId: selectedOptionId } });
    } else {
      onValidate(AnswerType.QuizInput, { quizInput: { answer: inputAnswer.trim() } });
    }
  };

  const badge = QUIZ_BADGES[challenge.type];

  return (
    <ChallengeCard
      badge={badge}
      title={challenge.title}
      description={challenge.description}
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
      <FeedbackDisplay feedback={feedback} />
    </ChallengeCard>
  );
};
