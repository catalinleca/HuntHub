import { injectable, inject } from 'inversify';
import { HuntPermission } from '@hunthub/shared';
import { TYPES } from '@/shared/types';
import { IAuthorizationService } from '@/services/authorization/authorization.service';
import { IHuntService } from '@/modules/hunts/hunt.service';
import { IStepService } from '@/modules/steps/step.service';
import { IAssetUsageTracker } from '@/services/asset-usage/asset-usage-tracker.service';
import { NotFoundError } from '@/shared/errors';
import { withTransaction } from '@/shared/utils/transaction';
import HuntVersionModel from '@/database/models/HuntVersion';

export interface CloneResult {
  huntId: number;
  clonedFromHuntId: number;
  clonedFromVersion: number;
  clonedAt: string;
}

export interface ICloneService {
  cloneHunt(sourceHuntId: number, userId: string, version?: number): Promise<CloneResult>;
}

@injectable()
export class CloneService implements ICloneService {
  constructor(
    @inject(TYPES.AuthorizationService) private authService: IAuthorizationService,
    @inject(TYPES.HuntService) private huntService: IHuntService,
    @inject(TYPES.StepService) private stepService: IStepService,
    @inject(TYPES.AssetUsageTracker) private usageTracker: IAssetUsageTracker,
  ) {}

  async cloneHunt(sourceHuntId: number, userId: string, version?: number): Promise<CloneResult> {
    const { huntDoc } = await this.authService.requireAccess(sourceHuntId, userId, HuntPermission.View);

    const sourceVersion = version ?? huntDoc.latestVersion;

    if (version !== undefined) {
      const versionExists = await HuntVersionModel.exists({
        huntId: sourceHuntId,
        version,
      });
      if (!versionExists) {
        throw new NotFoundError(`Version ${version} not found`);
      }
    }

    const sourceVersionDoc = await HuntVersionModel.findOne({
      huntId: sourceHuntId,
      version: sourceVersion,
    });

    return withTransaction(async (session) => {
      const { huntDoc: newHuntDoc } = await this.huntService.cloneHuntAndVersion(
        sourceHuntId,
        sourceVersion,
        userId,
        session,
      );

      const newStepIds = await this.stepService.cloneSteps(
        sourceHuntId,
        sourceVersion,
        newHuntDoc.huntId,
        1,
        sourceVersionDoc?.stepOrder ?? [],
        session,
      );

      if (newStepIds.length > 0) {
        await HuntVersionModel.updateOne(
          { huntId: newHuntDoc.huntId, version: 1 },
          { stepOrder: newStepIds },
          { session },
        );
      }

      await this.usageTracker.rebuildHuntAssetUsage(newHuntDoc.huntId, session);

      return {
        huntId: newHuntDoc.huntId,
        clonedFromHuntId: sourceHuntId,
        clonedFromVersion: sourceVersion,
        clonedAt: new Date().toISOString(),
      };
    });
  }
}
