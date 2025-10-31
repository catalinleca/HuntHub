import { ILocation } from '@/database/schemas/location.schema';

/**
 * IStep - Database interface for Step documents
 *
 * Steps are the individual challenges/locations in a hunt.
 * They can be: Clue, Quiz, Mission, or Task.
 */
export interface IStep {
  stepId: number;
  huntId: number;
  type: string; // ChallengeType from shared package
  challenge: unknown; // Flexible: clue, quiz, mission, or task
  hint?: string;
  requiredLocation?: ILocation;
  timeLimit?: number;
  maxAttempts?: number;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}
