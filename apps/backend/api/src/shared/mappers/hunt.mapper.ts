import { HydratedDocument, Types } from 'mongoose';
import { Hunt, HuntCreate, HuntStatus, HuntUpdate } from '@hunthub/shared';
import { IHunt } from '@/database/types/Hunt';
import { IHuntVersion } from '@/database/types/HuntVersion';

/**
 * HuntMapper - Transforms between DB documents and API DTOs
 *
 * IMPORTANT: Frontend sees merged "Hunt" DTO (Hunt master + HuntVersion content)
 * Backend manages Hunt (pointers) + HuntVersion (content) separately
 *
 * ALL transformations between DTOs and DB documents go through this mapper.
 * Services should NEVER manually build DB objects.
 */
export class HuntMapper {
  /**
   * Create Hunt master document data for new hunt
   * @param creatorId - User ID creating the hunt
   * @returns IHunt document data ready for Model.create()
   */
  static toHuntDocument(creatorId: string): Partial<IHunt> {
    return {
      creatorId: new Types.ObjectId(creatorId),
      latestVersion: 1,
      liveVersion: null,
      isDeleted: false,
    };
  }

  /**
   * Transform HuntCreate DTO → IHuntVersion document data for creation
   * @param dto - HuntCreate from API request
   * @param huntId - Hunt master ID
   * @param version - Version number
   * @returns IHuntVersion document data ready for Model.create()
   */
  static toVersionDocument(dto: HuntCreate, huntId: number, version: number): Partial<IHuntVersion> {
    return {
      huntId,
      version,
      name: dto.name,
      description: dto.description,
      startLocation: dto.startLocation,
      stepOrder: [],
      isPublished: false,
    };
  }
  /**
   * Merge Hunt master + HuntVersion content → Hunt DTO for API response
   * @param huntDoc - Hunt master record (pointers only)
   * @param versionDoc - HuntVersion content record
   * @returns Hunt DTO (merged view)
   */
  static fromDocuments(huntDoc: HydratedDocument<IHunt>, versionDoc: HydratedDocument<IHuntVersion>): Hunt {
    return {
      huntId: huntDoc.huntId,
      creatorId: huntDoc.creatorId.toString(),

      // Content from HuntVersion
      name: versionDoc.name,
      description: versionDoc.description,
      startLocation: versionDoc.startLocation
        ? {
            lat: versionDoc.startLocation.lat,
            lng: versionDoc.startLocation.lng,
            radius: versionDoc.startLocation.radius,
          }
        : undefined,
      stepOrder: versionDoc.stepOrder,

      // Computed status
      status: versionDoc.isPublished ? HuntStatus.Published : HuntStatus.Draft,

      // Timestamps: Hunt.createdAt (when hunt was created), HuntVersion.updatedAt (when content last changed)
      createdAt: huntDoc.createdAt?.toISOString(),
      updatedAt: versionDoc.updatedAt?.toISOString(),
    };
  }

  /**
   * Map array of Hunt + HuntVersion pairs to Hunt DTOs
   * @param pairs - Array of [huntDoc, versionDoc] tuples
   * @returns Array of Hunt DTOs
   */
  static fromDocumentPairs(pairs: Array<[HydratedDocument<IHunt>, HydratedDocument<IHuntVersion>]>): Hunt[] {
    return pairs.map(([huntDoc, versionDoc]) => this.fromDocuments(huntDoc, versionDoc));
  }

  /**
   * Map HuntUpdate DTO → Partial<IHuntVersion> for updating draft content
   * @param dto - HuntUpdate from API request
   * @returns Partial IHuntVersion document data
   */
  static toVersionUpdate(dto: Hunt): Partial<IHuntVersion> {
    return {
      name: dto.name,
      description: dto.description,
      startLocation: dto.startLocation,
    };
  }

  static toCloneDocument(sourceDoc: HydratedDocument<IHuntVersion>, huntId: number, targetVersion: number): Partial<IHuntVersion> {
    return {
      huntId,
      version: targetVersion,

      name: sourceDoc.name,
      description: sourceDoc.description,
      startLocation: sourceDoc.startLocation,
      stepOrder: [...sourceDoc.stepOrder], // Clone array
      isPublished: false,
    }
  }
}
