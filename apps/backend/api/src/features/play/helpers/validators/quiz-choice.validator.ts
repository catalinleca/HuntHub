import { AnswerPayload, Challenge } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { IAnswerValidator, ValidationResult } from '../answer-validator.helper';

export const QuizChoiceValidator: IAnswerValidator = {
  async validate(payload: AnswerPayload, step: IStep): Promise<ValidationResult> {
    const challenge = step.challenge as Challenge;
    const quiz = challenge.quiz;

    if (!quiz) {
      return {
        isCorrect: false,
        feedback: 'Invalid quiz configuration',
      };
    }

    const submittedOptionId = payload.quizChoice?.optionId;

    if (!submittedOptionId) {
      return {
        isCorrect: false,
        feedback: 'Please select an answer',
      };
    }

    const validOptionIds = quiz.options?.map((o) => o.id) ?? [];
    if (!validOptionIds.includes(submittedOptionId)) {
      return {
        isCorrect: false,
        feedback: 'Invalid option selected',
      };
    }

    const isCorrect = submittedOptionId === quiz.targetId;

    return {
      isCorrect,
      feedback: isCorrect ? 'Correct!' : "That's not quite right. Try again!",
    };
  },
};
