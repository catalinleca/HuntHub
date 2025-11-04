import { Hunt, HuntCreate, HuntUpdate } from '@hunthub/shared';
import { injectable } from 'inversify';
import { HydratedDocument } from 'mongoose';
import HuntModel from '@/database/models/Hunt';
import HuntVersionModel from '@/database/models/HuntVersion';
import StepModel from '@/database/models/Step';
import { IHunt } from '@/database/types/Hunt';
import { HuntMapper } from '@/shared/mappers';
import { NotFoundError, ForbiddenError } from '@/shared/errors';
import { ValidationError } from '@/shared/errors';

export interface IHuntService {
  createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt>;
  getAllHunts(): Promise<Hunt[]>;
  getUserHunts(userId: string): Promise<Hunt[]>;
  getHuntById(huntId: number): Promise<Hunt>;
  getUserHuntById(huntId: number, userId: string): Promise<Hunt>;
  updateHunt(huntId: number, huntData: HuntUpdate, userId: string): Promise<Hunt>;
  deleteHunt(huntId: number, userId: string): Promise<void>;
  reorderSteps(huntId: number, stepOrder: number[], userId: string): Promise<Hunt>;
  verifyOwnership(huntId: number, userId: string): Promise<HydratedDocument<IHunt>>;
  addStepToVersion(huntId: number, huntVersion: number, stepId: number): Promise<void>;
  removeStepFromVersion(huntId: number, huntVersion: number, stepId: number): Promise<void>;
}

@injectable()
export class HuntService implements IHuntService {
  /**
   * Private helper: Fetch Hunt + HuntVersion and merge into DTO
   * Returns null if version not found (data integrity issue)
   */
  private async fetchHuntWithVersion(huntDoc: HydratedDocument<IHunt>): Promise<Hunt | null> {
    const versionDoc = await HuntVersionModel.findDraftByVersion(huntDoc.huntId, huntDoc.latestVersion);

    if (!versionDoc) {
      return null; // Skip hunts without versions
    }

    return HuntMapper.fromDocuments(huntDoc, versionDoc);
  }

  async createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt> {
    // Create Hunt master record using mapper
    const huntData = HuntMapper.toHuntDocument(creatorId);
    const createdHunt = await HuntModel.create(huntData);

    // Create first HuntVersion (v1) using mapper
    const versionData = HuntMapper.toVersionDocument(hunt, createdHunt.huntId, 1);
    const createdVersion = await HuntVersionModel.create(versionData);

    // Return merged DTO using mapper
    return HuntMapper.fromDocuments(createdHunt, createdVersion);
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

  async updateHunt(huntId: number, huntData: HuntUpdate, userId: string): Promise<Hunt> {
    const huntDoc = await HuntModel.findByHuntIdAndCreator(huntId, userId);
    if (!huntDoc) {
      throw new NotFoundError();
    }

    // Update the draft version content using mapper
    const updateData = HuntMapper.toVersionUpdate(huntData);
    const versionDoc = await HuntVersionModel.findOneAndUpdate(
      { huntId: huntDoc.huntId, version: huntDoc.latestVersion, isPublished: false },
      updateData,
      { new: true },
    ).exec();

    if (!versionDoc) {
      throw new NotFoundError();
    }

    return HuntMapper.fromDocuments(huntDoc, versionDoc);
  }

  async deleteHunt(huntId: number, userId: string): Promise<void> {
    const existingHunt = await HuntModel.findByHuntIdAndCreator(huntId, userId);
    if (!existingHunt) {
      throw new NotFoundError();
    }

    await StepModel.deleteMany({ huntId: huntId });

    await existingHunt.deleteOne();
  }

  async reorderSteps(huntId: number, stepOrder: number[], userId: string): Promise<Hunt> {
    const huntDoc = await HuntModel.findByHuntIdAndCreator(huntId, userId);
    if (!huntDoc) {
      throw new NotFoundError();
    }

    // Validate all steps belong to this hunt
    const stepsCount = await StepModel.countDocuments({
      stepId: { $in: stepOrder },
      huntId: huntId,
    });

    if (stepsCount !== stepOrder.length) {
      throw new ValidationError('Invalid step IDs: some steps do not belong to this hunt', []);
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
    const huntDoc = await HuntModel.findOne({ huntId }).exec();
    if (!huntDoc) {
      throw new NotFoundError();
    }

    if (huntDoc.creatorId.toString() !== userId) {
      throw new ForbiddenError();
    }

    return huntDoc;
  }

  async addStepToVersion(huntId: number, huntVersion: number, stepId: number): Promise<void> {
    await HuntVersionModel.findOneAndUpdate(
      { huntId, version: huntVersion, isPublished: false },
      { $push: { stepOrder: stepId } },
    );
  }

  async removeStepFromVersion(huntId: number, huntVersion: number, stepId: number): Promise<void> {
    await HuntVersionModel.findOneAndUpdate(
      { huntId, version: huntVersion, isPublished: false },
      { $pull: { stepOrder: stepId } },
    );
  }
}
