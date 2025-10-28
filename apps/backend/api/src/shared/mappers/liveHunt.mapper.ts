import { HydratedDocument } from 'mongoose';
import { ILiveHunt } from '@/database/types/LiveHunt';

export interface LiveHuntDTO {
  id: string;
  versionId: string;
  createdAt?: string;
  updatedAt?: string;
}

export class LiveHuntMapper {
  static toDTO(doc: HydratedDocument<ILiveHunt>): LiveHuntDTO {
    return {
      id: doc._id.toString(),
      versionId: doc.versionId.toString(),
      createdAt: doc.createdAt?.toString(),
      updatedAt: doc.updatedAt?.toString(),
    };
  }

  static toDTOs(docs: HydratedDocument<ILiveHunt>[]): LiveHuntDTO[] {
    return docs.map((doc) => this.toDTO(doc));
  }
}
