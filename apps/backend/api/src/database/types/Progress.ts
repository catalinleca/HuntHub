import mongoose from 'mongoose';

export enum HuntProgressStatus {
  InProgress = 'in_progress',
  Completed = 'completed',
  Abandoned = 'abandoned',
}

export interface ISubmission {
  timestamp: Date;
  content: unknown; // Flexible: string, asset ID, coordinates, array, etc.
  isCorrect: boolean;

  // Extended fields for AI validation and feedback
  score?: number; // Quality/confidence score (0-1 or 0-10)
  feedback?: string; // Player guidance message from AI or system
  metadata?: Record<string, any>; // Extensibility (e.g., branchTaken, AI model used)
}

export interface IStepProgress {
  stepId: number;
  attempts?: number;
  completed?: boolean;
  responses?: ISubmission[];
  startedAt?: Date;
  completedAt?: Date;
  duration?: number; // Seconds
}

/**
 * IProgress - Database interface for Progress documents
 *
 * Tracks player progress through a hunt.
 * Supports both authenticated users and anonymous players.
 */
export interface IProgress {
  id: string;
  userId?: mongoose.Types.ObjectId; // Optional for anonymous players
  sessionId: string; // UUID for localStorage-based sessions
  isAnonymous: boolean;

  huntId: number;
  version: number; // Which published version they're playing

  startedAt: Date;
  completedAt?: Date;
  duration?: number; // Total time in seconds
  status: HuntProgressStatus;

  currentStepId: number;
  steps?: IStepProgress[];

  playerName: string;
  rating?: number;

  createdAt?: Date;
  updatedAt?: Date;
}
