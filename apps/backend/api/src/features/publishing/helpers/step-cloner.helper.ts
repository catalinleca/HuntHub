import { ClientSession } from 'mongoose';
import StepModel from '@/database/models/Step';
import { StepMapper } from '@/shared/mappers';

/**
 * StepClonerHelper - Handles step cloning during publishing
 *
 * Clones all steps from the source version to the target version.
 * Preserves stepId but updates huntVersion.
 */

export class StepCloner {
  static async cloneSteps(huntId: number, sourceVersion: number, targetVersion: number, session: ClientSession) {
    const sourceSteps = await StepModel.findByHuntVersion(huntId, sourceVersion);

    if (sourceSteps.length === 0) {
      return;
    }

    const clonedSteps = sourceSteps.map((step) => StepMapper.toCloneDocument(step, targetVersion));

    await StepModel.insertMany(clonedSteps, { session });
  }
}
