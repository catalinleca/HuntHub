import { HydratedDocument } from 'mongoose';
import { IStep } from '@/database/types/Step';

export interface StepDTO {
  id: string;
  huntId: string;
  type: string;
  challenge: unknown;
  hint?: string;
  requiredLocation?: {
    lat: number;
    lng: number;
    radius: number;
  };
  timeLimit?: number;
  maxAttempts?: number;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export class StepMapper {
  static toDTO(doc: HydratedDocument<IStep>): StepDTO {
    return {
      id: doc._id.toString(),
      huntId: doc.huntId.toString(),
      type: doc.type,
      challenge: doc.challenge,
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

  static toDTOs(docs: HydratedDocument<IStep>[]): StepDTO[] {
    return docs.map((doc) => this.toDTO(doc));
  }
}
