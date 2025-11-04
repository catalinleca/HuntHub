import { HydratedDocument } from 'mongoose';
import { ILiveHunt } from '@/database/types/LiveHunt';

// TODO: Move LiveHuntDTO to @hunthub/shared when Publishing API is implemented
export interface LiveHuntDTO {
  huntId: number;
  huntVersion: number;
  activePlayerCount: number;
  lastPlayedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class LiveHuntMapper {
  static fromDocument(doc: HydratedDocument<ILiveHunt>): LiveHuntDTO {
    return {
      huntId: doc.huntId,
      huntVersion: doc.huntVersion,
      activePlayerCount: doc.activePlayerCount,
      lastPlayedAt: doc.lastPlayedAt?.toISOString(),
      createdAt: doc.createdAt?.toISOString(),
      updatedAt: doc.updatedAt?.toISOString(),
    };
  }

  static fromDocuments(docs: HydratedDocument<ILiveHunt>[]): LiveHuntDTO[] {
    return docs.map((doc) => this.fromDocument(doc));
  }
}
