import Groq from 'groq-sdk';
import { injectable } from 'inversify';
import { groqApiKey } from '@/config/env.config';
import type { ITextValidationProvider, TextValidationParams, ValidationResponse } from './interfaces';
import { MAX_RESPONSE_CHARS, buildTextPrompt } from './validation.constants';
import { sanitizeInstructions, parseJsonResponse, normalizeValidationResponse } from './validation-utils';

@injectable()
export class GroqProvider implements ITextValidationProvider {
  readonly name = 'groq';
  private client: Groq;

  constructor() {
    if (!groqApiKey) {
      console.warn('[GroqProvider] GROQ_API_KEY not set - AI validation will use fallback');
    }
    this.client = new Groq({ apiKey: groqApiKey });
  }

  async validateText(params: TextValidationParams): Promise<ValidationResponse> {
    const { userResponse, instructions, aiInstructions } = params;

    if (userResponse.length > MAX_RESPONSE_CHARS) {
      throw new Error(`Response too long: ${userResponse.length} chars (max ${MAX_RESPONSE_CHARS})`);
    }

    const { safeInstructions, criteria } = sanitizeInstructions(instructions, aiInstructions, this.name);
    const prompt = buildTextPrompt(safeInstructions, criteria, userResponse);

    const response = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    const result = parseJsonResponse(content, this.name);

    return normalizeValidationResponse(result, this.name, 'Response evaluated.');
  }
}
