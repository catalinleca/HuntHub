import { HydratedDocument, Types } from 'mongoose';
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

  static toDocument(dto: StepCreate, huntId: number): Partial<IStep> {
    return {
      huntId: huntId,
      type: dto.type,
      challenge: dto.challenge,
      hint: dto.hint,
      requiredLocation: dto.requiredLocation,
      timeLimit: dto.timeLimit,
      maxAttempts: dto.maxAttempts,
      // Mongoose provides defaults for metadata
    };
  }

  static toDocumentUpdate(dto: StepUpdate): Partial<IStep> {
    return {
      type: dto.type,
      challenge: dto.challenge,
      hint: dto.hint,
      requiredLocation: dto.requiredLocation,
      timeLimit: dto.timeLimit,
      maxAttempts: dto.maxAttempts,
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
      hint: doc.hint,
      requiredLocation: doc.requiredLocation
        ? {
            lat: doc.requiredLocation.lat,
            lng: doc.requiredLocation.lng,
            radius: doc.requiredLocation.radius,
          }
        : undefined,
      timeLimit: doc.timeLimit,
      maxAttempts: doc.maxAttempts,
      metadata: doc.metadata,
      createdAt: doc.createdAt?.toString(),
      updatedAt: doc.updatedAt?.toString(),
    };
  }

  static fromDocuments(docs: HydratedDocument<IStep>[]): Step[] {
    return docs.map((doc) => this.fromDocument(doc));
  }
}
