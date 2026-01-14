import { AnswerType, AnswerPayload, ChallengeType } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { ValidationError } from '@/shared/errors';

import { ClueValidator } from './validators/clue.validator';
import { QuizChoiceValidator } from './validators/quiz-choice.validator';
import { QuizInputValidator } from './validators/quiz-input.validator';
import { MissionLocationValidator } from './validators/mission-location.validator';
import { MissionMediaValidator } from './validators/mission-media.validator';
import { TaskValidator } from './validators/task.validator';

/**
 * Validation result from individual validators
 */
export interface ValidationResult {
  isCorrect: boolean;
  feedback?: string;
}

/**
 * Validator interface - all validators must implement this
 */
export interface IAnswerValidator {
  validate(payload: AnswerPayload, step: IStep): ValidationResult;
}

/**
 * Mapping from AnswerType to ChallengeType for validation
 */
const ANSWER_TYPE_TO_CHALLENGE_TYPE: Record<AnswerType, ChallengeType> = {
  [AnswerType.Clue]: ChallengeType.Clue,
  [AnswerType.QuizChoice]: ChallengeType.Quiz,
  [AnswerType.QuizInput]: ChallengeType.Quiz,
  [AnswerType.MissionLocation]: ChallengeType.Mission,
  [AnswerType.MissionMedia]: ChallengeType.Mission,
  [AnswerType.Task]: ChallengeType.Task,
};

/**
 * AnswerValidator - Strategy pattern dispatcher for answer validation
 *
 * Routes validation requests to appropriate validator based on AnswerType.
 * Each validator is a static class with no side effects.
 */
export class AnswerValidator {
  /**
   * Validator registry - maps AnswerType to validator implementation
   */
  private static validators: Record<AnswerType, IAnswerValidator> = {
    [AnswerType.Clue]: ClueValidator,
    [AnswerType.QuizChoice]: QuizChoiceValidator,
    [AnswerType.QuizInput]: QuizInputValidator,
    [AnswerType.MissionLocation]: MissionLocationValidator,
    [AnswerType.MissionMedia]: MissionMediaValidator,
    [AnswerType.Task]: TaskValidator,
  };

  /**
   * Validate an answer against a step's challenge
   *
   * @param answerType - Type of answer being submitted
   * @param payload - Answer data
   * @param step - Step containing the challenge
   * @returns ValidationResult with isCorrect and optional feedback
   * @throws ValidationError if answerType doesn't match step.type
   */
  static validate(answerType: AnswerType, payload: AnswerPayload, step: IStep): ValidationResult {
    // Validate answer type matches step challenge type
    const expectedChallengeType = ANSWER_TYPE_TO_CHALLENGE_TYPE[answerType];
    if (step.type !== expectedChallengeType) {
      throw new ValidationError(
        `Invalid answer type for this step. Expected ${step.type}, got answer type for ${expectedChallengeType}`,
        [{ field: 'answerType', message: `This step requires a ${step.type} answer` }],
      );
    }

    // Get validator and execute
    const validator = this.validators[answerType];
    if (!validator) {
      throw new ValidationError(`Unknown answer type: ${answerType}`, []);
    }

    return validator.validate(payload, step);
  }

  /**
   * Get expected answer type(s) for a step
   */
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
