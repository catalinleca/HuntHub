import { HydratedDocument, Types } from 'mongoose';
import { Hunt, HuntCreate, HuntUpdate, HuntStatus } from '@hunthub/shared';
import { IHunt } from '@/database/types/Hunt';

export class HuntMapper {
  /**
   * Type guard: Validates HuntStatus enum at runtime
   * Catches corrupt data before it reaches API response
   */
  private static isHuntStatus(status: string): status is HuntStatus {
    return Object.values(HuntStatus).includes(status as HuntStatus);
  }

  static toDocument(dto: HuntCreate, creatorId: string): Partial<IHunt> {
    return {
      creatorId: new Types.ObjectId(creatorId),
      name: dto.name,
      description: dto.description,
      startLocation: dto.startLocation,
      // Mongoose provides defaults: status='draft', currentVersion=1, stepOrder=[]
    };
  }

  static toDocumentUpdate(dto: HuntUpdate): Partial<IHunt> {
    return {
      name: dto.name,
      description: dto.description,
      startLocation: dto.startLocation,
    };
  }

  static fromDocument(doc: HydratedDocument<IHunt>): Hunt {
    // Runtime validation: Check enum
    if (!this.isHuntStatus(doc.status)) {
      throw new Error(
        `Data integrity error: Invalid hunt status "${doc.status}" in hunt ${doc.huntId}. ` +
          `Expected one of: ${Object.values(HuntStatus).join(', ')}`,
      );
    }

    return {
      huntId: doc.huntId,
      creatorId: doc.creatorId.toString(),
      name: doc.name,
      description: doc.description,
      currentVersion: doc.currentVersion,
      status: doc.status, // TypeScript knows this is HuntStatus after type guard
      startLocation: doc.startLocation
        ? {
            lat: doc.startLocation.lat,
            lng: doc.startLocation.lng,
            radius: doc.startLocation.radius,
          }
        : undefined,
      createdAt: doc.createdAt?.toString(),
      updatedAt: doc.updatedAt?.toString(),
    };
  }

  static fromDocuments(docs: HydratedDocument<IHunt>[]): Hunt[] {
    return docs.map((doc) => this.fromDocument(doc));
  }
}
