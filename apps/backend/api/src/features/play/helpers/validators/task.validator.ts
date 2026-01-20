import { AnswerPayload, Challenge } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { container } from '@/config/inversify';
import { TYPES } from '@/shared/types';
import type { IAIValidationService } from '@/services/ai-validation';
import { IAnswerValidator, ValidationResult } from '../answer-validator.helper';
import { logger } from '@/utils/logger';

export const TaskValidator: IAnswerValidator = {
  async validate(payload: AnswerPayload, step: IStep, attemptCount?: number): Promise<ValidationResult> {
    const response = payload.task?.response?.trim();

    if (!response) {
      return {
        isCorrect: false,
        feedback: 'Please provide a response',
      };
    }

    const challenge = step.challenge as Challenge;
    const task = challenge.task;

    const hasTitle = !!task?.title?.trim();
    const hasInstructions = !!task?.instructions?.trim();
    const hasAiInstructions = !!task?.aiInstructions?.trim();

    if (!hasTitle && !hasInstructions && !hasAiInstructions) {
      return {
        isCorrect: true,
        feedback: 'Response recorded!',
      };
    }

    const instructions = task?.instructions?.trim() || task?.title?.trim() || '';

    try {
      const aiService = container.get<IAIValidationService>(TYPES.AIValidationService);
      const result = await aiService.validateTaskResponse(response, instructions, task?.aiInstructions, attemptCount);

      return {
        isCorrect: result.isCorrect,
        feedback: result.feedback,
      };
    } catch (error) {
      logger.error({ err: error }, 'Task validation failed');
      return {
        isCorrect: false,
        feedback: 'Unable to validate your response. Please try again.',
      };
    }
  },
};
