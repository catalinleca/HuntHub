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

      const isCorrect = providerResponse.isValid;
      const feedback = providerResponse.feedback;

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

  // TODO: Fail-open by design for game UX. Revisit if validation becomes high-stakes.
  private createFallbackResult(): AIValidationResult {
    return {
      isCorrect: true,
      feedback: 'Response received!',
      fallbackUsed: true,
    };
  }
}
