import { HydratedDocument } from 'mongoose';
import { IHunt } from '@/database/types/Hunt';
import { Hunt } from '@hunthub/shared';

export class HuntMapper {
  static toDTO(doc: HydratedDocument<IHunt>): Hunt {
    return {
      id: doc._id.toString(),
      creatorId: doc.creatorId,
      name: doc.name,
      description: doc.description,
      currentVersion: doc.currentVersion,
      status: doc.status,
      startLocation: doc.startLocation ? {
        lat: doc.startLocation.lat,
        lng: doc.startLocation.lng,
        radius: doc.startLocation.radius,
      } : undefined,
      createdAt: doc.createdAt?.toString(),
      updatedAt: doc.updatedAt?.toString(),
    };
  }

  static toDTOArray(docs: HydratedDocument<IHunt>[]): Hunt[] {
    return docs.map(doc => this.toDTO(doc));
  }
}
