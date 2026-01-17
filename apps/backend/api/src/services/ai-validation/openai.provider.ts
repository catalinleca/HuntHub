import OpenAI from 'openai';
import { injectable } from 'inversify';
import { openaiApiKey } from '@/config/env.config';
import type { ITextValidationProvider, TextValidationParams, ValidationResponse } from './interfaces';
import { MAX_RESPONSE_CHARS, buildTextPrompt } from './validation.constants';
import { sanitizeInstructions, parseJsonResponse, normalizeValidationResponse } from './validation-utils';
import { logger } from '@/utils/logger';

@injectable()
export class OpenAIProvider implements ITextValidationProvider {
  readonly name = 'openai';
  private client: OpenAI;

  constructor() {
    if (!openaiApiKey) {
      logger.warn('OPENAI_API_KEY not set - text validation calls will fail');
    }
    this.client = new OpenAI({ apiKey: openaiApiKey });
  }

  async validateText(params: TextValidationParams): Promise<ValidationResponse> {
    const { userResponse, instructions, aiInstructions } = params;

    if (userResponse.length > MAX_RESPONSE_CHARS) {
      throw new Error(`Response too long: ${userResponse.length} chars (max ${MAX_RESPONSE_CHARS})`);
    }

    const { safeInstructions, criteria } = sanitizeInstructions(instructions, aiInstructions, this.name);
    const prompt = buildTextPrompt(safeInstructions, criteria, userResponse);

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    const result = parseJsonResponse(content, this.name);

    return normalizeValidationResponse(result, this.name, 'Response evaluated.');
  }
}
