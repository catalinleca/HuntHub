import { HydratedDocument } from 'mongoose';
import { Step, ChallengeType, Challenge } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';

export class StepMapper {
  static toDTO(doc: HydratedDocument<IStep>): Step {
    return {
      id: doc._id.toString(),
      huntId: doc.huntId.toString(),
      type: doc.type as ChallengeType,
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

  static toDTOs(docs: HydratedDocument<IStep>[]): Step[] {
    return docs.map((doc) => this.toDTO(doc));
  }
}
