import { injectable } from 'inversify';
import { HydratedDocument } from 'mongoose';
import {
  StartSessionResponse,
  SessionResponse,
  StepResponse,
  ValidateAnswerRequest,
  ValidateAnswerResponse,
  HintResponse,
} from '@hunthub/shared';
import HuntModel from '@/database/models/Hunt';
import HuntVersionModel from '@/database/models/HuntVersion';
import { IHunt } from '@/database/types/Hunt';
import { IHuntVersion } from '@/database/types/HuntVersion';
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from '@/shared/errors';
import { PlayMapper } from '@/shared/mappers/play.mapper';
import { withTransaction } from '@/shared/utils/transaction';
import { SessionManager } from './helpers/session-manager.helper';
import { StepNavigator } from './helpers/step-navigator.helper';
import { AnswerValidator } from './helpers/answer-validator.helper';

export interface IPlayService {
  startSession(huntId: number, playerName: string, userId?: string): Promise<StartSessionResponse>;
  getSession(sessionId: string): Promise<SessionResponse>;
  getCurrentStep(sessionId: string): Promise<StepResponse>;
  getNextStep(sessionId: string): Promise<StepResponse>;
  validateAnswer(sessionId: string, request: ValidateAnswerRequest): Promise<ValidateAnswerResponse>;
  requestHint(sessionId: string): Promise<HintResponse>;
}

@injectable()
export class PlayService implements IPlayService {
  async startSession(huntId: number, playerName: string, userId?: string): Promise<StartSessionResponse> {
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

    const steps = await StepNavigator.getFirstNSteps(huntId, liveVersion, huntVersion.stepOrder, 2);

    const stepsPF = steps.map((step) => PlayMapper.maybeRandomizeOptions(PlayMapper.toStepPF(step)));

    return {
      sessionId: progress.sessionId,
      hunt: PlayMapper.toHuntMetaPF(huntId, huntVersion),
      currentStepIndex: 0,
      steps: stepsPF,
    };
  }

  async getSession(sessionId: string): Promise<SessionResponse> {
    const progress = await SessionManager.requireSession(sessionId);
    const huntVersion = await this.requireHuntVersion(progress.huntId, progress.version);

    const currentIndex = StepNavigator.getStepIndex(huntVersion.stepOrder, progress.currentStepId);

    return {
      sessionId: progress.sessionId,
      huntId: progress.huntId,
      status: progress.status,
      currentStepIndex: currentIndex,
      totalSteps: huntVersion.stepOrder.length,
      startedAt: progress.startedAt.toISOString(),
      completedAt: progress.completedAt?.toISOString(),
    };
  }

  /**
   * Get current step for session
   */
  async getCurrentStep(sessionId: string): Promise<StepResponse> {
    const progress = await SessionManager.requireSession(sessionId);
    SessionManager.validateSessionActive(progress);

    const huntVersion = await this.requireHuntVersion(progress.huntId, progress.version);
    const step = await StepNavigator.getCurrentStepForSession(progress, huntVersion);

    if (!step) {
      throw new NotFoundError('Current step not found');
    }

    const stepProgress = SessionManager.getCurrentStepProgress(progress);
    const stepIndex = StepNavigator.getStepIndex(huntVersion.stepOrder, progress.currentStepId);

    const stepPF = PlayMapper.maybeRandomizeOptions(PlayMapper.toStepPF(step));

    return {
      step: stepPF,
      stepIndex,
      totalSteps: huntVersion.stepOrder.length,
      attempts: stepProgress?.attempts ?? 0,
      maxAttempts: step.maxAttempts ?? null,
      hintsUsed: stepProgress?.hintsUsed ?? 0,
      maxHints: 1, // MVP: Always 1 hint per step
      _links: StepNavigator.generateStepLinks(sessionId, huntVersion.stepOrder, progress.currentStepId),
    };
  }

  /**
   * Get next step (for prefetching)
   */
  async getNextStep(sessionId: string): Promise<StepResponse> {
    const progress = await SessionManager.requireSession(sessionId);
    SessionManager.validateSessionActive(progress);

    const huntVersion = await this.requireHuntVersion(progress.huntId, progress.version);

    const nextStepId = StepNavigator.getNextStepId(huntVersion.stepOrder, progress.currentStepId);
    if (nextStepId === null) {
      throw new NotFoundError('No next step - you are on the last step');
    }

    const step = await StepNavigator.getStepById(progress.huntId, progress.version, nextStepId);
    if (!step) {
      throw new NotFoundError('Next step not found');
    }

    const stepIndex = StepNavigator.getStepIndex(huntVersion.stepOrder, nextStepId);
    const stepPF = PlayMapper.maybeRandomizeOptions(PlayMapper.toStepPF(step));

    // Next step has no progress yet - it's a prefetch
    return {
      step: stepPF,
      stepIndex,
      totalSteps: huntVersion.stepOrder.length,
      attempts: 0,
      maxAttempts: step.maxAttempts ?? null,
      hintsUsed: 0,
      maxHints: 1,
      _links: StepNavigator.generateStepLinks(sessionId, huntVersion.stepOrder, nextStepId),
    };
  }

  /**
   * Validate player's answer submission
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
    const step = await StepNavigator.getCurrentStepForSession(progress, huntVersion);

    if (!step) {
      throw new NotFoundError('Current step not found');
    }

    const stepProgress = SessionManager.getCurrentStepProgress(progress);
    const currentAttempts = (stepProgress?.attempts ?? 0) + 1;
    const isLastStep = StepNavigator.isLastStep(huntVersion.stepOrder, progress.currentStepId);

    // Check time limit if set
    if (step.timeLimit && stepProgress?.startedAt) {
      const elapsedSeconds = (Date.now() - stepProgress.startedAt.getTime()) / 1000;
      if (elapsedSeconds > step.timeLimit) {
        return this.buildValidateResponse({
          correct: false,
          expired: true,
          attempts: currentAttempts,
          maxAttempts: step.maxAttempts ?? null,
          sessionId,
          isLastStep,
          huntVersion,
          currentStepId: progress.currentStepId,
        });
      }
    }

    // Check max attempts if set
    if (step.maxAttempts && currentAttempts > step.maxAttempts) {
      return this.buildValidateResponse({
        correct: false,
        exhausted: true,
        attempts: currentAttempts - 1, // Don't count this invalid attempt
        maxAttempts: step.maxAttempts,
        sessionId,
        isLastStep,
        huntVersion,
        currentStepId: progress.currentStepId,
      });
    }

    // Validate the answer
    const validationResult = AnswerValidator.validate(request.answerType, request.payload, step);

    // Wrap state updates in transaction
    return withTransaction(async (session) => {
      // Atomically increment attempts
      await SessionManager.incrementAttempts(sessionId, progress.currentStepId, session);

      // Record submission
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
          // Complete the session
          await SessionManager.completeSession(sessionId, progress.currentStepId, session);
          isComplete = true;
        } else {
          // Advance to next step
          const nextStepId = StepNavigator.getNextStepId(huntVersion.stepOrder, progress.currentStepId);
          if (nextStepId !== null) {
            await SessionManager.advanceToNextStep(sessionId, progress.currentStepId, nextStepId, session);
          }
        }
      }

      return this.buildValidateResponse({
        correct: validationResult.isCorrect,
        feedback: validationResult.feedback,
        attempts: currentAttempts,
        maxAttempts: step.maxAttempts ?? null,
        isComplete,
        sessionId,
        isLastStep,
        huntVersion,
        currentStepId: progress.currentStepId,
      });
    });
  }

  /**
   * Request hint for current step
   *
   * MVP: 1 hint per step
   */
  async requestHint(sessionId: string): Promise<HintResponse> {
    const progress = await SessionManager.requireSession(sessionId);
    SessionManager.validateSessionActive(progress);

    const huntVersion = await this.requireHuntVersion(progress.huntId, progress.version);
    const step = await StepNavigator.getCurrentStepForSession(progress, huntVersion);

    if (!step) {
      throw new NotFoundError('Current step not found');
    }

    // Check if step has a hint
    if (!step.hint) {
      throw new NotFoundError('No hint available for this step');
    }

    // Check if hint already used (MVP: max 1)
    const stepProgress = SessionManager.getCurrentStepProgress(progress);
    if ((stepProgress?.hintsUsed ?? 0) >= 1) {
      throw new ConflictError('You have already used your hint for this step');
    }

    // Increment hints used
    const hintsUsed = await SessionManager.incrementHintsUsed(sessionId, progress.currentStepId);

    return {
      hint: step.hint,
      hintsUsed,
      maxHints: 1,
    };
  }

  // ============================================
  // Private Helpers
  // ============================================

  /**
   * Find hunt and verify it's live (has liveVersion)
   */
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

  /**
   * Get HuntVersion or throw NotFoundError
   */
  private async requireHuntVersion(huntId: number, version: number): Promise<HydratedDocument<IHuntVersion>> {
    const huntVersion = await HuntVersionModel.findPublishedVersion(huntId, version);

    if (!huntVersion) {
      throw new NotFoundError('Hunt version not found');
    }

    return huntVersion;
  }

  /**
   * Build ValidateAnswerResponse with HATEOAS links
   */
  private buildValidateResponse(params: {
    correct: boolean;
    feedback?: string;
    attempts: number;
    maxAttempts: number | null;
    isComplete?: boolean;
    expired?: boolean;
    exhausted?: boolean;
    sessionId: string;
    isLastStep: boolean;
    huntVersion: HydratedDocument<IHuntVersion>;
    currentStepId: number;
  }): ValidateAnswerResponse {
    const { correct, feedback, attempts, maxAttempts, isComplete, expired, exhausted, sessionId, isLastStep } = params;

    return {
      correct,
      feedback,
      attempts,
      maxAttempts: maxAttempts ?? undefined,
      isComplete,
      expired,
      exhausted,
      _links: StepNavigator.generateValidateLinks(sessionId, correct, isLastStep, isComplete ?? false),
    };
  }
}
