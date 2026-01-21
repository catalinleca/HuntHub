import { GoogleGenerativeAI } from '@google/generative-ai';
import { injectable } from 'inversify';
import { geminiApiKey } from '@/config/env.config';
import type {
  IAudioValidationProvider,
  IImageValidationProvider,
  AudioValidationParams,
  AudioValidationResponse,
  ImageValidationParams,
  ValidationResponse,
} from './interfaces';
import { buildAudioPrompt, buildImagePrompt } from './validation.constants';
import { sanitizeInstructions, parseJsonResponse, normalizeValidationResponse } from './validation-utils';
import { logger } from '@/utils/logger';

@injectable()
export class GeminiProvider implements IAudioValidationProvider, IImageValidationProvider {
  readonly name = 'gemini';
  private client: GoogleGenerativeAI;

  constructor() {
    if (!geminiApiKey) {
      logger.warn('GEMINI_API_KEY not set - audio/image validation calls will fail');
    }
    this.client = new GoogleGenerativeAI(geminiApiKey || '');
  }

  async validateAudio(params: AudioValidationParams): Promise<AudioValidationResponse> {
    const { audioBuffer, mimeType, instructions, aiInstructions, attemptCount } = params;

    const { safeInstructions, criteria } = sanitizeInstructions(instructions, aiInstructions, this.name);
    const prompt = buildAudioPrompt(safeInstructions, criteria, attemptCount);

    const content = await this.callGemini(prompt, mimeType, audioBuffer);
    const result = parseJsonResponse(content, this.name);
    const response = normalizeValidationResponse(result, this.name, 'Audio evaluated.');

    return {
      ...response,
      transcript: typeof result.transcript === 'string' ? result.transcript : undefined,
    };
  }

  async validateImage(params: ImageValidationParams): Promise<ValidationResponse> {
    const { imageBuffer, mimeType, instructions, aiInstructions, attemptCount } = params;

    const { safeInstructions, criteria } = sanitizeInstructions(instructions, aiInstructions, this.name);
    const prompt = buildImagePrompt(safeInstructions, criteria, attemptCount);

    const content = await this.callGemini(prompt, mimeType, imageBuffer);
    const result = parseJsonResponse(content, this.name);

    return normalizeValidationResponse(result, this.name, 'Image evaluated.');
  }

  private async callGemini(prompt: string, mimeType: string, buffer: Buffer): Promise<string> {
    const model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

    const response = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: buffer.toString('base64'),
        },
      },
    ]);

    return response.response.text();
  }
}
