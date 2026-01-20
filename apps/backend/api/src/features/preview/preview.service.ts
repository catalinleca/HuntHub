import { injectable, inject } from 'inversify';
import { SessionResponse, HuntPermission, PlayerExporter, HuntProgressStatus } from '@hunthub/shared';
import HuntModel from '@/database/models/Hunt';
import HuntVersionModel from '@/database/models/HuntVersion';
import { TYPES } from '@/shared/types';
import { IAuthorizationService } from '@/services/authorization/authorization.service';
import { NotFoundError, UnauthorizedError, ValidationError } from '@/shared/errors';
import { createPreviewToken, verifyPreviewToken, TOKEN_EXPIRATION_SECONDS } from '@/shared/utils/previewToken';
import { playerUrl } from '@/config/env.config';
import { logger } from '@/utils/logger';
import { SessionManager } from '@/features/play/helpers/session-manager.helper';

export interface PreviewLinkResponse {
  previewUrl: string;
  expiresIn: number;
}

export interface PreviewSessionResponse extends SessionResponse {
  isPreview: true;
  stepOrder: number[];
}

export interface IPreviewService {
  generatePreviewLink(huntId: number, userId: string): Promise<PreviewLinkResponse>;
  startPreviewSession(previewToken: string): Promise<PreviewSessionResponse>;
}

@injectable()
export class PreviewService implements IPreviewService {
  constructor(
    @inject(TYPES.AuthorizationService)
    private authorizationService: IAuthorizationService,
  ) {}

  async generatePreviewLink(huntId: number, userId: string): Promise<PreviewLinkResponse> {
    await this.authorizationService.requireAccess(huntId, userId, HuntPermission.View);

    const token = createPreviewToken(huntId, userId);
    const previewUrl = `${playerUrl}/play/preview?token=${token}`;

    logger.info({ huntId, userId }, 'Preview link generated');

    return {
      previewUrl,
      expiresIn: TOKEN_EXPIRATION_SECONDS,
    };
  }

  async startPreviewSession(previewToken: string): Promise<PreviewSessionResponse> {
    const result = verifyPreviewToken(previewToken);

    if (!result.valid) {
      if (result.reason === 'expired') {
        throw new UnauthorizedError('Preview link has expired. Please generate a new one.');
      }
      throw new UnauthorizedError('Invalid preview link');
    }

    const { huntId, userId } = result.payload;

    await this.authorizationService.requireAccess(huntId, userId, HuntPermission.View);

    const hunt = await HuntModel.findOne({ huntId, isDeleted: false }).exec();
    if (!hunt) {
      throw new NotFoundError('Hunt not found');
    }

    const huntVersion = await HuntVersionModel.findOne({
      huntId,
      version: hunt.latestVersion,
    }).exec();

    if (!huntVersion) {
      throw new NotFoundError('Hunt version not found');
    }

    if (!huntVersion.stepOrder || huntVersion.stepOrder.length === 0) {
      throw new ValidationError('Hunt has no steps to preview', []);
    }

    const firstStepId = huntVersion.stepOrder[0];
    const progress = await SessionManager.createPreviewSession(huntId, hunt.latestVersion, firstStepId, userId);

    logger.info({ huntId, sessionId: progress.sessionId, userId }, 'Preview session started');

    return {
      sessionId: progress.sessionId,
      hunt: PlayerExporter.hunt(huntId, huntVersion),
      status: HuntProgressStatus.InProgress,
      currentStepId: progress.currentStepId,
      currentStepIndex: 0,
      totalSteps: huntVersion.stepOrder.length,
      startedAt: progress.startedAt.toISOString(),
      isPreview: true,
      stepOrder: huntVersion.stepOrder,
    };
  }
}
