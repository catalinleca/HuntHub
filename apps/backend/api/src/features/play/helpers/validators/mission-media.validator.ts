import { AnswerPayload } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { IAnswerValidator, ValidationResult } from '../answer-validator.helper';

/**
 * MissionMediaValidator - Validates media upload missions
 *
 * MVP: Auto-pass if assetId is provided
 * Future: AI-based validation of uploaded content
 */
export const MissionMediaValidator: IAnswerValidator = {
  async validate(payload: AnswerPayload, _step: IStep): Promise<ValidationResult> {
    const assetId = payload.missionMedia?.assetId;

    if (!assetId) {
      return {
        isCorrect: false,
        feedback: 'Please upload your media',
      };
    }

    // MVP: Auto-pass - AI validation will be added later
    return {
      isCorrect: true,
      feedback: 'Media received!',
    };
  },
};
