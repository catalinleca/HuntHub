import { z } from 'zod';
import {
  challengeTypeSchema,
  clueSchema,
  missionSchema,
  quizSchema,
  taskSchema,
  locationSchema,
} from '@/utils/validation/zodies';

export const strictChallengeSchema = z.object({
  challenge: z.union([
    z.object({ clue: clueSchema }).strict(),
    z.object({ quiz: quizSchema }).strict(),
    z.object({ mission: missionSchema }).strict(),
    z.object({ task: taskSchema }).strict(),
  ]),
});

export const strictStepCreateSchema = z
  .object({
    type: challengeTypeSchema,
    challenge: strictChallengeSchema.shape.challenge,
    requiredLocation: locationSchema.optional(),
    hint: z.string().optional(),
    timeLimit: z.number().optional(),
    maxAttempts: z.number().optional(),
  })
  .refine(
    (data: any) => {
      const challengeKey = Object.keys(data.challenge)[0];
      return challengeKey === data.type;
    },
    {
      message: 'Challenge type must match the challenge field name',
      path: ['challenge'],
    },
  );

export const createStepParamsSchema = z.object({
  huntId: z.string(),
});
