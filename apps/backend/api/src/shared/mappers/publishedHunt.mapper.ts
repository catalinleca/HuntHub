import { HydratedDocument } from 'mongoose';
import { IPublishedHunt } from '@/database/types/PublishedHunt';

// TODO: Move PublishedHuntDTO to @hunthub/shared when Publishing API is implemented
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
  static fromDocument(doc: HydratedDocument<IPublishedHunt>): PublishedHuntDTO {
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

  static fromDocuments(docs: HydratedDocument<IPublishedHunt>[]): PublishedHuntDTO[] {
    return docs.map((doc) => this.fromDocument(doc));
  }
}
