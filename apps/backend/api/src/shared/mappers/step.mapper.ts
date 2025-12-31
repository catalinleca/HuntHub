import { HydratedDocument } from 'mongoose';
import { Step, StepCreate, StepUpdate, ChallengeType, Challenge } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';

export class StepMapper {
  /**
   * Type guard: Validates ChallengeType enum at runtime
   * Catches corrupt data before it reaches API response
   */
  private static isChallengeType(type: string): type is ChallengeType {
    return Object.values(ChallengeType).includes(type as ChallengeType);
  }

  static toDocument(dto: StepCreate, huntId: number, huntVersion: number): Partial<IStep> {
    return {
      huntId,
      huntVersion,
      type: dto.type,
      challenge: dto.challenge,
      media: dto.media,
      hint: dto.hint ?? undefined,
      requiredLocation: dto.requiredLocation ?? undefined,
      timeLimit: dto.timeLimit ?? undefined,
      maxAttempts: dto.maxAttempts ?? undefined,
      // Mongoose provides defaults for metadata
    };
  }

  static toDocumentUpdate(dto: StepUpdate): Partial<IStep> {
    return {
      type: dto.type,
      challenge: dto.challenge,
      media: dto.media,
      hint: dto.hint ?? undefined,
      requiredLocation: dto.requiredLocation ?? undefined,
      timeLimit: dto.timeLimit ?? undefined,
      maxAttempts: dto.maxAttempts ?? undefined,
    };
  }

  static toComparableData(doc: IStep): Partial<IStep> {
    return {
      type: doc.type,
      challenge: doc.challenge,
      media: doc.media,
      hint: doc.hint,
      requiredLocation: doc.requiredLocation,
      timeLimit: doc.timeLimit,
      maxAttempts: doc.maxAttempts,
    };
  }

  static fromDocument(doc: HydratedDocument<IStep>): Step {
    // Runtime validation: Check enum
    if (!this.isChallengeType(doc.type)) {
      throw new Error(
        `Data integrity error: Invalid challenge type "${doc.type}" in step ${doc.stepId}. ` +
          `Expected one of: ${Object.values(ChallengeType).join(', ')}`,
      );
    }

    return {
      stepId: doc.stepId,
      huntId: doc.huntId,
      type: doc.type, // TypeScript knows this is ChallengeType after type guard
      challenge: doc.challenge as Challenge,
      media: doc.media,
      hint: doc.hint,
      requiredLocation: doc.requiredLocation
        ? {
            lat: doc.requiredLocation.lat,
            lng: doc.requiredLocation.lng,
            radius: doc.requiredLocation.radius,
            address: doc.requiredLocation.address,
          }
        : undefined,
      timeLimit: doc.timeLimit,
      maxAttempts: doc.maxAttempts,
      metadata: doc.metadata,
      createdAt: doc.createdAt?.toISOString(),
      updatedAt: doc.updatedAt?.toISOString(),
    };
  }

  /**
   * Clone step document for a new version. Preserves stepId but updates huntVersion. Used during publishing workflow
   *
   * @param sourceDoc - Original step document to clone
   * @param targetVersion - New version number
   * @returns Partial IStep ready for Model.create()
   */
  static toCloneDocument(sourceDoc: HydratedDocument<IStep>, targetVersion: number): Partial<IStep> {
    return {
      huntVersion: targetVersion,

      stepId: sourceDoc.stepId,
      huntId: sourceDoc.huntId,
      type: sourceDoc.type,
      challenge: sourceDoc.challenge, // Mongoose handles deep copy
      media: sourceDoc.media,
      hint: sourceDoc.hint,
      requiredLocation: sourceDoc.requiredLocation,
      timeLimit: sourceDoc.timeLimit,
      maxAttempts: sourceDoc.maxAttempts,
      metadata: sourceDoc.metadata ? { ...sourceDoc.metadata } : {},
    };
  }

  static fromDocuments(docs: HydratedDocument<IStep>[]): Step[] {
    return docs.map((doc) => this.fromDocument(doc));
  }
}
