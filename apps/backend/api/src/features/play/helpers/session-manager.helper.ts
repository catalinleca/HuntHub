import { randomUUID } from 'crypto';
import mongoose, { ClientSession, HydratedDocument } from 'mongoose';
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
      userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
      isAnonymous: !userId,
      status: HuntProgressStatus.InProgress,
      startedAt: new Date(),
      currentStepId: firstStepId,
      steps: [initialStepProgress],
    };

    const [progress] = await ProgressModel.create([progressData], { session });
    return progress;
  }

  static async createPreviewSession(
    huntId: number,
    version: number,
    firstStepId: number,
    userId: string,
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
      playerName: 'Preview',
      userId: new mongoose.Types.ObjectId(userId),
      isAnonymous: false,
      isPreview: true,
      status: HuntProgressStatus.InProgress,
      startedAt: new Date(),
      currentStepId: firstStepId,
      steps: [initialStepProgress],
    };

    const [progress] = await ProgressModel.create([progressData]);
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
    session: ClientSession,
  ): Promise<void> {
    if (!session) {
      throw new Error('advanceToNextStep requires a transaction session for atomicity');
    }

    const newStepProgress: IStepProgress = {
      stepId: nextStepId,
      attempts: 0,
      completed: false,
      responses: [],
      startedAt: new Date(),
      hintsUsed: 0,
    };

    // Two operations required - MongoDB can't $set array element AND $push to same array
    const markResult = await ProgressModel.updateOne(
      {
        sessionId,
        currentStepId,
      },
      {
        $set: {
          currentStepId: nextStepId,
          'steps.$[current].completed': true,
          'steps.$[current].completedAt': new Date(),
        },
      },
      {
        session,
        arrayFilters: [{ 'current.stepId': currentStepId }],
      },
    );

    if (markResult.modifiedCount === 0) {
      throw new ConflictError('Session state changed. Please retry.');
    }

    await ProgressModel.updateOne(
      { sessionId, currentStepId: nextStepId },
      { $push: { steps: newStepProgress } },
      { session },
    );
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

  /**
   * Increment attempts counter (non-blocking - always succeeds).
   * Returns the new attempt count.
   */
  static async incrementAttempts(sessionId: string, stepId: number, session?: ClientSession): Promise<number> {
    const result = await ProgressModel.findOneAndUpdate(
      { sessionId, 'steps.stepId': stepId },
      { $inc: { 'steps.$.attempts': 1 } },
      { new: true, session },
    );

    if (!result) {
      throw new NotFoundError('Session or step not found');
    }

    const stepProgress = result.steps?.find((sp) => sp.stepId === stepId);
    return stepProgress?.attempts ?? 1;
  }

  static async recordSubmission(
    sessionId: string,
    stepId: number,
    content: unknown,
    isCorrect: boolean,
    feedback?: string,
    metadata?: Record<string, unknown>,
    session?: ClientSession,
  ): Promise<void> {
    const submission = {
      timestamp: new Date(),
      content,
      isCorrect,
      feedback,
      metadata,
    };

    const result = await ProgressModel.updateOne(
      { sessionId, 'steps.stepId': stepId },
      { $push: { 'steps.$.responses': submission } },
      { session },
    );

    if (result.matchedCount === 0) {
      throw new NotFoundError('Session or step not found');
    }
  }

  /**
   * Atomically increment hints used only if under the limit.
   * Returns null if limit already reached (prevents race condition).
   */
  static async incrementHintsUsedIfUnderLimit(
    sessionId: string,
    stepId: number,
    maxHints: number,
    session?: ClientSession,
  ): Promise<number | null> {
    if (maxHints <= 0) {
      return null;
    }

    const result = await ProgressModel.findOneAndUpdate(
      {
        sessionId,
        steps: {
          $elemMatch: {
            stepId,
            $or: [{ hintsUsed: { $lt: maxHints } }, { hintsUsed: { $exists: false } }],
          },
        },
      },
      { $inc: { 'steps.$.hintsUsed': 1 } },
      { new: true, session },
    );

    if (!result) {
      const exists = await ProgressModel.exists({ sessionId, 'steps.stepId': stepId });
      if (!exists) {
        throw new NotFoundError('Session not found');
      }
      return null; // Limit reached
    }

    const stepProgress = result.steps?.find((sp) => sp.stepId === stepId);
    return stepProgress?.hintsUsed ?? 1;
  }

  /**
   * Navigate to any step in the hunt (preview mode only).
   * Initializes step progress if visiting a new step.
   */
  static async navigateToStep(
    sessionId: string,
    stepId: number,
    stepOrder: number[],
  ): Promise<{ currentStepId: number; currentStepIndex: number }> {
    const stepIndex = stepOrder.indexOf(stepId);
    if (stepIndex === -1) {
      throw new NotFoundError('Step not found in hunt');
    }

    const progress = await this.requireSession(sessionId);

    const existingStepProgress = progress.steps?.find((sp) => sp.stepId === stepId);

    if (existingStepProgress) {
      await ProgressModel.updateOne({ sessionId }, { $set: { currentStepId: stepId } });
    } else {
      const newStepProgress: IStepProgress = {
        stepId,
        attempts: 0,
        completed: false,
        responses: [],
        startedAt: new Date(),
        hintsUsed: 0,
      };

      await ProgressModel.updateOne(
        { sessionId },
        {
          $set: { currentStepId: stepId },
          $push: { steps: newStepProgress },
        },
      );
    }

    return { currentStepId: stepId, currentStepIndex: stepIndex };
  }
}
