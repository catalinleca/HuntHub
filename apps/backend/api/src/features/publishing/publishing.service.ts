import { injectable, inject } from 'inversify';
import mongoose, { ClientSession, HydratedDocument } from 'mongoose';
import { Hunt } from '@hunthub/shared';
import HuntVersionModel from '@/database/models/HuntVersion';
import { IHunt } from '@/database/types/Hunt';
import { IHuntVersion } from '@/database/types/HuntVersion';
import { HuntMapper } from '@/shared/mappers';
import { IHuntService } from '@/modules/hunts/hunt.service';
import { TYPES } from '@/shared/types';
import { VersionValidator } from '@/features/publishing/helpers/version-validator.helper';
import { StepCloner } from '@/features/publishing/helpers/step-cloner.helper';
import { VersionPublisher } from '@/features/publishing/helpers/version-publisher.helper';

export interface IPublishingService {
  publishHunt(huntId: number, userId: string): Promise<Hunt>;
}

/**
 * PublishingService - Orchestrates hunt publishing workflow
 *
 * Responsibilities:
 * - Coordinates publishing across Hunt, HuntVersion, and Step models
 * - Ensures atomic operations via transactions
 * - Handles concurrent publishing attempts with optimistic locking
 *
 * Publishing Workflow:
 * 1. Verify ownership (fail fast)
 * 2. Start transaction
 * 3. PHASE 1 (PREPARE): Validate, clone steps, create new draft
 * 4. PHASE 2 (COMMIT): Mark published, update pointers
 * 5. Return merged DTO
 */
@injectable()
export class PublishingService implements IPublishingService {
  constructor(@inject(TYPES.HuntService) private huntService: IHuntService) {}

  async publishHunt(huntId: number, userId: string): Promise<Hunt> {
    const huntDoc = await this.huntService.verifyOwnership(huntId, userId);

    const session = await mongoose.startSession();

    try {
      return session.withTransaction(async () => {
        const currentVersion = huntDoc.latestVersion;
        const newVersion = currentVersion + 1;

        await VersionValidator.validateCanPublish(huntId, currentVersion, session);

        const currentVersionDoc = await HuntVersionModel.findDraftByVersion(huntId, currentVersion);
        if (!currentVersionDoc) {
          throw new Error('Current version not found');
        }

        const versionUpdatedAt = currentVersionDoc.updatedAt;
        if (!versionUpdatedAt) {
          throw new Error('Version updatedAt not found');
        }

        await StepCloner.cloneSteps(huntId, currentVersion, newVersion, session);

        const newVersionDoc = await this.createNewDraftVersion(currentVersionDoc, huntDoc.huntId, newVersion, session);

        await VersionPublisher.markVersionPublished(huntId, currentVersion, userId, versionUpdatedAt, session);

        const updatedHunt = await VersionPublisher.updateHuntPointers(huntId, currentVersion, newVersion, session);

        return HuntMapper.fromDocuments(updatedHunt, newVersionDoc);
      });
    } finally {
      await session.endSession();
    }
  }

  private async createNewDraftVersion(
    currentVersionDoc: HydratedDocument<IHuntVersion>,
    huntId: number,
    newVersion: number,
    session: ClientSession,
  ): Promise<HydratedDocument<IHuntVersion>> {
    const newVersionData = HuntMapper.toCloneDocument(currentVersionDoc, huntId, newVersion);

    const [createdVersion] = await HuntVersionModel.create([newVersionData], { session });

    return createdVersion;
  }
}
