import { inject, injectable } from 'inversify';
import { TYPES } from '@/shared/types';
import { IAIProvider } from './openai.provider';

export interface AIValidationResult {
  isCorrect: boolean;
  feedback: string;
  confidence?: number;
  aiModel?: string;
  processingTimeMs?: number;
  fallbackUsed?: boolean;
}

interface AIValidationConfig {
  timeoutMs: number;
  confidenceThresholds: {
    high: number;
    low: number;
  };
}

export interface IAIValidationService {
  validateTaskResponse(
    userResponse: string,
    instructions: string,
    aiInstructions?: string,
  ): Promise<AIValidationResult>;

  isAvailable(): boolean;
}

@injectable()
export class AIValidationService implements IAIValidationService {
  private config: AIValidationConfig;

  constructor(@inject(TYPES.AIProvider) private provider: IAIProvider) {
    this.config = {
      timeoutMs: parseInt(process.env.AI_VALIDATION_TIMEOUT_MS || '15000', 10),
      confidenceThresholds: {
        high: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD_HIGH || '0.80'),
        low: parseFloat(process.env.AI_CONFIDENCE_THRESHOLD_LOW || '0.40'),
      },
    };
  }

  async validateTaskResponse(
    userResponse: string,
    instructions: string,
    aiInstructions?: string,
  ): Promise<AIValidationResult> {
    const startTime = Date.now();

    try {
      const providerResponse = await this.withTimeout(
        this.provider.validateText({
          userResponse,
          instructions,
          aiInstructions,
        }),
        this.config.timeoutMs,
      );

      const { high, low } = this.config.confidenceThresholds;
      const isCorrect = providerResponse.confidence >= low;

      let feedback = providerResponse.feedback;
      if (providerResponse.confidence >= high) {
        // High confidence - use feedback as-is
      } else if (providerResponse.confidence >= low) {
        feedback = `Accepted! ${providerResponse.feedback}`;
      } else {
        feedback = `Try again. ${providerResponse.feedback}`;
      }

      return {
        isCorrect,
        feedback,
        confidence: providerResponse.confidence,
        aiModel: this.provider.name,
        processingTimeMs: Date.now() - startTime,
        fallbackUsed: false,
      };
    } catch (error) {
      console.error('[AIValidation] Task validation failed:', error);
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
