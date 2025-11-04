import { ILocation } from '@/database/schemas/location.schema';

/**
 * IStep - Database interface for Step documents
 *
 * Steps are versioned - each version of a hunt has its own copies of steps.
 * stepId is stable across versions (same step in v1 and v2 has same stepId).
 */
export interface IStep {
  stepId: number;
  huntId: number;
  huntVersion: number;            // FK to HuntVersion (compound: huntId + huntVersion)
  type: string;                   // ChallengeType from shared package
  challenge: unknown;             // Flexible: clue, quiz, mission, or task
  hint?: string;
  requiredLocation?: ILocation;
  timeLimit?: number;
  maxAttempts?: number;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}
