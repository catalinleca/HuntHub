import { ClientSession } from 'mongoose';
import HuntVersionModel from '@/database/models/HuntVersion';
import StepModel from '@/database/models/Step';
import { ValidationError } from '@/shared/errors';

/**
 * VersionValidatorHelper - Business rule validation for publishing
 *
 * Validates that a hunt version can be published:
 * - Version exists and is draft (not already published)
 * - Hunt has at least one step
 * - stepOrder is not empty
 */
export class VersionValidator {
  static async validateCanPublish(huntId: number, version: number, session: ClientSession) {
    const huntVersionDoc = await HuntVersionModel.findOne({
      huntId,
      version,
      isPublished: false,
    }).session(session);

    if (!huntVersionDoc) {
      throw new ValidationError('Cannot publish: Version not found or already published', []);
    }

    const hasSteps = await StepModel.hasSteps(huntId, version);
    if (!hasSteps) {
      throw new ValidationError('Cannot publish hunt without steps', []);
    }

    if (huntVersionDoc.stepOrder.length === 0) {
      throw new ValidationError('Cannot publish hunt with empty step order. Please add and order your steps.', []);
    }
  }
}
