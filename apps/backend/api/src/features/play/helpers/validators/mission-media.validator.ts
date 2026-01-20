import { AnswerPayload, Challenge, MimeTypes } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { container } from '@/config/inversify';
import { TYPES } from '@/shared/types';
import AssetModel from '@/database/models/Asset';
import type { IAIValidationService } from '@/services/ai-validation';
import { AUDIO_MIME_TYPES, IMAGE_MIME_TYPES } from '@/shared/utils/mimeTypes';
import { IAnswerValidator, ValidationResult } from '../answer-validator.helper';
import { logger } from '@/utils/logger';

type AIMediaType = 'audio' | 'image';

const getAIMediaType = (mimeType: MimeTypes): AIMediaType | null => {
  if (AUDIO_MIME_TYPES.includes(mimeType as (typeof AUDIO_MIME_TYPES)[number])) {
    return 'audio';
  }
  if (IMAGE_MIME_TYPES.includes(mimeType as (typeof IMAGE_MIME_TYPES)[number])) {
    return 'image';
  }
  return null;
};

const fetchMediaBuffer = async (url: string): Promise<Buffer> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

const validateWithAI = async (
  mediaType: AIMediaType,
  url: string,
  mimeType: string,
  instructions: string,
  aiInstructions: string,
  attemptCount?: number,
): Promise<ValidationResult> => {
  const buffer = await fetchMediaBuffer(url);
  const aiService = container.get<IAIValidationService>(TYPES.AIValidationService);

  switch (mediaType) {
    case 'audio': {
      const result = await aiService.validateAudioResponse(
        buffer,
        mimeType,
        instructions,
        aiInstructions,
        attemptCount,
      );
      return {
        isCorrect: result.isCorrect,
        feedback: result.feedback,
        confidence: result.confidence,
        transcript: result.transcript,
      };
    }
    case 'image': {
      const result = await aiService.validateImageResponse(
        buffer,
        mimeType,
        instructions,
        aiInstructions,
        attemptCount,
      );
      return {
        isCorrect: result.isCorrect,
        feedback: result.feedback,
        confidence: result.confidence,
      };
    }
  }
};

export const MissionMediaValidator: IAnswerValidator = {
  async validate(payload: AnswerPayload, step: IStep, attemptCount?: number): Promise<ValidationResult> {
    const assetId = payload.missionMedia?.assetId;
    if (!assetId) {
      return { isCorrect: false, feedback: 'Please upload your media' };
    }

    const asset = await AssetModel.findOne({ assetId });
    if (!asset) {
      return { isCorrect: false, feedback: 'Media not found' };
    }

    const challenge = step.challenge as Challenge;
    const mission = challenge.mission;
    const instructions = mission?.title || mission?.description;
    const aiInstructions = mission?.aiInstructions;
    const aiMediaType = getAIMediaType(asset.mimeType);

    if (!aiMediaType || !aiInstructions || !instructions) {
      return { isCorrect: true, feedback: 'Media received!' };
    }

    try {
      return await validateWithAI(aiMediaType, asset.url, asset.mimeType, instructions, aiInstructions, attemptCount);
    } catch (error) {
      logger.error({ err: error, mediaType: aiMediaType }, 'Media validation failed');
      return { isCorrect: false, feedback: `Unable to process your ${aiMediaType}. Please try again.` };
    }
  },
};
