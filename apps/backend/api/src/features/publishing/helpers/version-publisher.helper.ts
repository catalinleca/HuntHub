import { ClientSession, HydratedDocument, Types } from 'mongoose';
import HuntModel from '@/database/models/Hunt';
import HuntVersionModel from '@/database/models/HuntVersion';
import { IHunt } from '@/database/types/Hunt';
import { ConflictError } from '@/shared/errors/ConflictError';

export class VersionPublisher {
  static async markVersionPublished(
    huntId: number,
    version: number,
    userId: string,
    expectedUpdatedAt: Date,
    session: ClientSession,
  ) {
    // TODO: userID or we validate before?
    const result = await HuntVersionModel.updateOne(
      {
        huntId,
        version,
        updatedAt: expectedUpdatedAt,
        isPublished: false,
      },
      {
        isPublished: true,
        publishedAt: new Date(),
        publishedBy: new Types.ObjectId(userId),
      },
      { session },
    );

    if (result.matchedCount === 0) {
      throw new ConflictError(
        'Hunt version was modified during publishing. This can happen if:\n' +
          '- Another publish request is in progress\n' +
          '- Hunt was edited by another user\n' +
          '- Version was already published\n' +
          'Please refresh and try again.',
      );
    }
  }

  static async updateHuntPointers(huntId: number, currentVersion: number, newVersion: number, session: ClientSession) {
    const updatedHunt = await HuntModel.findOneAndUpdate(
      {
        huntId,
        latestVersion: currentVersion,
      },
      {
        // liveVersion: newVersion, TODO: not sure if we wanna make a published version live on publish
        latestVersion: newVersion,
      },
      {
        new: true,
        session,
      },
    );

    if (!updatedHunt) {
      throw new ConflictError(
        'Hunt was modified during publishing. This can happen if:\n' +
          '- Another publish request is in progress\n' +
          '- Hunt was edited by another user\n' +
          'Please refresh and try again.',
      );
    }

    return updatedHunt;
  }
}
