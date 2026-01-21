import { z } from 'zod';
import { Step, Challenge } from '@hunthub/shared/schemas';
import { ClueFormSchema, QuizFormSchema, MissionFormSchema, TaskFormSchema } from './step';

const ChallengeFormSchema = Challenge.extend({
  clue: ClueFormSchema.nullish(),
  quiz: QuizFormSchema.nullish(),
  mission: MissionFormSchema.nullish(),
  task: TaskFormSchema.nullish(),
});

// Form-specific location schema: allows null/undefined for disabled state or partial data
const LocationFormSchema = z
  .object({
    lat: z.number().nullish(),
    lng: z.number().nullish(),
    radius: z.number().nullish(),
    address: z.string().nullish(),
  })
  .nullish();

export const StepFormSchema = Step.omit({ stepId: true }).extend({
  stepId: z.number().int().optional(),
  challenge: ChallengeFormSchema,
  formKey: z.string(),
  requiredLocation: LocationFormSchema,
});
