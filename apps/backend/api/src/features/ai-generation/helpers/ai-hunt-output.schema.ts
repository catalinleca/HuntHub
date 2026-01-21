import { z } from 'zod';
import { Clue, Quiz, Mission, Task, Option, ChallengeType, OptionType, MissionType } from '@hunthub/shared/schemas';

export const AIClueSchema = Clue.required({
  title: true,
  description: true,
});

export const AIQuizSchema = Quiz.extend({
  type: OptionType,
  options: z.array(Option).nullish(),
  targetId: z.string().nullish(),
  expectedAnswer: z.string().nullish(),
}).superRefine((quiz, ctx) => {
  if (quiz.type === 'choice') {
    if (!quiz.options || quiz.options.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['options'],
        message: 'quiz-choice must have options',
      });
      return;
    }

    if (!quiz.targetId) {
      ctx.addIssue({
        code: 'custom',
        path: ['targetId'],
        message: 'quiz-choice must have targetId',
      });
      return;
    }

    const validOptionIds = quiz.options.map((o) => o.id);
    if (!validOptionIds.includes(quiz.targetId)) {
      ctx.addIssue({
        code: 'custom',
        path: ['targetId'],
        message: `targetId "${quiz.targetId}" must match one of: ${validOptionIds.join(', ')}`,
      });
    }
  }

  if (quiz.type === 'input') {
    if (!quiz.expectedAnswer || quiz.expectedAnswer.trim() === '') {
      ctx.addIssue({
        code: 'custom',
        path: ['expectedAnswer'],
        message: 'quiz-input must have non-empty expectedAnswer',
      });
    }
  }
});

export const AIMissionSchema = Mission.extend({
  type: MissionType,
}).superRefine((mission, ctx) => {
  if (mission.type === 'match-location') {
    ctx.addIssue({
      code: 'custom',
      path: ['type'],
      message: 'mission type "match-location" is not allowed for AI generation',
    });
  }
});

export const AITaskSchema = Task.superRefine((task, ctx) => {
  if (!task.instructions || task.instructions.trim() === '') {
    ctx.addIssue({
      code: 'custom',
      path: ['instructions'],
      message: 'task must have non-empty instructions',
    });
  }
});

export const AIChallengeSchema = z
  .object({
    clue: AIClueSchema.nullish(),
    quiz: AIQuizSchema.nullish(),
    mission: AIMissionSchema.nullish(),
    task: AITaskSchema.nullish(),
  })
  .strict();

export const AIStepSchema = z
  .object({
    type: ChallengeType,
    challenge: AIChallengeSchema,
    hint: z.string().nullish(),
  })
  .superRefine((step, ctx) => {
    const challengeData = step.challenge[step.type];
    if (!challengeData) {
      ctx.addIssue({
        code: 'custom',
        path: ['challenge', step.type],
        message: `challenge.${step.type} is required when type is "${step.type}"`,
      });
    }
  });

export const AIHuntSchema = z.object({
  name: z.string().min(1, 'name is required'),
  description: z.string().nullish(),
  steps: z.array(AIStepSchema).min(1, 'hunt must have at least one step'),
});

export type AIGeneratedHunt = z.infer<typeof AIHuntSchema>;
export type AIGeneratedStep = z.infer<typeof AIStepSchema>;
export type AIGeneratedChallenge = z.infer<typeof AIChallengeSchema>;
