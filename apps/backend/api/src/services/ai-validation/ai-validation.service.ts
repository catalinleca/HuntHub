import { inject, injectable } from 'inversify';
import { TYPES } from '@/shared/types';
import type { ITextValidationProvider, IAudioValidationProvider } from './interfaces';

export interface AIValidationResult {
  isCorrect: boolean;
  feedback: string;
  confidence?: number;
  aiModel?: string;
  processingTimeMs?: number;
  fallbackUsed?: boolean;
  transcript?: string;
}

interface AIValidationConfig {
  timeoutMs: number;
}

export interface IAIValidationService {
  validateTaskResponse(
    userResponse: string,
    instructions: string,
    aiInstructions?: string,
  ): Promise<AIValidationResult>;

  validateAudioResponse(
    audioBuffer: Buffer,
    mimeType: string,
    instructions: string,
    aiInstructions?: string,
  ): Promise<AIValidationResult>;

  isAvailable(): boolean;
}

@injectable()
export class AIValidationService implements IAIValidationService {
  private config: AIValidationConfig;

  constructor(
    @inject(TYPES.TextValidationProvider) private textProvider: ITextValidationProvider,
    @inject(TYPES.AudioValidationProvider) private audioProvider: IAudioValidationProvider,
  ) {
    this.config = {
      timeoutMs: parseInt(process.env.AI_VALIDATION_TIMEOUT_MS || '15000', 10),
    };
  }

  async validateTaskResponse(
    userResponse: string,
    instructions: string,
    aiInstructions?: string,
  ): Promise<AIValidationResult> {
    const startTime = Date.now();

    try {
      const response = await this.withTimeout(
        this.textProvider.validateText({
          userResponse,
          instructions,
          aiInstructions,
        }),
        this.config.timeoutMs,
      );

      return {
        isCorrect: response.isValid,
        feedback: response.feedback,
        confidence: response.confidence,
        aiModel: this.textProvider.name,
        processingTimeMs: Date.now() - startTime,
        fallbackUsed: false,
      };
    } catch (error) {
      console.error('[AIValidation] Task validation failed:', error);
      return this.createFallbackResult();
    }
  }

  async validateAudioResponse(
    audioBuffer: Buffer,
    mimeType: string,
    instructions: string,
    aiInstructions?: string,
  ): Promise<AIValidationResult> {
    const startTime = Date.now();

    try {
      const response = await this.withTimeout(
        this.audioProvider.validateAudio({
          audioBuffer,
          mimeType,
          instructions,
          aiInstructions,
        }),
        this.config.timeoutMs,
      );

      return {
        isCorrect: response.isValid,
        feedback: response.feedback,
        confidence: response.confidence,
        aiModel: this.audioProvider.name,
        processingTimeMs: Date.now() - startTime,
        fallbackUsed: false,
        transcript: response.transcript,
      };
    } catch (error) {
      console.error('[AIValidation] Audio validation failed:', error);
      return this.createFallbackResult();
    }
  }

  isAvailable(): boolean {
    return true;
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`AI validation timeout after ${timeoutMs}ms`)), timeoutMs),
      ),
    ]);
  }

  private createFallbackResult(): AIValidationResult {
    return {
      isCorrect: true,
      feedback: 'Response received!',
      fallbackUsed: true,
    };
  }
}
