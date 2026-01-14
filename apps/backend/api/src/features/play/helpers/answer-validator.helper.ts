import { AnswerType, AnswerPayload, ChallengeType } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { ValidationError } from '@/shared/errors';

import { ClueValidator } from './validators/clue.validator';
import { QuizChoiceValidator } from './validators/quiz-choice.validator';
import { QuizInputValidator } from './validators/quiz-input.validator';
import { MissionLocationValidator } from './validators/mission-location.validator';
import { MissionMediaValidator } from './validators/mission-media.validator';
import { TaskValidator } from './validators/task.validator';

export interface ValidationResult {
  isCorrect: boolean;
  feedback?: string;
}

export interface IAnswerValidator {
  validate(payload: AnswerPayload, step: IStep): ValidationResult;
}

const ANSWER_TYPE_TO_CHALLENGE_TYPE: Record<AnswerType, ChallengeType> = {
  [AnswerType.Clue]: ChallengeType.Clue,
  [AnswerType.QuizChoice]: ChallengeType.Quiz,
  [AnswerType.QuizInput]: ChallengeType.Quiz,
  [AnswerType.MissionLocation]: ChallengeType.Mission,
  [AnswerType.MissionMedia]: ChallengeType.Mission,
  [AnswerType.Task]: ChallengeType.Task,
};

export class AnswerValidator {
  private static validators: Record<AnswerType, IAnswerValidator> = {
    [AnswerType.Clue]: ClueValidator,
    [AnswerType.QuizChoice]: QuizChoiceValidator,
    [AnswerType.QuizInput]: QuizInputValidator,
    [AnswerType.MissionLocation]: MissionLocationValidator,
    [AnswerType.MissionMedia]: MissionMediaValidator,
    [AnswerType.Task]: TaskValidator,
  };

  static validate(answerType: AnswerType, payload: AnswerPayload, step: IStep): ValidationResult {
    const expectedChallengeType = ANSWER_TYPE_TO_CHALLENGE_TYPE[answerType];
    if (step.type !== expectedChallengeType) {
      throw new ValidationError(
        `Invalid answer type for this step. Expected ${step.type}, got answer type for ${expectedChallengeType}`,
        [{ field: 'answerType', message: `This step requires a ${step.type} answer` }],
      );
    }

    const validator = this.validators[answerType];
    if (!validator) {
      throw new ValidationError(`Unknown answer type: ${answerType}`, []);
    }

    return validator.validate(payload, step);
  }

  static getExpectedAnswerTypes(stepType: ChallengeType): AnswerType[] {
    const mapping: Record<ChallengeType, AnswerType[]> = {
      [ChallengeType.Clue]: [AnswerType.Clue],
      [ChallengeType.Quiz]: [AnswerType.QuizChoice, AnswerType.QuizInput],
      [ChallengeType.Mission]: [AnswerType.MissionLocation, AnswerType.MissionMedia],
      [ChallengeType.Task]: [AnswerType.Task],
    };

    return mapping[stepType] || [];
  }
}
