import { injectable } from 'inversify';
import { HydratedDocument } from 'mongoose';
import {
  SessionResponse,
  StepResponse,
  ValidateAnswerRequest,
  ValidateAnswerResponse,
  HintResponse,
  PlayerExporter,
} from '@hunthub/shared';
import HuntModel from '@/database/models/Hunt';
import HuntVersionModel from '@/database/models/HuntVersion';
import { IHunt } from '@/database/types/Hunt';
import { IHuntVersion } from '@/database/types/HuntVersion';
import { IStep } from '@/database/types/Step';
import { IStepProgress } from '@/database/types/Progress';
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from '@/shared/errors';
import { withTransaction } from '@/shared/utils/transaction';
import { SessionManager } from './helpers/session-manager.helper';
import { StepNavigator } from './helpers/step-navigator.helper';
import { AnswerValidator } from './helpers/answer-validator.helper';

export interface DiscoverHuntsResponse {
  hunts: Array<{
    huntId: number;
    name: string;
    description?: string;
    totalSteps: number;
  }>;
  total: number;
}

export interface IPlayService {
  discoverHunts(page: number, limit: number): Promise<DiscoverHuntsResponse>;
  startSession(huntId: number, playerName: string, userId?: string): Promise<SessionResponse>;
  getSession(sessionId: string): Promise<SessionResponse>;
  getStep(sessionId: string, stepId: number): Promise<StepResponse>;
  validateAnswer(sessionId: string, request: ValidateAnswerRequest): Promise<ValidateAnswerResponse>;
  requestHint(sessionId: string): Promise<HintResponse>;
}

@injectable()
export class PlayService implements IPlayService {
  async discoverHunts(page: number, limit: number): Promise<DiscoverHuntsResponse> {
    const skip = (page - 1) * limit;

    const [hunts, total] = await Promise.all([
      HuntModel.find({ liveVersion: { $ne: null }, isDeleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      HuntModel.countDocuments({ liveVersion: { $ne: null }, isDeleted: false }),
    ]);

    if (hunts.length === 0) {
      return { hunts: [], total };
    }

    // Batch fetch all versions in a single query (avoid N+1)
    const versionQueries = hunts.map((h) => ({ huntId: h.huntId, version: h.liveVersion, isPublished: true }));
    const versions = await HuntVersionModel.find({ $or: versionQueries }).lean();

    // Create lookup map for O(1) access
    const versionMap = new Map(versions.map((v) => [`${v.huntId}-${v.version}`, v]));

    const sanitizedHunts = hunts.map((hunt) => {
      const version = versionMap.get(`${hunt.huntId}-${hunt.liveVersion}`);
      return {
        huntId: hunt.huntId,
        name: version?.name ?? 'Untitled Hunt',
        description: version?.description,
        totalSteps: version?.stepOrder?.length ?? 0,
      };
    });

    return { hunts: sanitizedHunts, total };
  }

  async startSession(huntId: number, playerName: string, userId?: string): Promise<SessionResponse> {
    const hunt = await this.requireLiveHunt(huntId);
    const liveVersion = hunt.liveVersion!;

    const huntVersion = await HuntVersionModel.findPublishedVersion(huntId, liveVersion);
    if (!huntVersion) {
      throw new NotFoundError('Live hunt version not found');
    }

    if (!huntVersion.stepOrder.length) {
      throw new ValidationError('This hunt has no steps to play', []);
    }

    const firstStepId = huntVersion.stepOrder[0];
    const progress = await SessionManager.createSession(huntId, liveVersion, playerName, firstStepId, userId);

    const step = await StepNavigator.getStepById(huntId, liveVersion, firstStepId);
    if (!step) {
      throw new NotFoundError('First step not found');
    }

    const stepProgress = progress.steps?.[0];

    return {
      sessionId: progress.sessionId,
      hunt: PlayerExporter.hunt(huntId, huntVersion),
      status: 'in_progress',
      currentStepIndex: 0,
      totalSteps: huntVersion.stepOrder.length,
      startedAt: progress.startedAt.toISOString(),
      currentStep: this.buildStepResponse(progress.sessionId, step, huntVersion, stepProgress),
    };
  }

  async getSession(sessionId: string): Promise<SessionResponse> {
    const progress = await SessionManager.requireSession(sessionId);
    const huntVersion = await this.requireHuntVersion(progress.huntId, progress.version);

    const currentIndex = StepNavigator.getStepIndex(huntVersion.stepOrder, progress.currentStepId);
    const isInProgress = progress.status === 'in_progress';

    let currentStep: StepResponse | undefined;
    if (isInProgress) {
      const step = await StepNavigator.getCurrentStepForSession(progress);
      if (step) {
        const stepProgress = SessionManager.getCurrentStepProgress(progress);
        currentStep = this.buildStepResponse(sessionId, step, huntVersion, stepProgress ?? undefined);
      }
    }

    return {
      sessionId: progress.sessionId,
      hunt: PlayerExporter.hunt(progress.huntId, huntVersion),
      status: progress.status,
      currentStepIndex: currentIndex,
      totalSteps: huntVersion.stepOrder.length,
      startedAt: progress.startedAt.toISOString(),
      completedAt: progress.completedAt?.toISOString(),
      currentStep,
    };
  }

  async getStep(sessionId: string, requestedStepId: number): Promise<StepResponse> {
    const progress = await SessionManager.requireSession(sessionId);
    SessionManager.validateSessionActive(progress);

    const huntVersion = await this.requireHuntVersion(progress.huntId, progress.version);

    // SERVER STATE is source of truth
    const currentIndex = huntVersion.stepOrder.indexOf(progress.currentStepId);
    const currentStepId = progress.currentStepId;
    const nextStepId = huntVersion.stepOrder[currentIndex + 1]; // may be undefined

    const allowedStepIds = [currentStepId, nextStepId].filter((id): id is number => id !== undefined);
    if (!allowedStepIds.includes(requestedStepId)) {
      throw new ForbiddenError('Step not accessible from current position');
    }

    const step = await StepNavigator.getStepById(progress.huntId, progress.version, requestedStepId);
    if (!step) {
      throw new NotFoundError('Step not found');
    }

    const stepProgress =
      requestedStepId === currentStepId ? SessionManager.getCurrentStepProgress(progress) : undefined;

    return this.buildStepResponse(sessionId, step, huntVersion, stepProgress ?? undefined);
  }

  /**
   * Validate player's answer submission
   *
   * Returns lightweight response - client uses prefetched cache for next step
   *
   * Wrapped in transaction for atomic state updates:
   * - Increment attempts
   * - Record submission
   * - Advance to next step (if correct)
   * - Complete session (if last step)
   */
  async validateAnswer(sessionId: string, request: ValidateAnswerRequest): Promise<ValidateAnswerResponse> {
    const progress = await SessionManager.requireSession(sessionId);
    SessionManager.validateSessionActive(progress);

    const huntVersion = await this.requireHuntVersion(progress.huntId, progress.version);
    const step = await StepNavigator.getCurrentStepForSession(progress);

    if (!step) {
      throw new NotFoundError('Current step not found');
    }

    const stepProgress = SessionManager.getCurrentStepProgress(progress);
    const currentAttempts = (stepProgress?.attempts ?? 0) + 1;
    const isLastStep = StepNavigator.isLastStep(huntVersion.stepOrder, progress.currentStepId);

    if (step.timeLimit && stepProgress?.startedAt) {
      const elapsedSeconds = (Date.now() - stepProgress.startedAt.getTime()) / 1000;
      if (elapsedSeconds > step.timeLimit) {
        return {
          correct: false,
          expired: true,
          attempts: currentAttempts,
          maxAttempts: step.maxAttempts ?? undefined,
        };
      }
    }

    if (step.maxAttempts && currentAttempts > step.maxAttempts) {
      return {
        correct: false,
        exhausted: true,
        attempts: currentAttempts - 1,
        maxAttempts: step.maxAttempts,
      };
    }

    const validationResult = AnswerValidator.validate(request.answerType, request.payload, step);

    return withTransaction(async (session) => {
      await SessionManager.incrementAttempts(sessionId, progress.currentStepId, session);

      await SessionManager.recordSubmission(
        sessionId,
        progress.currentStepId,
        request.payload,
        validationResult.isCorrect,
        validationResult.feedback,
        session,
      );

      let isComplete = false;

      if (validationResult.isCorrect) {
        if (isLastStep) {
          await SessionManager.completeSession(sessionId, progress.currentStepId, session);
          isComplete = true;
        } else {
          const nextStepId = StepNavigator.getNextStepId(huntVersion.stepOrder, progress.currentStepId);
          if (nextStepId !== null) {
            await SessionManager.advanceToNextStep(sessionId, progress.currentStepId, nextStepId, session);
          }
        }
      }

      return {
        correct: validationResult.isCorrect,
        feedback: validationResult.feedback,
        attempts: currentAttempts,
        maxAttempts: step.maxAttempts ?? undefined,
        isComplete: isComplete || undefined,
      };
    });
  }

  async requestHint(sessionId: string): Promise<HintResponse> {
    const progress = await SessionManager.requireSession(sessionId);
    SessionManager.validateSessionActive(progress);

    const step = await StepNavigator.getCurrentStepForSession(progress);

    if (!step) {
      throw new NotFoundError('Current step not found');
    }

    if (!step.hint) {
      throw new NotFoundError('No hint available for this step');
    }

    // Check if hint already used (MVP: max 1)
    const stepProgress = SessionManager.getCurrentStepProgress(progress);
    if ((stepProgress?.hintsUsed ?? 0) >= 1) {
      // We might need a better way to make sure we don't diverge from the hints in data and hintsUsed here so maybe add hints in the session (progress)
      throw new ConflictError('You have already used your hint for this step');
    }

    const hintsUsed = await SessionManager.incrementHintsUsed(sessionId, progress.currentStepId);

    return {
      hint: step.hint,
      hintsUsed,
      maxHints: 1,
    };
  }

  private async requireLiveHunt(huntId: number): Promise<HydratedDocument<IHunt>> {
    const hunt = await HuntModel.findOne({ huntId, isDeleted: false });

    if (!hunt) {
      throw new NotFoundError('Hunt not found');
    }

    if (hunt.liveVersion === null || hunt.liveVersion === undefined) {
      throw new ForbiddenError('This hunt is not currently available for playing');
    }

    return hunt;
  }

  private async requireHuntVersion(huntId: number, version: number): Promise<HydratedDocument<IHuntVersion>> {
    const huntVersion = await HuntVersionModel.findPublishedVersion(huntId, version);

    if (!huntVersion) {
      throw new NotFoundError('Hunt version not found');
    }

    return huntVersion;
  }

  private buildStepResponse(
    sessionId: string,
    step: HydratedDocument<IStep>,
    huntVersion: HydratedDocument<IHuntVersion>,
    stepProgress?: IStepProgress,
  ): StepResponse {
    const stepIndex = StepNavigator.getStepIndex(huntVersion.stepOrder, step.stepId);
    const nextStepId = StepNavigator.getNextStepId(huntVersion.stepOrder, step.stepId);

    const stepPF = PlayerExporter.maybeRandomizeOptions(
      PlayerExporter.step(step as unknown as Parameters<typeof PlayerExporter.step>[0]),
    );

    return {
      step: stepPF,
      stepIndex,
      totalSteps: huntVersion.stepOrder.length,
      attempts: stepProgress?.attempts ?? 0,
      maxAttempts: step.maxAttempts ?? null,
      hintsUsed: stepProgress?.hintsUsed ?? 0,
      maxHints: 1,
      _links: {
        self: { href: `/api/play/sessions/${sessionId}/step/${step.stepId}` },
        ...(nextStepId !== null && { next: { href: `/api/play/sessions/${sessionId}/step/${nextStepId}` } }),
        validate: { href: `/api/play/sessions/${sessionId}/validate` },
      },
    };
  }
}
