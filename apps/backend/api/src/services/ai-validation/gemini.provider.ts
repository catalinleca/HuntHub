import { GoogleGenerativeAI } from '@google/generative-ai';
import { injectable } from 'inversify';
import { geminiApiKey } from '@/config/env.config';
import { parseBoolean } from '@/shared/utils/parsing';
import type { IAudioValidationProvider, AudioValidationParams, AudioValidationResponse } from './interfaces';
import { MAX_INSTRUCTIONS_CHARS, buildAudioPrompt } from './validation.constants';

@injectable()
export class GeminiProvider implements IAudioValidationProvider {
  readonly name = 'gemini';
  private client: GoogleGenerativeAI;

  constructor() {
    if (!geminiApiKey) {
      console.warn('[GeminiProvider] GEMINI_API_KEY not set - audio validation calls will fail');
    }
    this.client = new GoogleGenerativeAI(geminiApiKey || '');
  }

  async validateAudio(params: AudioValidationParams): Promise<AudioValidationResponse> {
    const { audioBuffer, mimeType, instructions, aiInstructions } = params;

    const safeInstructions = instructions.slice(0, MAX_INSTRUCTIONS_CHARS);
    const safeAiInstructions = aiInstructions?.slice(0, MAX_INSTRUCTIONS_CHARS);

    if (
      instructions.length > MAX_INSTRUCTIONS_CHARS ||
      (aiInstructions && aiInstructions.length > MAX_INSTRUCTIONS_CHARS)
    ) {
      console.warn('[GeminiProvider] Instructions truncated to', MAX_INSTRUCTIONS_CHARS, 'chars');
    }

    const criteria = safeAiInstructions || safeInstructions;
    const prompt = buildAudioPrompt(safeInstructions, criteria);

    const model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash-001' });

    const response = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: audioBuffer.toString('base64'),
        },
      },
    ]);

    const content = response.response.text();

    if (!content) {
      throw new Error('Empty response from Gemini');
    }

    let result;
    try {
      const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
      result = JSON.parse(cleaned);
    } catch {
      throw new Error('Invalid JSON response from Gemini');
    }

    const isValid = parseBoolean(result.isValid);
    if (isValid === null) {
      throw new Error('Missing or invalid isValid in Gemini response');
    }

    return {
      isValid,
      confidence: typeof result.confidence === 'number' ? result.confidence : 0.5,
      feedback: typeof result.feedback === 'string' ? result.feedback : 'Audio evaluated.',
      transcript: typeof result.transcript === 'string' ? result.transcript : undefined,
    };
  }
}
