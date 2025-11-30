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

  // Add step to HuntVersion's stepOrder array. This mimics what StepService.createStep() does in production.
  const updated = await HuntVersionModel.findOneAndUpdate(
    { huntId: stepData.huntId, version: stepData.huntVersion },
    { $push: { stepOrder: step.stepId } },
  );

  if (!updated) {
    throw new Error(`HuntVersion not found for huntId=${stepData.huntId}, version=${stepData.huntVersion}`);
  }

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

/**
 * Generate step data with a media attachment (image)
 * Useful for testing asset usage tracking
 *
 * @param assetId - Asset._id (ObjectId string) to reference in media
 */
export const generateStepDataWithMedia = (assetId: string): Partial<IStep> => ({
  type: ChallengeType.Clue,
  challenge: {
    clue: {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
    },
  },
  media: {
    type: 'image',
    content: {
      image: {
        assetId,
        title: 'Test image',
        alt: 'Test image alt text',
      },
    },
  },
});
