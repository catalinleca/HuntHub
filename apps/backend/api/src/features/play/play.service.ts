import { injectable, inject } from 'inversify';
import { HydratedDocument, Types } from 'mongoose';
import {
  SessionResponse,
  StepResponse,
  ValidateAnswerRequest,
  ValidateAnswerResponse,
  HintResponse,
  PlayerExporter,
  HuntProgressStatus,
  Step,
  AssetCreate,
} from '@hunthub/shared';
import HuntModel from '@/database/models/Hunt';
import HuntVersionModel from '@/database/models/HuntVersion';
import AssetModel from '@/database/models/Asset';
import PlayerInvitationModel from '@/database/models/PlayerInvitation';
import HuntAccessModel from '@/database/models/HuntAccess';
import { HuntAccessMode } from '@hunthub/shared';
import { IHunt } from '@/database/types/Hunt';
import { IHuntVersion } from '@/database/types/HuntVersion';
import { IStep } from '@/database/types/Step';
import { IStepProgress } from '@/database/types/Progress';
import { NotFoundError, ForbiddenError, ConflictError, ValidationError } from '@/shared/errors';
import { logger } from '@/utils/logger';
import { withTransaction } from '@/shared/utils/transaction';
import { isDev } from '@/config/env.config';
import { TYPES } from '@/shared/types';
import { IStorageService } from '@/services/storage/storage.service';
import { ALLOWED_EXTENSIONS, isAllowedMimeType, getBaseMimeType } from '@/shared/utils/mimeTypes';
import { awsS3Bucket } from '@/config/env.config';
import { SYSTEM_USER_ID } from '@/shared/constants';
import { AssetMapper, AssetDTO } from '@/shared/mappers/asset.mapper';
import { SessionManager } from './helpers/session-manager.helper';
import { StepNavigator } from './helpers/step-navigator.helper';
import { AnswerValidator } from './helpers/answer-validator.helper';

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export interface DiscoverHuntsResponse {
  hunts: Array<{
    huntId: number;
    name: string;
    description?: string;
    totalSteps: number;
  }>;
  total: number;
}

export interface UploadUrlResponse {
  signedUrl: string;
  publicUrl: string;
  s3Key: string;
}

export interface IPlayService {
  discoverHunts(page: number, limit: number): Promise<DiscoverHuntsResponse>;
  startSession(playSlug: string, playerName: string, email?: string, userId?: string): Promise<SessionResponse>;
  getSession(sessionId: string): Promise<SessionResponse>;
  getStep(sessionId: string, stepId: number): Promise<StepResponse>;
  validateAnswer(sessionId: string, request: ValidateAnswerRequest): Promise<ValidateAnswerResponse>;
  requestHint(sessionId: string): Promise<HintResponse>;
  requestUpload(sessionId: string, extension: string): Promise<UploadUrlResponse>;
  createAsset(sessionId: string, assetData: AssetCreate): Promise<AssetDTO>;
}

@injectable()
export class PlayService implements IPlayService {
  constructor(
    @inject(TYPES.StorageService)
    private storageService: IStorageService,
  ) {}

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

    const versionQueries = hunts.map((h) => ({ huntId: h.huntId, version: h.liveVersion }));
    const versions = await HuntVersionModel.find({ $or: versionQueries }).lean();

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

  async startSession(playSlug: string, playerName: string, email?: string, userId?: string): Promise<SessionResponse> {
    const hunt = await this.requireLiveHuntBySlug(playSlug);
    const liveVersion = hunt.liveVersion!;

    await this.checkAccessMode(hunt, hunt.accessMode, email, userId);

    const huntVersion = await this.requireHuntVersion(hunt.huntId, liveVersion);
    if (!huntVersion) {
      throw new NotFoundError('Live hunt version not found');
    }

    if (!huntVersion.stepOrder.length) {
      throw new ValidationError('This hunt has no steps to play', []);
    }

    const firstStepId = huntVersion.stepOrder[0];
    const progress = await SessionManager.createSession(hunt.huntId, liveVersion, playerName, firstStepId, userId);

    return {
      sessionId: progress.sessionId,
      hunt: PlayerExporter.hunt(hunt.huntId, huntVersion),
      status: HuntProgressStatus.InProgress,
      currentStepIndex: 0,
      currentStepId: firstStepId,
      totalSteps: huntVersion.stepOrder.length,
      startedAt: progress.startedAt.toISOString(),
    };
  }

  async getSession(sessionId: string): Promise<SessionResponse> {
    const progress = await SessionManager.requireSession(sessionId);
    const huntVersion = await this.requireHuntVersion(progress.huntId, progress.version);

    const currentIndex = StepNavigator.getStepIndex(huntVersion.stepOrder, progress.currentStepId);
    const isInProgress = progress.status === HuntProgressStatus.InProgress;

    return {
      sessionId: progress.sessionId,
      hunt: PlayerExporter.hunt(progress.huntId, huntVersion),
      status: progress.status,
      currentStepIndex: currentIndex,
      currentStepId: isInProgress ? progress.currentStepId : null,
      totalSteps: huntVersion.stepOrder.length,
      startedAt: progress.startedAt.toISOString(),
      completedAt: progress.completedAt?.toISOString(),
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
    const isLastStep = StepNavigator.isLastStep(huntVersion.stepOrder, progress.currentStepId);

    let expired = false;
    let exhausted = false;

    if (step.timeLimit && stepProgress?.startedAt) {
      const elapsedSeconds = (Date.now() - stepProgress.startedAt.getTime()) / 1000;
      expired = elapsedSeconds > step.timeLimit;
    }

    const currentAttempts = stepProgress?.attempts ?? 0;
    if (step.maxAttempts && currentAttempts >= step.maxAttempts) {
      exhausted = true;
    }

    const validationResult = await AnswerValidator.validate(request.answerType, request.payload, step);

    logger.debug(
      {
        sessionId,
        stepId: progress.currentStepId,
        answerType: request.answerType,
        isCorrect: validationResult.isCorrect,
      },
      'Validation result',
    );

    return withTransaction(async (session) => {
      const newAttempts = await SessionManager.incrementAttempts(sessionId, progress.currentStepId, session);

      const metadata = {
        ...(validationResult.transcript && { transcript: validationResult.transcript }),
        ...(validationResult.confidence && { confidence: validationResult.confidence }),
      };

      await SessionManager.recordSubmission(
        sessionId,
        progress.currentStepId,
        request.payload,
        validationResult.isCorrect,
        validationResult.feedback,
        metadata,
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
        attempts: newAttempts,
        maxAttempts: step.maxAttempts ?? undefined,
        isComplete: isComplete || undefined,
        expired: expired || undefined,
        exhausted: exhausted || undefined,
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

    const maxHints = 1;
    const hintsUsed = await SessionManager.incrementHintsUsedIfUnderLimit(sessionId, progress.currentStepId, maxHints);

    if (hintsUsed === null) {
      throw new ConflictError('You have already used your hint for this step');
    }

    return {
      hint: step.hint,
      hintsUsed,
      maxHints,
    };
  }

  private async requireLiveHuntBySlug(playSlug: string): Promise<HydratedDocument<IHunt>> {
    const hunt = await HuntModel.findOne({ playSlug, isDeleted: false });

    if (!hunt) {
      throw new NotFoundError('Hunt not found');
    }

    if (hunt.liveVersion === null || hunt.liveVersion === undefined) {
      throw new ForbiddenError('This hunt is not currently available for playing');
    }

    return hunt;
  }

  private async checkAccessMode(
    hunt: HydratedDocument<IHunt>,
    accessMode: HuntAccessMode,
    email?: string,
    userId?: string,
  ): Promise<void> {
    if (!accessMode || accessMode === HuntAccessMode.Open) {
      return;
    }

    const isCreator = userId != null && hunt.creatorId.toString() === userId;
    if (isCreator) {
      return;
    }

    if (userId != null) {
      const hasCollaboratorAccess = await HuntAccessModel.hasAccess(hunt.huntId, userId);
      if (hasCollaboratorAccess) {
        return;
      }
    }

    if (email != null) {
      const isInvitedPlayer = await PlayerInvitationModel.isInvited(hunt.huntId, email.toLowerCase().trim());
      if (isInvitedPlayer) {
        return;
      }
    }

    throw new NotFoundError('Hunt not found');
  }

  private async requireHuntVersion(huntId: number, version: number): Promise<HydratedDocument<IHuntVersion>> {
    const huntVersion = isDev
      ? await HuntVersionModel.findOne({ huntId, version })
      : await HuntVersionModel.findPublishedVersion(huntId, version);

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

    const stepPF = PlayerExporter.maybeRandomizeOptions(PlayerExporter.step(step.toObject() as Step));

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

  async requestUpload(sessionId: string, extension: string): Promise<UploadUrlResponse> {
    await SessionManager.requireSession(sessionId);

    if (!ALLOWED_EXTENSIONS.includes(extension.toLowerCase())) {
      throw new ValidationError(`Extension '${extension}' not allowed`, []);
    }

    const { signedUrl, publicUrl, s3Key } = await this.storageService.generateUploadUrls(
      `sessions/${sessionId}`,
      extension,
    );

    return { signedUrl, publicUrl, s3Key };
  }

  async createAsset(sessionId: string, assetData: AssetCreate): Promise<AssetDTO> {
    const progress = await SessionManager.requireSession(sessionId);

    if (!this.storageService.validateS3KeyPrefix(assetData.s3Key, `sessions/${sessionId}/`)) {
      throw new ValidationError('Invalid s3Key for this session', []);
    }

    if (!isAllowedMimeType(assetData.mime)) {
      throw new ValidationError(`MIME type '${assetData.mime}' not allowed`, []);
    }

    if (assetData.sizeBytes > MAX_SIZE_BYTES) {
      throw new ValidationError(`File size exceeds ${MAX_SIZE_BYTES} bytes`, []);
    }

    const url = this.storageService.getPublicUrl(assetData.s3Key);

    const asset = await AssetModel.create({
      ownerId: progress.userId ? new Types.ObjectId(progress.userId) : SYSTEM_USER_ID,
      url,
      mimeType: getBaseMimeType(assetData.mime),
      originalFilename: assetData.name,
      size: assetData.sizeBytes,
      storageLocation: { bucket: awsS3Bucket, path: assetData.s3Key },
    });

    return AssetMapper.fromDocument(asset);
  }
}
