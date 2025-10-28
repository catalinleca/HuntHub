import { HydratedDocument } from 'mongoose';
import { IProgress, IStepProgress, ISubmission } from '@/database/types/Progress';

export interface ProgressDTO {
  id: string;
  userId?: string;
  sessionId: string;
  isAnonymous: boolean;
  huntId: string;
  version: number;
  status: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  currentStepId: string;
  steps?: Array<{
    stepId: string;
    attempts?: number;
    completed?: boolean;
    responses?: Array<{
      timestamp: string;
      content: unknown;
      isCorrect: boolean;
      score?: number;
      feedback?: string;
      metadata?: Record<string, any>;
    }>;
    startedAt?: string;
    completedAt?: string;
    duration?: number;
  }>;
  playerName: string;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export class ProgressMapper {
  static toDTO(doc: HydratedDocument<IProgress>): ProgressDTO {
    return {
      id: doc._id.toString(),
      userId: doc.userId?.toString(),
      sessionId: doc.sessionId,
      isAnonymous: doc.isAnonymous,
      huntId: doc.huntId.toString(),
      version: doc.version,
      status: doc.status,
      startedAt: doc.startedAt.toString(),
      completedAt: doc.completedAt?.toString(),
      duration: doc.duration,
      currentStepId: doc.currentStepId,
      steps: doc.steps?.map((step) => ({
        stepId: step.stepId.toString(),
        attempts: step.attempts,
        completed: step.completed,
        responses: step.responses?.map((response) => ({
          timestamp: response.timestamp.toString(),
          content: response.content,
          isCorrect: response.isCorrect,
          score: response.score,
          feedback: response.feedback,
          metadata: response.metadata,
        })),
        startedAt: step.startedAt?.toString(),
        completedAt: step.completedAt?.toString(),
        duration: step.duration,
      })),
      playerName: doc.playerName,
      rating: doc.rating,
      createdAt: doc.createdAt?.toString(),
      updatedAt: doc.updatedAt?.toString(),
    };
  }

  static toDTOs(docs: HydratedDocument<IProgress>[]): ProgressDTO[] {
    return docs.map((doc) => this.toDTO(doc));
  }
}
