import { ClientSession } from 'mongoose';
import HuntModel from '@/database/models/Hunt';
import HuntVersionModel from '@/database/models/HuntVersion';
import { ConflictError } from '@/shared/errors/ConflictError';

export class VersionPublisher {
  static async markVersionPublished(
    huntId: number,
    version: number,
    userId: string,
    expectedUpdatedAt: Date,
    session: ClientSession,
  ): Promise<Date> {
    const publishedAt = new Date();

    const result = await HuntVersionModel.updateOne(
      {
        huntId,
        version,
        updatedAt: expectedUpdatedAt,
        isPublished: false,
      },
      {
        isPublished: true,
        publishedAt,
        publishedBy: userId,
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

    return publishedAt;
  }

  static async updateHuntPointers(huntId: number, currentVersion: number, newVersion: number, session: ClientSession) {
    const updatedHunt = await HuntModel.findOneAndUpdate(
      {
        huntId,
        latestVersion: currentVersion,
      },
      {
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
