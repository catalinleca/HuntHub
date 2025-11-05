import { HydratedDocument } from 'mongoose';
import { IProgress, IStepProgress, ISubmission } from '@/database/types/Progress';
import { Progress, Submission, StepProgress } from '@hunthub/shared';

export class ProgressMapper {
  static fromDocument(doc: HydratedDocument<IProgress>): Progress {
    return {
      id: doc._id.toString(),
      userId: doc.userId?.toString(),
      sessionId: doc.sessionId,
      isAnonymous: doc.isAnonymous,
      huntId: doc.huntId,
      version: doc.version,
      status: doc.status,
      startedAt: doc.startedAt.toISOString(),
      completedAt: doc.completedAt?.toISOString(),
      duration: doc.duration,
      currentStepId: doc.currentStepId,
      steps: doc.steps?.map((step) => this.mapStepProgress(step)),
      playerName: doc.playerName,
      rating: doc.rating,
      createdAt: doc.createdAt?.toISOString(),
      updatedAt: doc.updatedAt?.toISOString(),
    };
  }

  private static mapStepProgress(step: IStepProgress): StepProgress {
    return {
      stepId: step.stepId,
      attempts: step.attempts,
      completed: step.completed,
      responses: step.responses?.map((response) => this.mapSubmission(response)),
      startedAt: step.startedAt?.toISOString(),
      completedAt: step.completedAt?.toISOString(),
      duration: step.duration,
    };
  }

  private static mapSubmission(submission: ISubmission): Submission {
    return {
      timestamp: submission.timestamp.toISOString(),
      content: submission.content,
      isCorrect: submission.isCorrect,
      score: submission.score,
      feedback: submission.feedback,
      metadata: submission.metadata,
    };
  }

  static fromDocuments(docs: HydratedDocument<IProgress>[]): Progress[] {
    return docs.map((doc) => this.fromDocument(doc));
  }
}