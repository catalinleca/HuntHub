import { AnswerPayload } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { IAnswerValidator, ValidationResult } from '../answer-validator.helper';

export const ClueValidator: IAnswerValidator = {
  async validate(_payload: AnswerPayload, _step: IStep): Promise<ValidationResult> {
    return {
      isCorrect: true,
    };
  },
};
