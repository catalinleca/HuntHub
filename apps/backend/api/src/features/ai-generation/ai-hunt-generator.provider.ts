import OpenAI, { APIError } from 'openai';
import { injectable } from 'inversify';
import { zodResponseFormat } from 'openai/helpers/zod';
import { openaiApiKey } from '@/config/env.config';
import { GenerationError, ServiceUnavailableError } from '@/shared/errors';
import { logger } from '@/utils/logger';
import { buildSystemPrompt, buildUserPrompt } from './helpers/prompt-builder';
import { AIHuntSchema, AIGeneratedHunt } from './helpers/ai-hunt-output.schema';
import { safeValidateAIHunt } from './helpers/ai-hunt-output.validator';
import { GenerateHuntStyle } from '@hunthub/shared';

const MODEL = 'gpt-4o-2024-08-06';
const MAX_RETRIES = 1;

export interface GenerateHuntParams {
  prompt: string;
  style?: GenerateHuntStyle;
}

export interface GenerateHuntResult {
  hunt: AIGeneratedHunt;
  model: string;
  processingTimeMs: number;
  retryCount: number;
}

export interface IAIHuntGenerator {
  generateHunt(params: GenerateHuntParams): Promise<GenerateHuntResult>;
}

@injectable()
export class OpenAIHuntGenerator implements IAIHuntGenerator {
  private client: OpenAI;

  constructor() {
    if (!openaiApiKey) {
      logger.warn('OPENAI_API_KEY not set - AI hunt generation will fail');
    }
    this.client = new OpenAI({ apiKey: openaiApiKey });
  }

  async generateHunt(params: GenerateHuntParams): Promise<GenerateHuntResult> {
    const { prompt, style } = params;
    const startTime = Date.now();

    const systemPrompt = buildSystemPrompt();
    const userPrompt = buildUserPrompt(prompt, style);

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ];

    let lastErrors: string[] = [];

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const rawJson = await this.callOpenAI(messages);
      const validation = safeValidateAIHunt(rawJson);

      if (validation.success) {
        return {
          hunt: validation.hunt,
          model: MODEL,
          processingTimeMs: Date.now() - startTime,
          retryCount: attempt,
        };
      }

      lastErrors = validation.errors;

      if (attempt < MAX_RETRIES) {
        logger.info({ attempt: attempt + 1, errorCount: lastErrors.length }, 'Retrying with error feedback');

        messages.push(
          { role: 'assistant', content: JSON.stringify(rawJson) },
          { role: 'user', content: this.buildErrorFeedbackPrompt(lastErrors) },
        );
      }
    }

    throw new GenerationError(`Validation failed after retry: ${lastErrors.join('; ')}`);
  }

  private async callOpenAI(messages: OpenAI.ChatCompletionMessageParam[]): Promise<unknown> {
    try {
      const completion = await this.client.chat.completions.parse({
        model: MODEL,
        messages,
        response_format: zodResponseFormat(AIHuntSchema, 'hunt'),
        temperature: 0.7,
      });

      const message = completion.choices[0]?.message;

      if (message.refusal) {
        throw new GenerationError(`AI refused to generate: ${message.refusal}`);
      }

      if (!message.parsed) {
        throw new GenerationError('AI returned empty response');
      }

      return message.parsed;
    } catch (error) {
      if (error instanceof GenerationError) {
        throw error;
      }

      if (error instanceof APIError) {
        this.handleAPIError(error);
      }

      logger.error(
        { err: error, message: error instanceof Error ? error.message : String(error) },
        'Unexpected error calling OpenAI',
      );
      throw new GenerationError('Failed to call OpenAI');
    }
  }

  private handleAPIError(error: APIError): never {
    if (error.status === 503 || error.status === 502 || error.status === 500) {
      throw new ServiceUnavailableError('OpenAI service temporarily unavailable');
    }
    if (error.status === 429) {
      throw new ServiceUnavailableError('OpenAI rate limit exceeded');
    }
    throw new GenerationError(`OpenAI API error: ${error.message}`);
  }

  private buildErrorFeedbackPrompt(errors: string[]): string {
    return `Your previous response failed validation. Here are the errors:

${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}

Common fixes:
- Each step's "challenge" must have EXACTLY ONE field matching the step's "type"
- quiz-choice: "targetId" must match one of the option "id" values
- quiz-input: "expectedAnswer" must be non-empty
- mission: type must be "upload-media" only
- task: "instructions" must be non-empty

You MUST regenerate the COMPLETE hunt JSON with ALL these errors fixed. Do not return a partial response or explanation - return only the corrected JSON.`;
  }
}
