import { inject, injectable } from 'inversify';
import { Types } from 'mongoose';
import { PlayerInvitation, HuntPermission, HuntAccessMode, PreviewLinkResponse } from '@hunthub/shared';
import { TYPES } from '@/shared/types';
import { IAuthorizationService } from '@/services/authorization/authorization.service';
import PlayerInvitationModel from '@/database/models/PlayerInvitation';
import HuntModel from '@/database/models/Hunt';
import { PlayerInvitationMapper } from '@/shared/mappers';
import { ConflictError, ValidationError } from '@/shared/errors';
import { PreviewTokenHelper } from '@/features/play/helpers/preview-token.helper';
import { playerBaseUrl } from '@/config/env.config';

export interface IPlayerInvitationService {
  invitePlayer(huntId: number, email: string, userId: string): Promise<PlayerInvitation>;
  listInvitations(huntId: number, userId: string): Promise<PlayerInvitation[]>;
  revokeInvitation(huntId: number, email: string, userId: string): Promise<void>;
  updateAccessMode(huntId: number, accessMode: HuntAccessMode, userId: string): Promise<void>;
  getPreviewLink(huntId: number, userId: string): Promise<PreviewLinkResponse>;
}

@injectable()
export class PlayerInvitationService implements IPlayerInvitationService {
  constructor(@inject(TYPES.AuthorizationService) private authService: IAuthorizationService) {}

  async invitePlayer(huntId: number, email: string, userId: string): Promise<PlayerInvitation> {
    await this.authService.requireAccess(huntId, userId, HuntPermission.Admin);

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await PlayerInvitationModel.findOne({ huntId, email: normalizedEmail });
    if (existing) {
      throw new ConflictError('Player is already invited');
    }

    const invitation = await PlayerInvitationModel.create({
      huntId,
      email: normalizedEmail,
      invitedBy: new Types.ObjectId(userId),
    });

    return PlayerInvitationMapper.toDTO(invitation);
  }

  async listInvitations(huntId: number, userId: string): Promise<PlayerInvitation[]> {
    await this.authService.requireAccess(huntId, userId, HuntPermission.View);

    const invitations = await PlayerInvitationModel.findByHunt(huntId);

    return invitations.map(PlayerInvitationMapper.toDTO);
  }

  async revokeInvitation(huntId: number, email: string, userId: string): Promise<void> {
    await this.authService.requireAccess(huntId, userId, HuntPermission.Admin);

    const normalizedEmail = email.toLowerCase().trim();

    const result = await PlayerInvitationModel.deleteOne({ huntId, email: normalizedEmail });
    if (result.deletedCount === 0) {
      throw new ValidationError('Invitation not found', []);
    }
  }

  async updateAccessMode(huntId: number, accessMode: HuntAccessMode, userId: string): Promise<void> {
    await this.authService.requireAccess(huntId, userId, HuntPermission.Admin);

    const result = await HuntModel.updateOne({ huntId, isDeleted: false }, { accessMode });
    if (result.matchedCount === 0) {
      throw new ValidationError('Hunt not found', []);
    }
  }

  async getPreviewLink(huntId: number, userId: string): Promise<PreviewLinkResponse> {
    const access = await this.authService.requireAccess(huntId, userId, HuntPermission.View);

    const { token, expiresIn } = PreviewTokenHelper.generate(huntId);

    const url = new URL(`/play/${access.huntDoc.playSlug}`, playerBaseUrl);
    url.searchParams.set('preview', token);

    return { previewUrl: url.toString(), expiresIn };
  }
}
