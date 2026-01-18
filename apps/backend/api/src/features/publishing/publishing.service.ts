import { injectable, inject } from 'inversify';
import { ClientSession, HydratedDocument } from 'mongoose';
import {
  PublishResult,
  ReleaseResult,
  TakeOfflineResult,
  HuntPermission,
  VersionHistoryResponse,
} from '@hunthub/shared';
import HuntVersionModel from '@/database/models/HuntVersion';
import StepModel from '@/database/models/Step';
import { IHuntVersion } from '@/database/types/HuntVersion';
import { HuntMapper } from '@/shared/mappers';
import { IHuntService } from '@/modules/hunts/hunt.service';
import { TYPES } from '@/shared/types';
import { ValidationError, DataIntegrityError } from '@/shared/errors';
import { VersionValidator } from '@/features/publishing/helpers/version-validator.helper';
import { StepCloner } from '@/features/publishing/helpers/step-cloner.helper';
import { VersionPublisher } from '@/features/publishing/helpers/version-publisher.helper';
import { ReleaseManager } from '@/features/publishing/helpers/release-manager.helper';
import { IAuthorizationService } from '@/services/authorization/authorization.service';
import { withTransaction } from '@/shared/utils/transaction';

const MAX_PUBLISHED_VERSIONS = 10;

export interface IPublishingService {
  publishHunt(huntId: number, userId: string): Promise<PublishResult>;
  releaseHunt(
    huntId: number,
    version: number | undefined,
    userId: string,
    currentLiveVersion: number | null | undefined,
  ): Promise<ReleaseResult>;
  takeOffline(huntId: number, userId: string, currentLiveVersion: number): Promise<TakeOfflineResult>;
  getVersionHistory(huntId: number, userId: string): Promise<VersionHistoryResponse>;
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
  constructor(
    @inject(TYPES.HuntService) private huntService: IHuntService,
    @inject(TYPES.AuthorizationService) private authService: IAuthorizationService,
  ) {}

  async publishHunt(huntId: number, userId: string): Promise<PublishResult> {
    const { huntDoc } = await this.authService.requireAccess(huntId, userId, HuntPermission.Admin);

    return withTransaction(async (session) => {
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

      await this.createNewDraftVersion(currentVersionDoc, huntDoc.huntId, newVersion, session);

      const publishedAt = await VersionPublisher.markVersionPublished(
        huntId,
        currentVersion,
        userId,
        versionUpdatedAt,
        session,
      );

      await VersionPublisher.updateHuntPointers(huntId, currentVersion, newVersion, session);

      // Prune old versions if exceeding cap (never prune the live version)
      await this.pruneOldVersions(huntId, huntDoc.liveVersion, session);

      return {
        publishedVersion: currentVersion,
        newDraftVersion: newVersion,
        publishedAt: publishedAt.toISOString(),
      };
    });
  }

  async releaseHunt(
    huntId: number,
    version: number | undefined,
    userId: string,
    currentLiveVersion: number | null | undefined,
  ): Promise<ReleaseResult> {
    const { huntDoc } = await this.authService.requireAccess(huntId, userId, HuntPermission.Admin);
    const previousLiveVersion = huntDoc.liveVersion;

    return withTransaction(async (session) => {
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
  }

  async takeOffline(huntId: number, userId: string, currentLiveVersion: number): Promise<TakeOfflineResult> {
    const { huntDoc } = await this.authService.requireAccess(huntId, userId, HuntPermission.Admin);

    if (huntDoc.liveVersion === null) {
      throw new ValidationError('Hunt is not currently live', []);
    }

    const previousLiveVersion = huntDoc.liveVersion;

    return withTransaction(async (session) => {
      await ReleaseManager.takeOffline(huntDoc.huntId, currentLiveVersion, session);

      return {
        huntId: huntDoc.huntId,
        previousLiveVersion,
        takenOfflineAt: new Date().toISOString(),
      };
    });
  }

  async getVersionHistory(huntId: number, userId: string): Promise<VersionHistoryResponse> {
    await this.authService.requireAccess(huntId, userId, HuntPermission.View);

    const versions = await HuntVersionModel.find({ huntId, isPublished: true })
      .sort({ version: -1 })
      .select('version publishedAt')
      .lean();

    if (versions.length === 0) {
      return { versions: [] };
    }

    const versionNumbers = versions.map((v) => v.version);

    const stepCounts = await StepModel.aggregate<{ _id: number; count: number }>([
      { $match: { huntId, huntVersion: { $in: versionNumbers } } },
      { $group: { _id: '$huntVersion', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(stepCounts.map((s) => [s._id, s.count]));

    return {
      versions: versions.map((v) => {
        if (!v.publishedAt) {
          throw new DataIntegrityError(`huntId=${huntId} version=${v.version} is published but has no publishedAt`);
        }

        return {
          version: v.version,
          publishedAt: v.publishedAt.toISOString(),
          stepCount: countMap.get(v.version) ?? 0,
        };
      }),
    };
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

  private async pruneOldVersions(huntId: number, liveVersion: number | null, session: ClientSession): Promise<void> {
    const versionsToDelete = await HuntVersionModel.find({ huntId, isPublished: true })
      .sort({ version: -1 })
      .skip(MAX_PUBLISHED_VERSIONS)
      .select('version')
      .session(session)
      .lean();

    if (versionsToDelete.length === 0) {
      return;
    }

    // Never delete the currently live version
    const versionNumbers = versionsToDelete.map((v) => v.version).filter((v) => v !== liveVersion);

    if (versionNumbers.length === 0) {
      return;
    }

    await HuntVersionModel.deleteMany({ huntId, version: { $in: versionNumbers } }).session(session);
    await StepModel.deleteMany({ huntId, huntVersion: { $in: versionNumbers } }).session(session);
  }
}
