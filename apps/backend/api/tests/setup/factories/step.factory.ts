import { faker } from '@faker-js/faker';
import StepModel from '@/database/models/Step';
import HuntVersionModel from '@/database/models/HuntVersion';
import { IStep } from '@/database/types/Step';
import { ChallengeType } from '@hunthub/shared';

export interface CreateStepOptions {
  huntId?: number;
  huntVersion?: number;
  type?: ChallengeType;
  challenge?: any;
  hint?: string;
  timeLimit?: number;
  maxAttempts?: number;
}

export const createTestStep = async (options: CreateStepOptions = {}): Promise<IStep> => {
  const stepData = {
    huntId: options.huntId || 1000, // Default huntId
    huntVersion: options.huntVersion || 1, // Default version
    type: options.type || ChallengeType.Clue,
    challenge: options.challenge || {
      clue: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
      },
    },
    hint: options.hint,
    timeLimit: options.timeLimit,
    maxAttempts: options.maxAttempts,
  };

  const step = await StepModel.create(stepData);

  // FIX: Add step to HuntVersion's stepOrder array
  // REASON: Publishing validation checks if stepOrder is not empty.
  // This mimics what StepService.createStep() does in production.
  await HuntVersionModel.findOneAndUpdate(
    { huntId: stepData.huntId, version: stepData.huntVersion },
    { $push: { stepOrder: step.stepId } },
  );

  return step.toJSON() as IStep;
};

export const createTestSteps = async (
  count: number,
  options: CreateStepOptions = {},
): Promise<IStep[]> => {
  const steps: IStep[] = [];

  for (let i = 0; i < count; i++) {
    const step = await createTestStep(options);
    steps.push(step);
  }

  return steps;
};

export const generateStepData = (options: CreateStepOptions = {}): Partial<IStep> => {
  return {
    type: options.type || ChallengeType.Clue,
    challenge: options.challenge || {
      clue: {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
      },
    },
    hint: options.hint,
    timeLimit: options.timeLimit,
    maxAttempts: options.maxAttempts,
  };
};
