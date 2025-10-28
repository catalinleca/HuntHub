import { HydratedDocument } from 'mongoose';
import { ILiveHunt } from '@/database/types/LiveHunt';

// TODO: Move LiveHuntDTO to @hunthub/shared when Publishing API is implemented
export interface LiveHuntDTO {
  id: string;
  versionId: string;
  createdAt?: string;
  updatedAt?: string;
}

export class LiveHuntMapper {
  static fromDocument(doc: HydratedDocument<ILiveHunt>): LiveHuntDTO {
    return {
      id: doc._id.toString(),
      versionId: doc.versionId.toString(),
      createdAt: doc.createdAt?.toString(),
      updatedAt: doc.updatedAt?.toString(),
    };
  }

  static fromDocuments(docs: HydratedDocument<ILiveHunt>[]): LiveHuntDTO[] {
    return docs.map((doc) => this.fromDocument(doc));
  }
}
