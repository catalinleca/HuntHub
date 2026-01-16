import Groq from 'groq-sdk';
import { injectable } from 'inversify';
import { groqApiKey } from '@/config/env.config';
import type { IAIProvider, TextValidationParams, AIProviderResponse } from './openai.provider';

const MAX_RESPONSE_CHARS = 500;
const MAX_INSTRUCTIONS_CHARS = 2000;

@injectable()
export class GroqProvider implements IAIProvider {
  readonly name = 'groq';
  private client: Groq;

  constructor() {
    if (!groqApiKey) {
      console.warn('[GroqProvider] GROQ_API_KEY not set - AI validation will use fallback');
    }
    this.client = new Groq({
      apiKey: groqApiKey,
    });
  }

  async validateText(params: TextValidationParams): Promise<AIProviderResponse> {
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

    const validationCriteria = safeAiInstructions || safeInstructions;

    const systemPrompt = `You are a treasure hunt validation assistant.
Your job is to determine if a player's text response meets the specified criteria.
Respond with a JSON object: { "isValid": boolean, "confidence": number (0-1), "feedback": string }
Be encouraging but accurate. The feedback should be 1-2 sentences.`;

    const userPrompt = `Task: ${safeInstructions}\n\nValidation criteria: ${validationCriteria}\n\nPlayer's response: "${userResponse}"\n\nDoes this response meet the criteria?`;

    const response = await this.client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Empty response from Groq');
    }

    let result;
    try {
      result = JSON.parse(content);
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
