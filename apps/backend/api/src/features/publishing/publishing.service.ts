import { injectable, inject } from 'inversify';
import mongoose, { ClientSession, HydratedDocument } from 'mongoose';
import { Hunt, ReleaseResult, TakeOfflineResult } from '@hunthub/shared';
import HuntVersionModel from '@/database/models/HuntVersion';
import { IHuntVersion } from '@/database/types/HuntVersion';
import { HuntMapper } from '@/shared/mappers';
import { IHuntService } from '@/modules/hunts/hunt.service';
import { TYPES } from '@/shared/types';
import { ValidationError } from '@/shared/errors';
import { VersionValidator } from '@/features/publishing/helpers/version-validator.helper';
import { StepCloner } from '@/features/publishing/helpers/step-cloner.helper';
import { VersionPublisher } from '@/features/publishing/helpers/version-publisher.helper';
import { ReleaseManager } from '@/features/publishing/helpers/release-manager.helper';
import { IAuthorizationService } from '@/services/authorization/authorization.service';

export interface IPublishingService {
  publishHunt(huntId: number, userId: string): Promise<Hunt>;
  releaseHunt(
    huntId: number,
    version: number | undefined,
    userId: string,
    currentLiveVersion: number | null | undefined,
  ): Promise<ReleaseResult>;
  takeOffline(huntId: number, userId: string, currentLiveVersion: number): Promise<TakeOfflineResult>;
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
  constructor(@inject(TYPES.HuntService) private huntService: IHuntService,
              @inject(TYPES.AuthorizationService) private authService: IAuthorizationService,
              ) {}

  async publishHunt(huntId: number, userId: string): Promise<Hunt> {
    const { huntDoc } = await this.authService.requireAccess(huntId, userId, 'admin');

    const session = await mongoose.startSession();

    try {
      return session.withTransaction(async () => {
        const currentVersion = huntDoc.latestVersion;
        const newVersion = currentVersion + 1;

        await VersionValidator.validateCanPublish(huntId, currentVersion, session);

        const currentVersionDoc = await HuntVersionModel.findDraftByVersion(huntId, currentVersion, session);
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

  async releaseHunt(
    huntId: number,
    version: number | undefined,
    userId: string,
    currentLiveVersion: number | null | undefined,
  ): Promise<ReleaseResult> {
    const { huntDoc } = await this.authService.requireAccess(huntId, userId, 'admin');
    const previousLiveVersion = huntDoc.liveVersion;

    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        const targetVersion = version ?? (await HuntVersionModel.findLatestPublished(huntId, session))?.version;

        if (!targetVersion) {
          throw new ValidationError('No published versions available to release. Publish a version first.', []);
        }

        const publishedVersion = await HuntVersionModel.findPublishedVersion(huntId, targetVersion, session);
        if (!publishedVersion) {
          throw new ValidationError(`Version ${targetVersion} not found or not published`, []);
        }

        const updatedHunt = await ReleaseManager.releaseVersion(
          huntDoc.huntId,
          targetVersion,
          userId,
          currentLiveVersion ?? null,
          session,
        );

        if (!updatedHunt.liveVersion || !updatedHunt.releasedAt || !updatedHunt.releasedBy) {
          throw new Error('Release operation failed to set required fields');
        }

        return {
          huntId: updatedHunt.huntId,
          liveVersion: updatedHunt.liveVersion,
          previousLiveVersion,
          releasedAt: updatedHunt.releasedAt.toISOString(),
          releasedBy: updatedHunt.releasedBy,
        };
      });
    } finally {
      await session.endSession();
    }
  }

  async takeOffline(huntId: number, userId: string, currentLiveVersion: number): Promise<TakeOfflineResult> {
    const { huntDoc } = await this.authService.requireAccess(huntId, userId, 'admin');

    if (huntDoc.liveVersion === null) {
      throw new ValidationError('Hunt is not currently live', []);
    }

    const previousLiveVersion = huntDoc.liveVersion;
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        await ReleaseManager.takeOffline(huntDoc.huntId, currentLiveVersion, session);

        return {
          huntId: huntDoc.huntId,
          previousLiveVersion,
          takenOfflineAt: new Date().toISOString(),
        };
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
