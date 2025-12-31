import { z } from 'zod';
import { Quiz, OptionType } from '@hunthub/shared/schemas';
import { errorMessage } from '../../messages';

const QuizOptionFormSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const QuizFormSchema = Quiz.extend({
  title: z.string().min(1, errorMessage('Question').required),
  type: OptionType,
  options: z.array(QuizOptionFormSchema).optional(),
  targetId: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'input') {
    if (!data.target?.text?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['target', 'text'],
        message: errorMessage('Correct answer').required,
      });
    }
  }

  if (data.type === 'choice') {
    if (!data.options?.length || data.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: errorMessage('Answer options').minCount(2),
      });
    }

    const emptyOptions = data.options?.filter((o) => !o.text?.trim());
    if (emptyOptions?.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: 'All options must have text',
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
