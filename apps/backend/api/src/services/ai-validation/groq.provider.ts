import Groq from 'groq-sdk';
import { injectable } from 'inversify';
import { groqApiKey } from '@/config/env.config';
import type { ITextValidationProvider, TextValidationParams, ValidationResponse } from './interfaces';
import { MAX_RESPONSE_CHARS, MAX_INSTRUCTIONS_CHARS, buildTextPrompt } from './validation.constants';

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

    const safeInstructions = instructions.slice(0, MAX_INSTRUCTIONS_CHARS);
    const safeAiInstructions = aiInstructions?.slice(0, MAX_INSTRUCTIONS_CHARS);

    if (
      instructions.length > MAX_INSTRUCTIONS_CHARS ||
      (aiInstructions && aiInstructions.length > MAX_INSTRUCTIONS_CHARS)
    ) {
      console.warn('[GroqProvider] Instructions truncated to', MAX_INSTRUCTIONS_CHARS, 'chars');
    }

    const criteria = safeAiInstructions || safeInstructions;
    const prompt = buildTextPrompt(safeInstructions, criteria, userResponse);

    const response = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from Groq');
    }

    let result;
    try {
      const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleaned);
    } catch {
      throw new Error('Invalid JSON response from Groq');
    }

    if (typeof result.isValid !== 'boolean') {
      throw new Error('Missing or invalid isValid in Groq response');
    }

    return {
      isValid: result.isValid,
      confidence: typeof result.confidence === 'number' ? result.confidence : 0.5,
      feedback: typeof result.feedback === 'string' ? result.feedback : 'Response evaluated.',
    };
  }
}
