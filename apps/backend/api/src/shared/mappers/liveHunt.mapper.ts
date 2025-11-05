import { HydratedDocument } from 'mongoose';
import { ILiveHunt } from '@/database/types/LiveHunt';
import { LiveHunt } from '@hunthub/shared';

export class LiveHuntMapper {
  static fromDocument(doc: HydratedDocument<ILiveHunt>): LiveHunt {
    return {
      huntId: doc.huntId,
      huntVersion: doc.huntVersion,
      activePlayerCount: doc.activePlayerCount,
      lastPlayedAt: doc.lastPlayedAt?.toISOString(),
      createdAt: doc.createdAt?.toISOString(),
      updatedAt: doc.updatedAt?.toISOString(),
    };
  }

  static fromDocuments(docs: HydratedDocument<ILiveHunt>[]): LiveHunt[] {
    return docs.map((doc) => this.fromDocument(doc));
  }
}
