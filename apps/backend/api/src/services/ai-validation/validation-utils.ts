import { parseBoolean } from '@/shared/utils/parsing';
import { MAX_INSTRUCTIONS_CHARS } from './validation.constants';
import type { ValidationResponse } from './interfaces';
import { logger } from '@/utils/logger';

export interface SanitizedInstructions {
  safeInstructions: string;
  criteria: string;
}

export const sanitizeInstructions = (
  instructions: string,
  aiInstructions: string | undefined,
  providerName: string,
): SanitizedInstructions => {
  const safeInstructions = instructions.slice(0, MAX_INSTRUCTIONS_CHARS);
  const safeAiInstructions = aiInstructions?.slice(0, MAX_INSTRUCTIONS_CHARS);

  if (
    instructions.length > MAX_INSTRUCTIONS_CHARS ||
    (aiInstructions && aiInstructions.length > MAX_INSTRUCTIONS_CHARS)
  ) {
    logger.warn({ provider: providerName, maxChars: MAX_INSTRUCTIONS_CHARS }, 'Instructions truncated');
  }

  return {
    safeInstructions,
    criteria: safeAiInstructions || safeInstructions,
  };
};

export const parseJsonResponse = (
  content: string | null | undefined,
  providerName: string,
): Record<string, unknown> => {
  if (!content) {
    throw new Error(`Empty response from ${providerName}`);
  }

  try {
    const cleaned = content.replace(/```json\n?|\n?```/gi, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`Invalid JSON response from ${providerName}`);
  }
};

export const normalizeValidationResponse = (
  result: Record<string, unknown>,
  providerName: string,
  defaultFeedback: string,
): ValidationResponse => {
  const isValid = parseBoolean(result.isValid);

  if (isValid === null) {
    throw new Error(`Missing or invalid isValid in ${providerName} response`);
  }

  return {
    isValid,
    confidence: typeof result.confidence === 'number' ? result.confidence : 0.5,
    feedback: typeof result.feedback === 'string' ? result.feedback : defaultFeedback,
  };
};
