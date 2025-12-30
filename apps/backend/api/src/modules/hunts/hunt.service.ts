import { Hunt, HuntCreate } from '@hunthub/shared';
import { inject, injectable } from 'inversify';
import { ClientSession, Types } from 'mongoose';
import HuntModel from '@/database/models/Hunt';
import HuntVersionModel from '@/database/models/HuntVersion';
import StepModel from '@/database/models/Step';
import AssetUsageModel from '@/database/models/AssetUsage';
import { HuntMapper, StepMapper } from '@/shared/mappers';
import { NotFoundError } from '@/shared/errors';
import { ValidationError } from '@/shared/errors';
import { ConflictError } from '@/shared/errors/ConflictError';
import { TYPES } from '@/shared/types';
import { IAuthorizationService } from '@/services/authorization/authorization.service';
import { HuntAccessModel } from '@/database/models';
import { HuntPermission } from '@/database/types';
import { withTransaction } from '@/shared/utils/transaction';
import {
  PaginationParams,
  PaginatedResponse,
  buildPaginationMeta,
  calculateSkip,
  buildSortObject,
} from '@/shared/utils/pagination';

export interface IHuntService {
  createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt>;
  getUserHunts(userId: string, pagination: PaginationParams): Promise<PaginatedResponse<Hunt>>;
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

  async createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt> {
    return withTransaction(async (session) => {
      const huntData = HuntMapper.toHuntDocument(creatorId);
      const [createdHunt] = await HuntModel.create([huntData], { session });

      const versionData = HuntMapper.toVersionDocument(hunt, createdHunt.huntId, 1);
      const [createdVersion] = await HuntVersionModel.create([versionData], { session });

      return HuntMapper.fromDocuments(createdHunt, createdVersion);
    });
  }

  async getUserHunts(userId: string, pagination: PaginationParams): Promise<PaginatedResponse<Hunt>> {
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
    const total = allHuntIds.length;

    const skip = calculateSkip(pagination.page, pagination.limit);
    const sortObject = buildSortObject(pagination.sortBy, pagination.sortOrder);

    const huntDocs = await HuntModel.find({ huntId: { $in: allHuntIds }, isDeleted: false })
      .sort(sortObject)
      .skip(skip)
      .limit(pagination.limit)
      .exec();

    const huntVersionIds = huntDocs.map((doc) => ({ huntId: doc.huntId, version: doc.latestVersion }));

    const versionDocs = await HuntVersionModel.find({
      $or: huntVersionIds.map(({ huntId, version }) => ({ huntId, version })),
    }).exec();

    const versionMap = new Map<number, (typeof versionDocs)[0]>();
    versionDocs.forEach((vDoc) => {
      versionMap.set(vDoc.huntId, vDoc);
    });

    const hunts = huntDocs
      .map((doc) => {
        const permission = permissionMap.get(doc.huntId);
        const versionDoc = versionMap.get(doc.huntId);

        if (!permission || !versionDoc) {
          return null;
        }

        const huntDTO = HuntMapper.fromDocuments(doc, versionDoc);
        return {
          ...huntDTO,
          permission,
        } as Hunt;
      })
      .filter((hunt): hunt is Hunt => hunt !== null);

    const paginationMeta = buildPaginationMeta(total, pagination.page, pagination.limit);

    return {
      data: hunts,
      pagination: paginationMeta,
    };
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

    const stepDocs = await StepModel.find({
      huntId: huntDoc.huntId,
      huntVersion: huntDoc.latestVersion,
    }).exec();

    // Reorder steps according to stepOrder from version document
    const stepMap = new Map(stepDocs.map((doc) => [doc.stepId, doc]));
    const orderedSteps = (versionDoc.stepOrder || [])
      .map((stepId) => stepMap.get(stepId))
      .filter((doc) => doc != null);

    const hunt = HuntMapper.fromDocuments(huntDoc, versionDoc);
    return {
      ...hunt,
      steps: StepMapper.fromDocuments(orderedSteps),
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
      // Clean up asset usage (fixes cascade delete bug - no orphan records)
      await AssetUsageModel.deleteMany({ huntId }, { session });
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
    const versionDoc = await HuntVersionModel.findOneAndUpdate(
      { huntId, version: huntVersion, isPublished: false },
      { $push: { stepOrder: stepId } },
      { session },
    ).exec();

    if (!versionDoc) {
      throw new ValidationError('Cannot modify steps on a published or missing draft version.', []);
    }
  }

  async removeStepFromVersion(
    huntId: number,
    huntVersion: number,
    stepId: number,
    session?: ClientSession,
  ): Promise<void> {
    const versionDoc = await HuntVersionModel.findOneAndUpdate(
      { huntId, version: huntVersion, isPublished: false },
      { $pull: { stepOrder: stepId } },
      { session },
    ).exec();

    if (!versionDoc) {
      throw new ValidationError('Cannot modify steps on a published or missing draft version.', []);
    }
  }
}
