import { ClientSession, HydratedDocument } from 'mongoose';
import { IHunt } from '@/database/types/Hunt';
import { ConflictError } from '@/shared/errors/ConflictError';
import Hunt from '@/database/models/Hunt';

export class ReleaseManager {
  static async releaseVersion(
    huntId: number,
    version: number,
    userId: string,
    currentLiveVersion: number | null,
    session: ClientSession,
  ): Promise<HydratedDocument<IHunt>> {
    const updateResult = await Hunt.findOneAndUpdate(
      {
        huntId: huntId,
        liveVersion: currentLiveVersion, // Must match current state (optimistic locking)
      },
      {
        liveVersion: version,
        releasedAt: new Date(),
        releasedBy: userId,
      },
      {
        new: true,
        session,
      },
    );

    if (!updateResult) {
      throw new ConflictError('Hunt was modified by another operation. Please retry with the current liveVersion.');
    }

    return updateResult as HydratedDocument<IHunt>;
  }

  static async takeOffline(
    huntId: number,
    currentLiveVersion: number,
    session: ClientSession,
  ): Promise<HydratedDocument<IHunt>> {
    const updateResult = await Hunt.findOneAndUpdate(
      {
        huntId: huntId,
        liveVersion: currentLiveVersion, // Must match current state (optimistic locking)
      },
      {
        liveVersion: null,
        releasedAt: null,
        releasedBy: null,
      },
      {
        new: true,
        session,
      },
    );

    if (!updateResult) {
      throw new ConflictError('Hunt was modified by another operation. Please retry with the current liveVersion.');
    }

    return updateResult as HydratedDocument<IHunt>;
  }
}
