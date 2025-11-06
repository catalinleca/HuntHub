import { Hunt, HuntCreate } from '@hunthub/shared';
import { injectable } from 'inversify';
import mongoose, { ClientSession, HydratedDocument, Types } from 'mongoose';
import HuntModel from '@/database/models/Hunt';
import HuntVersionModel from '@/database/models/HuntVersion';
import StepModel from '@/database/models/Step';
import { IHunt } from '@/database/types/Hunt';
import { HuntMapper } from '@/shared/mappers';
import { NotFoundError, ForbiddenError } from '@/shared/errors';
import { ValidationError } from '@/shared/errors';
import { ConflictError } from '@/shared/errors/ConflictError';

export interface IHuntService {
  createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt>;
  getAllHunts(): Promise<Hunt[]>;
  getUserHunts(userId: string): Promise<Hunt[]>;
  getHuntById(huntId: number): Promise<Hunt>;
  getUserHuntById(huntId: number, userId: string): Promise<Hunt>;
  updateHunt(huntId: number, huntData: Hunt, userId: string): Promise<Hunt>;
  deleteHunt(huntId: number, userId: string): Promise<void>;
  reorderSteps(huntId: number, stepOrder: number[], userId: string): Promise<Hunt>;
  verifyOwnership(huntId: number, userId: string): Promise<HydratedDocument<IHunt>>;
  addStepToVersion(huntId: number, huntVersion: number, stepId: number, session?: ClientSession): Promise<void>;
  removeStepFromVersion(huntId: number, huntVersion: number, stepId: number, session?: ClientSession): Promise<void>;
}

@injectable()
export class HuntService implements IHuntService {
  /**
   * Private helper: Fetch Hunt + HuntVersion and merge into DTO
   * Returns null if the version not found (data integrity issue)
   */
  private async fetchHuntWithVersion(huntDoc: HydratedDocument<IHunt>): Promise<Hunt | null> {
    const versionDoc = await HuntVersionModel.findDraftByVersion(huntDoc.huntId, huntDoc.latestVersion);

    if (!versionDoc) {
      return null; // Skip hunts without versions
    }

    return HuntMapper.fromDocuments(huntDoc, versionDoc);
  }

  async createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt> {
    const session = await mongoose.startSession();

    try {
      return session.withTransaction(async () => {
        const huntData = HuntMapper.toHuntDocument(creatorId);
        const [createdHunt] = await HuntModel.create([huntData], { session });

        // Create first HuntVersion (v1) using mapper
        const versionData = HuntMapper.toVersionDocument(hunt, createdHunt.huntId, 1);
        const [createdVersion] = await HuntVersionModel.create([versionData], { session });

        return HuntMapper.fromDocuments(createdHunt, createdVersion);
      });
    } finally {
      await session.endSession();
    }
  }

  async getAllHunts(): Promise<Hunt[]> {
    const huntDocs = await HuntModel.find().exec();

    const huntsOrNull = await Promise.all(huntDocs.map((doc) => this.fetchHuntWithVersion(doc)));

    return huntsOrNull.filter((hunt): hunt is Hunt => hunt !== null);
  }

  async getUserHunts(userId: string): Promise<Hunt[]> {
    const huntDocs = await HuntModel.findUserHunts(userId);

    const huntsOrNull = await Promise.all(huntDocs.map((doc) => this.fetchHuntWithVersion(doc)));

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
    const huntDoc = await HuntModel.findByHuntIdAndCreator(huntId, userId);
    if (!huntDoc) {
      throw new NotFoundError();
    }

    const versionDoc = await HuntVersionModel.findDraftByVersion(huntDoc.huntId, huntDoc.latestVersion);
    if (!versionDoc) {
      throw new NotFoundError();
    }

    return HuntMapper.fromDocuments(huntDoc, versionDoc);
  }

  async updateHunt(huntId: number, huntData: Hunt, userId: string): Promise<Hunt> {
    const huntDoc = await this.verifyOwnership(huntId, userId);
    const huntUpdateData = HuntMapper.toVersionUpdate(huntData);

    const session = await mongoose.startSession();

    try {
      return session.withTransaction(async () => {
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
    } finally {
      await session.endSession();
    }
  }

  async deleteHunt(huntId: number, userId: string): Promise<void> {
    const existingHunt = await HuntModel.findByHuntIdAndCreator(huntId, userId);
    if (!existingHunt) {
      throw new NotFoundError();
    }

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
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
    } finally {
      await session.endSession();
    }
  }

  async reorderSteps(huntId: number, stepOrder: number[], userId: string): Promise<Hunt> {
    const huntDoc = await HuntModel.findByHuntIdAndCreator(huntId, userId);
    if (!huntDoc) {
      throw new NotFoundError();
    }

    // Validate all steps belong to this hunt AND the current draft version
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

  async verifyOwnership(huntId: number, userId: string): Promise<HydratedDocument<IHunt>> {
    const huntDoc = await HuntModel.findOne({ huntId, isDeleted: false }).exec();
    if (!huntDoc) {
      throw new NotFoundError();
    }

    if (huntDoc.creatorId.toString() !== userId) {
      throw new ForbiddenError();
    }

    return huntDoc;
  }

  async addStepToVersion(huntId: number, huntVersion: number, stepId: number, session?: ClientSession): Promise<void> {
    const query = HuntVersionModel.findOneAndUpdate(
      { huntId, version: huntVersion, isPublished: false },
      { $push: { stepOrder: stepId } },
    );

    if (session) {
      await query.session(session).exec();
    } else {
      await query.exec();
    }
  }

  async removeStepFromVersion(
    huntId: number,
    huntVersion: number,
    stepId: number,
    session?: ClientSession,
  ): Promise<void> {
    const query = HuntVersionModel.findOneAndUpdate(
      { huntId, version: huntVersion, isPublished: false },
      { $pull: { stepOrder: stepId } },
    );

    if (session) {
      await query.session(session).exec();
    } else {
      await query.exec();
    }
  }
}
