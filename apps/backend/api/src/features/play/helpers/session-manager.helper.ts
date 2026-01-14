import { randomUUID } from 'crypto';
import { ClientSession, HydratedDocument } from 'mongoose';
import { HuntProgressStatus } from '@hunthub/shared';
import ProgressModel from '@/database/models/Progress';
import { IProgress, IStepProgress } from '@/database/types/Progress';
import { NotFoundError, ConflictError } from '@/shared/errors';

export class SessionManager {
  static generateSessionId(): string {
    return randomUUID();
  }

  static async createSession(
    huntId: number,
    version: number,
    playerName: string,
    firstStepId: number,
    userId?: string,
    session?: ClientSession,
  ): Promise<HydratedDocument<IProgress>> {
    const sessionId = this.generateSessionId();

    const initialStepProgress: IStepProgress = {
      stepId: firstStepId,
      attempts: 0,
      completed: false,
      responses: [],
      startedAt: new Date(),
      hintsUsed: 0,
    };

    const progressData: Partial<IProgress> = {
      sessionId,
      huntId,
      version,
      playerName,
      userId: userId ? (userId as unknown as IProgress['userId']) : undefined,
      isAnonymous: !userId,
      status: HuntProgressStatus.InProgress,
      startedAt: new Date(),
      currentStepId: firstStepId,
      steps: [initialStepProgress],
    };

    const [progress] = await ProgressModel.create([progressData], { session });
    return progress;
  }

  static async getSession(sessionId: string): Promise<HydratedDocument<IProgress> | null> {
    return ProgressModel.findBySession(sessionId);
  }

  static async requireSession(sessionId: string): Promise<HydratedDocument<IProgress>> {
    const progress = await this.getSession(sessionId);

    if (!progress) {
      throw new NotFoundError('Session not found or expired');
    }

    return progress;
  }

  static validateSessionActive(progress: IProgress): void {
    if (progress.status === HuntProgressStatus.Completed) {
      throw new ConflictError('This session has already been completed');
    }

    if (progress.status === HuntProgressStatus.Abandoned) {
      throw new ConflictError('This session has been abandoned');
    }
  }

  static getCurrentStepProgress(progress: IProgress): IStepProgress | undefined {
    return progress.steps?.find((sp) => sp.stepId === progress.currentStepId);
  }

  static async advanceToNextStep(
    sessionId: string,
    currentStepId: number,
    nextStepId: number,
    session?: ClientSession,
  ): Promise<void> {
    const newStepProgress: IStepProgress = {
      stepId: nextStepId,
      attempts: 0,
      completed: false,
      responses: [],
      startedAt: new Date(),
      hintsUsed: 0,
    };

    const result = await ProgressModel.updateOne(
      {
        sessionId,
        currentStepId, // Optimistic lock on current position
      },
      {
        currentStepId: nextStepId,
        $set: { 'steps.$[current].completed': true, 'steps.$[current].completedAt': new Date() },
        $push: { steps: newStepProgress },
      },
      {
        session,
        arrayFilters: [{ 'current.stepId': currentStepId }],
      },
    );

    if (result.modifiedCount === 0) {
      throw new ConflictError('Session state changed. Please retry.');
    }
  }

  static async completeSession(sessionId: string, currentStepId: number, session?: ClientSession): Promise<void> {
    const now = new Date();

    const result = await ProgressModel.updateOne(
      {
        sessionId,
        currentStepId,
        status: HuntProgressStatus.InProgress,
      },
      {
        status: HuntProgressStatus.Completed,
        completedAt: now,
        $set: { 'steps.$[current].completed': true, 'steps.$[current].completedAt': now },
      },
      {
        session,
        arrayFilters: [{ 'current.stepId': currentStepId }],
      },
    );

    if (result.modifiedCount === 0) {
      throw new ConflictError('Session state changed. Please retry.');
    }
  }

  static async incrementAttempts(sessionId: string, stepId: number, session?: ClientSession): Promise<void> {
    await ProgressModel.updateOne(
      { sessionId, 'steps.stepId': stepId },
      { $inc: { 'steps.$.attempts': 1 } },
      { session },
    );
  }

  static async recordSubmission(
    sessionId: string,
    stepId: number,
    content: unknown,
    isCorrect: boolean,
    feedback?: string,
    session?: ClientSession,
  ): Promise<void> {
    const submission = {
      timestamp: new Date(),
      content,
      isCorrect,
      feedback,
    };

    await ProgressModel.updateOne(
      { sessionId, 'steps.stepId': stepId },
      { $push: { 'steps.$.responses': submission } },
      { session },
    );
  }

  static async incrementHintsUsed(sessionId: string, stepId: number, session?: ClientSession): Promise<number> {
    const result = await ProgressModel.findOneAndUpdate(
      { sessionId, 'steps.stepId': stepId },
      { $inc: { 'steps.$.hintsUsed': 1 } },
      { new: true, session },
    );

    if (!result) {
      throw new NotFoundError('Session not found');
    }

    const stepProgress = result.steps?.find((sp) => sp.stepId === stepId);
    return stepProgress?.hintsUsed ?? 1;
  }
}
