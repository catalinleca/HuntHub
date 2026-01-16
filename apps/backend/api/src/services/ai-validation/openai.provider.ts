import OpenAI from 'openai';
import { injectable } from 'inversify';
import { openaiApiKey } from '@/config/env.config';

export interface TextValidationParams {
  userResponse: string;
  instructions: string;
  aiInstructions?: string;
}

export interface AIProviderResponse {
  isValid: boolean;
  confidence: number;
  feedback: string;
}

export interface IAIProvider {
  readonly name: string;
  validateText(params: TextValidationParams): Promise<AIProviderResponse>;
}

const MAX_INPUT_CHARS = 500;

@injectable()
export class OpenAIProvider implements IAIProvider {
  readonly name = 'openai';
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: openaiApiKey,
    });
  }

  async validateText(params: TextValidationParams): Promise<AIProviderResponse> {
    const { userResponse, instructions, aiInstructions } = params;

    if (userResponse.length > MAX_INPUT_CHARS) {
      throw new Error(`Response too long: ${userResponse.length} chars (max ${MAX_INPUT_CHARS})`);
    }

    const validationCriteria = aiInstructions || instructions;

    const systemPrompt = `You are a treasure hunt validation assistant.
Your job is to determine if a player's text response meets the specified criteria.
Respond with a JSON object: { "isValid": boolean, "confidence": number (0-1), "feedback": string }
Be encouraging but accurate. The feedback should be 1-2 sentences.`;

    const userPrompt = `Task: ${instructions}\n\nValidation criteria: ${validationCriteria}\n\nPlayer's response: "${userResponse}"\n\nDoes this response meet the criteria?`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
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
      throw new Error('Empty response from OpenAI');
    }

    const result = JSON.parse(content);

    return {
      isValid: result.isValid,
      confidence: result.confidence,
      feedback: result.feedback,
    };
  }
}
