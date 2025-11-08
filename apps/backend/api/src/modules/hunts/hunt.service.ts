import { Hunt, HuntCreate } from '@hunthub/shared';
import { inject, injectable } from 'inversify';
import { ClientSession, HydratedDocument, Types } from 'mongoose';
import HuntModel from '@/database/models/Hunt';
import HuntVersionModel from '@/database/models/HuntVersion';
import StepModel from '@/database/models/Step';
import { IHunt } from '@/database/types/Hunt';
import { HuntMapper } from '@/shared/mappers';
import { NotFoundError } from '@/shared/errors';
import { ValidationError } from '@/shared/errors';
import { ConflictError } from '@/shared/errors/ConflictError';
import { TYPES } from '@/shared/types';
import { IAuthorizationService } from '@/services/authorization/authorization.service';
import { HuntAccessModel } from '@/database/models';
import { HuntPermission } from '@/database/types';
import { withTransaction } from '@/shared/utils/transaction';

export interface IHuntService {
  createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt>;
  getUserHunts(userId: string): Promise<Hunt[]>;
  getHuntById(huntId: number): Promise<Hunt>;
  getUserHuntById(huntId: number, userId: string): Promise<Hunt>;
  updateHunt(huntId: number, huntData: Hunt, userId: string): Promise<Hunt>;
  deleteHunt(huntId: number, userId: string): Promise<void>;
  reorderSteps(huntId: number, stepOrder: number[], userId: string): Promise<Hunt>;
  addStepToVersion(huntId: number, huntVersion: number, stepId: number, session?: ClientSession): Promise<void>;
  removeStepFromVersion(huntId: number, huntVersion: number, stepId: number, session?: ClientSession): Promise<void>;
}

@injectable()
export class HuntService implements IHuntService {
  constructor(@inject(TYPES.AuthorizationService) private authService: IAuthorizationService) {}

  private async fetchHuntWithVersion(huntDoc: HydratedDocument<IHunt>): Promise<Hunt | null> {
    const versionDoc = await HuntVersionModel.findDraftByVersion(huntDoc.huntId, huntDoc.latestVersion);

    if (!versionDoc) {
      return null;
    }

    return HuntMapper.fromDocuments(huntDoc, versionDoc);
  }

  async createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt> {
    return withTransaction(async (session) => {
      const huntData = HuntMapper.toHuntDocument(creatorId);
      const [createdHunt] = await HuntModel.create([huntData], { session });

      const versionData = HuntMapper.toVersionDocument(hunt, createdHunt.huntId, 1);
      const [createdVersion] = await HuntVersionModel.create([versionData], { session });

      return HuntMapper.fromDocuments(createdHunt, createdVersion);
    });
  }

  async getUserHunts(userId: string): Promise<Hunt[]> {
    const [ownedHuntIds, sharedAccess] = await Promise.all([
      HuntModel.find({ creatorId: userId, isDeleted: false }).select('huntId').lean().exec(),
      HuntAccessModel.find({ sharedWithId: userId }).select('huntId permission').lean().exec(),
    ]);

    const permissionMap = new Map<number, HuntPermission | 'owner'>();

    ownedHuntIds.forEach((hunt) => {
      permissionMap.set(hunt.huntId, 'owner');
    });
    sharedAccess.forEach((shareHunt) => {
      if (!permissionMap.has(shareHunt.huntId)) {
        permissionMap.set(shareHunt.huntId, shareHunt.permission);
      }
    });

    const allHuntIds = [...ownedHuntIds.map((h) => h.huntId), ...sharedAccess.map((s) => s.huntId)];

    const hundDocs = await HuntModel.findHuntsByIds(allHuntIds);

    const huntsOrNull = await Promise.all(
      hundDocs.map(async (doc) => {
        const permission = permissionMap.get(doc.huntId);
        if (!permission) {
          return null;
        }

        const huntDTO = await this.fetchHuntWithVersion(doc);
        if (!huntDTO) {
          return null;
        }

        return {
          ...huntDTO,
          permission,
        } as Hunt;
      }),
    );

    return huntsOrNull.filter((hunt): hunt is Hunt => hunt !== null);
  }

  async getHuntById(huntId: number): Promise<Hunt> {
    const huntDoc = await HuntModel.findOne({ huntId }).exec();
    if (!huntDoc) {
      throw new NotFoundError();
    }

    const versionDoc = await HuntVersionModel.findDraftByVersion(huntDoc.huntId, huntDoc.latestVersion);
    if (!versionDoc) {
      throw new NotFoundError();
    }

    return HuntMapper.fromDocuments(huntDoc, versionDoc);
  }

  async getUserHuntById(huntId: number, userId: string): Promise<Hunt> {
    const { huntDoc, permission } = await this.authService.requireAccess(huntId, userId, 'view');

    const versionDoc = await HuntVersionModel.findDraftByVersion(huntDoc.huntId, huntDoc.latestVersion);
    if (!versionDoc) {
      throw new NotFoundError();
    }

    const hunt = HuntMapper.fromDocuments(huntDoc, versionDoc);
    return {
      ...hunt,
      permission,
    };
  }

  async updateHunt(huntId: number, huntData: Hunt, userId: string): Promise<Hunt> {
    const { huntDoc } = await this.authService.requireAccess(huntId, userId, 'admin');
    const huntUpdateData = HuntMapper.toVersionUpdate(huntData);

    return withTransaction(async (session) => {
      const updatedVersionDoc = await HuntVersionModel.findOneAndUpdate(
        {
          huntId: huntDoc.huntId,
          version: huntDoc.latestVersion,
          isPublished: false,
          ...(huntData.updatedAt && { updatedAt: new Date(huntData.updatedAt) }),
        },
        huntUpdateData,
        { new: true, session },
      ).exec();

      if (!updatedVersionDoc) {
        const versionDoc = await HuntVersionModel.findOne({
          huntId: huntDoc.huntId,
          version: huntDoc.latestVersion,
        }).session(session);

        if (!versionDoc) {
          throw new NotFoundError('Hunt version not found');
        }

        if (versionDoc.isPublished) {
          throw new ValidationError(
            'Cannot edit published version. Please create a new version or unpublish first.',
            [],
          );
        }

        if (huntData.updatedAt) {
          throw new ConflictError('Hunt was modified by another user. Please refresh and try again.');
        }

        throw new Error('Update failed for unknown reason');
      }

      return HuntMapper.fromDocuments(huntDoc, updatedVersionDoc);
    });
  }

  async deleteHunt(huntId: number, userId: string): Promise<void> {
    const { huntDoc: existingHunt } = await this.authService.requireAccess(huntId, userId, 'owner');
    if (!existingHunt) {
      throw new NotFoundError();
    }

    await withTransaction(async (session) => {
      const result = await HuntModel.findOneAndUpdate(
        {
          huntId,
          creatorId: new Types.ObjectId(userId),
          liveVersion: null,
          isDeleted: false,
        },
        {
          isDeleted: true,
          deletedAt: new Date(),
        },
        { new: true, session },
      );

      if (!result) {
        throw new ConflictError('Cannot delete hunt: it may be live or was modified by another operation.');
      }

      await HuntVersionModel.deleteMany({ huntId }, { session });
      await StepModel.deleteMany({ huntId }, { session });
    });
  }

  async reorderSteps(huntId: number, stepOrder: number[], userId: string): Promise<Hunt> {
    const { huntDoc } = await this.authService.requireAccess(huntId, userId, 'admin');
    if (!huntDoc) {
      throw new NotFoundError();
    }

    const stepsCount = await StepModel.countDocuments({
      stepId: { $in: stepOrder },
      huntId: huntId,
      huntVersion: huntDoc.latestVersion, // Ensure steps are from the draft version
    });

    if (stepsCount !== stepOrder.length) {
      throw new ValidationError('Invalid step IDs: some steps do not belong to this hunt version', []);
    }

    // Update stepOrder in draft HuntVersion
    const versionDoc = await HuntVersionModel.findOneAndUpdate(
      { huntId: huntDoc.huntId, version: huntDoc.latestVersion, isPublished: false },
      { stepOrder },
      { new: true },
    ).exec();

    if (!versionDoc) {
      throw new NotFoundError();
    }

    return HuntMapper.fromDocuments(huntDoc, versionDoc);
  }

  async addStepToVersion(huntId: number, huntVersion: number, stepId: number, session?: ClientSession): Promise<void> {
    await HuntVersionModel.findOneAndUpdate(
      { huntId, version: huntVersion, isPublished: false },
      { $push: { stepOrder: stepId } },
      { session },
    ).exec();
  }

  async removeStepFromVersion(
    huntId: number,
    huntVersion: number,
    stepId: number,
    session?: ClientSession,
  ): Promise<void> {
    await HuntVersionModel.findOneAndUpdate(
      { huntId, version: huntVersion, isPublished: false },
      { $pull: { stepOrder: stepId } },
      { session },
    ).exec();
  }
}
