import { z } from 'zod';
import { GenerationError } from '@/shared/errors';
import { AIHuntSchema, AIGeneratedHunt } from './ai-hunt-output.schema';

export type SafeValidationResult =
  | {
      success: true;
      hunt: AIGeneratedHunt;
      errors: [];
    }
  | {
      success: false;
      hunt: null;
      errors: string[];
    };

export const safeValidateAIHunt = (data: unknown): SafeValidationResult => {
  const result = AIHuntSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      hunt: null,
      errors: formatZodErrors(result.error),
    };
  }

  return {
    success: true,
    hunt: result.data,
    errors: [],
  };
};

export const validateAIHuntOutput = (data: unknown): AIGeneratedHunt => {
  const result = safeValidateAIHunt(data);

  if (!result.success) {
    throw new GenerationError(`Invalid hunt: ${result.errors.join('; ')}`);
  }

  return result.hunt;
};

const formatZodErrors = (error: z.ZodError): string[] => {
  return error.errors.map((e) => {
    const path = e.path.length > 0 ? `${e.path.join('.')}: ` : '';
    return `${path}${e.message}`;
  });
};
