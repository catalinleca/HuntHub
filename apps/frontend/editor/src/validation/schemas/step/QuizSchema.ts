import { z } from 'zod';
import { errorMessage } from '../../messages';

/**
 * Quiz validation - all fields exist, conditional validation based on type.
 * All type-specific validation happens in superRefine where we know the type.
 */
export const QuizFormSchema = z
  .object({
    title: z.string().min(1, errorMessage('Question').required),
    description: z.string().optional(),
    type: z.enum(['choice', 'input']),
    options: z.array(z.object({ id: z.string(), text: z.string() })).optional(),
    targetId: z.string().optional(),
    target: z.object({ id: z.string(), text: z.string() }).optional(),
    randomizeOrder: z.boolean().optional(),
    validation: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'choice') {
      // Choice type: need at least 2 options
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({
          code: 'custom',
          path: ['options'],
          message: errorMessage('Answer options').minCount(2),
        });
      }

      // Each option needs text
      data.options?.forEach((option, index) => {
        if (!option.text.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: ['options', index, 'text'],
            message: errorMessage('Option text').required,
          });
        }
      });

      // Need targetId selected
      if (!data.targetId) {
        ctx.addIssue({
          code: 'custom',
          path: ['targetId'],
          message: 'Select the correct answer',
        });
      }
    }

    if (data.type === 'input') {
      // Input type: need target.text
      if (!data.target?.text?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['target', 'text'],
          message: errorMessage('Correct answer').required,
        });
      }
    }
  });
