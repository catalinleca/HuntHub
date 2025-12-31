import { z } from 'zod';
import { Quiz, OptionType, Option } from '@hunthub/shared/schemas';
import { errorMessage } from '../../messages';

export const QuizFormSchema = Quiz.extend({
  title: z.string().min(1, errorMessage('Question').required),
  type: OptionType,

  // Form-only fields (not in API schema)
  options: z.array(Option).optional(),
  targetId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'choice') {
    if (!data.options?.length || data.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: errorMessage('Answer options').minCount(2),
      });
    }
    if (!data.targetId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['targetId'],
        message: 'Select the correct answer',
      });
    }
  }
});
