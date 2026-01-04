import { z } from 'zod';
import { Quiz } from '@hunthub/shared/schemas';
import { errorMessage } from '../../messages';

const QuizOptionFormSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Option text is required'),
});

const QuizBaseSchema = Quiz.pick({
  description: true,
  randomizeOrder: true,
  validation: true,
}).extend({
  title: z.string().min(1, errorMessage('Question').required),
});

// Choice type: requires options[] + targetId (new schema format)
const QuizChoiceSchema = QuizBaseSchema.extend({
  type: z.literal('choice'),
  options: z.array(QuizOptionFormSchema).min(2, errorMessage('Answer options').minCount(2)),
  targetId: z.string().min(1, 'Select the correct answer'),
});

// Input type: requires target.text as the answer
// Options are ignored (may exist from switching types, but not validated)
const QuizInputSchema = QuizBaseSchema.extend({
  type: z.literal('input'),
  target: z.object({
    id: z.string(),
    text: z.string().min(1, errorMessage('Correct answer').required),
  }),
  options: z.array(z.object({ id: z.string(), text: z.string() })).optional(),
  targetId: z.string().optional(),
});

export const QuizFormSchema = z.discriminatedUnion('type', [QuizChoiceSchema, QuizInputSchema]);
