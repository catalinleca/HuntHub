import { HydratedDocument } from 'mongoose';
import { IPublishedHunt } from '@/database/types/PublishedHunt';

export interface PublishedHuntDTO {
  id: string;
  huntId: string;
  versionId: string;
  version: number;
  name: string;
  publishedAt: string;
  publishedBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export class PublishedHuntMapper {
  static toDTO(doc: HydratedDocument<IPublishedHunt>): PublishedHuntDTO {
    return {
      id: doc._id.toString(),
      huntId: doc.huntId.toString(),
      versionId: doc.versionId.toString(),
      version: doc.version,
      name: doc.name,
      publishedAt: doc.publishedAt.toString(),
      publishedBy: doc.publishedBy,
      createdAt: doc.createdAt?.toString(),
      updatedAt: doc.updatedAt?.toString(),
    };
  }

  static toDTOs(docs: HydratedDocument<IPublishedHunt>[]): PublishedHuntDTO[] {
    return docs.map((doc) => this.toDTO(doc));
  }
}
