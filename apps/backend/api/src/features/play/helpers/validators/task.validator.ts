import { AnswerPayload } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { IAnswerValidator, ValidationResult } from '../answer-validator.helper';

/**
 * TaskValidator - Validates free-text task responses
 *
 * MVP: Auto-pass if response is provided
 * Future: AI-based validation of response quality
 */
export const TaskValidator: IAnswerValidator = {
  validate(payload: AnswerPayload, _step: IStep): ValidationResult {
    const response = payload.task?.response?.trim();

    if (!response) {
      return {
        isCorrect: false,
        feedback: 'Please provide a response',
      };
    }

    // MVP: Auto-pass - AI validation will be added later
    return {
      isCorrect: true,
      feedback: 'Response recorded!',
    };
  },
};
