import { AnswerPayload, Challenge, MimeTypes } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { container } from '@/config/inversify';
import { TYPES } from '@/shared/types';
import AssetModel from '@/database/models/Asset';
import type { IAIValidationService } from '@/services/ai-validation';
import { IAnswerValidator, ValidationResult } from '../answer-validator.helper';

const AUDIO_MIME_TYPES: MimeTypes[] = [MimeTypes.AudioMpeg, MimeTypes.AudioWav, MimeTypes.AudioOgg];

const isAudioMimeType = (mimeType: MimeTypes): boolean => AUDIO_MIME_TYPES.includes(mimeType);

const fetchAudioBuffer = async (url: string): Promise<Buffer> => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

export const MissionMediaValidator: IAnswerValidator = {
  async validate(payload: AnswerPayload, step: IStep): Promise<ValidationResult> {
    const assetId = payload.missionMedia?.assetId;

    if (!assetId) {
      return {
        isCorrect: false,
        feedback: 'Please upload your media',
      };
    }

    const asset = await AssetModel.findOne({ assetId });
    if (!asset) {
      return {
        isCorrect: false,
        feedback: 'Media not found',
      };
    }

    const challenge = step.challenge as Challenge;
    const mission = challenge.mission;

    // Only validate audio with aiInstructions
    if (isAudioMimeType(asset.mimeType) && mission?.aiInstructions) {
      const audioBuffer = await fetchAudioBuffer(asset.url);
      const aiService = container.get<IAIValidationService>(TYPES.AIValidationService);
      const result = await aiService.validateAudioResponse(
        audioBuffer,
        asset.mimeType,
        mission.title || mission.description || '',
        mission.aiInstructions,
      );

      return {
        isCorrect: result.isCorrect,
        feedback: result.feedback,
      };
    }

    // No AI validation needed - auto-pass
    return {
      isCorrect: true,
      feedback: 'Media received!',
    };
  },
};
