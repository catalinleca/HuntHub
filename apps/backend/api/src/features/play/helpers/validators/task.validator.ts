import { AnswerPayload, Challenge } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { container } from '@/config/inversify';
import { TYPES } from '@/shared/types';
import type { IAIValidationService } from '@/services/ai-validation';
import { IAnswerValidator, ValidationResult } from '../answer-validator.helper';

export const TaskValidator: IAnswerValidator = {
  async validate(payload: AnswerPayload, step: IStep): Promise<ValidationResult> {
    const response = payload.task?.response?.trim();

    if (!response) {
      return {
        isCorrect: false,
        feedback: 'Please provide a response',
      };
    }

    const challenge = step.challenge as Challenge;
    const task = challenge.task;

    if (!task?.instructions) {
      return {
        isCorrect: true,
        feedback: 'Response recorded!',
      };
    }

    try {
      const aiService = container.get<IAIValidationService>(TYPES.AIValidationService);
      const result = await aiService.validateTaskResponse(response, task.instructions, task.aiInstructions);

      return {
        isCorrect: result.isCorrect,
        feedback: result.feedback,
      };
    } catch (error) {
      console.error('[TaskValidator] AI validation failed:', error);
      return {
        isCorrect: false,
        feedback: 'Unable to validate your response. Please try again.',
      };
    }
  },
};
