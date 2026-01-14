import { AnswerPayload } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { IAnswerValidator, ValidationResult } from '../answer-validator.helper';

/**
 * ClueValidator - Validates clue acknowledgments
 *
 * Clues are always "correct" - they're just content the player reads.
 * The validation is simply an acknowledgment that the player has seen it.
 */
export const ClueValidator: IAnswerValidator = {
  validate(_payload: AnswerPayload, _step: IStep): ValidationResult {
    // Clues always pass - just an acknowledgment
    return {
      isCorrect: true,
    };
  },
};
