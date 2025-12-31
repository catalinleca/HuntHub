import { z } from 'zod';
import { Step, Challenge } from '@hunthub/shared/schemas';
import { ClueFormSchema, QuizFormSchema, MissionFormSchema, TaskFormSchema } from './step';

const ChallengeFormSchema = Challenge.extend({
  clue: ClueFormSchema.optional(),
  quiz: QuizFormSchema.optional(),
  mission: MissionFormSchema.optional(),
  task: TaskFormSchema.optional(),
});

export const StepFormSchema = Step.omit({ stepId: true }).extend({
  stepId: z.number().int().optional(),
  challenge: ChallengeFormSchema,

  // Form-only field (UI identifier for React keys)
  formKey: z.string(),
});
