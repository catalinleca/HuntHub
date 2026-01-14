import { AnswerPayload, Challenge } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { IAnswerValidator, ValidationResult } from '../answer-validator.helper';

/**
 * QuizChoiceValidator - Validates multiple choice quiz answers
 *
 * Compares submitted optionId against the quiz's targetId.
 */
export const QuizChoiceValidator: IAnswerValidator = {
  validate(payload: AnswerPayload, step: IStep): ValidationResult {
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

    const isCorrect = submittedOptionId === quiz.targetId;

    return {
      isCorrect,
      feedback: isCorrect ? 'Correct!' : 'That\'s not quite right. Try again!',
    };
  },
};
