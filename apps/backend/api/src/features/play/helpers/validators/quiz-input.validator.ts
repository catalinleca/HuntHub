import { AnswerPayload, Challenge } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { IAnswerValidator, ValidationResult } from '../answer-validator.helper';

/**
 * QuizInputValidator - Validates free text quiz answers
 *
 * Compares submitted answer against expectedAnswer.
 * Case-insensitive, trimmed comparison.
 *
 * Future: Support validation modes (fuzzy, contains, numeric-range)
 */
export const QuizInputValidator: IAnswerValidator = {
  validate(payload: AnswerPayload, step: IStep): ValidationResult {
    const challenge = step.challenge as Challenge;
    const quiz = challenge.quiz;

    if (!quiz) {
      return {
        isCorrect: false,
        feedback: 'Invalid quiz configuration',
      };
    }

    const submittedAnswer = payload.quizInput?.answer?.trim().toLowerCase();
    const expectedAnswer = quiz.expectedAnswer?.trim().toLowerCase();

    if (!submittedAnswer) {
      return {
        isCorrect: false,
        feedback: 'Please provide an answer',
      };
    }

    if (!expectedAnswer) {
      return {
        isCorrect: false,
        feedback: 'Invalid quiz configuration - no expected answer',
      };
    }

    // Simple exact match (case-insensitive, trimmed)
    // TODO: Support quiz.validation.mode for fuzzy, contains, numeric-range
    const isCorrect = submittedAnswer === expectedAnswer;

    return {
      isCorrect,
      feedback: isCorrect ? 'Correct!' : 'That\'s not quite right. Try again!',
    };
  },
};
