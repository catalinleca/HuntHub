import { AnswerPayload } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { IAnswerValidator, ValidationResult } from '../answer-validator.helper';

export const ClueValidator: IAnswerValidator = {
  validate(_payload: AnswerPayload, _step: IStep): ValidationResult {
    return {
      isCorrect: true,
    };
  },
};
