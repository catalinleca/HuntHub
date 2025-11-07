import { inject, injectable } from 'inversify';
import { ShareResult, Collaborator } from '@hunthub/shared';
import { TYPES } from '@/shared/types';
import { IAuthorizationService } from '@/services/authorization/authorization.service';
import { HuntAccessModel, UserModel } from '@/database/models';
import { HuntPermission } from '@/database/types/HuntAccess';
import { NotFoundError, ForbiddenError, ValidationError } from '@/shared/errors';
import { HuntShareMapper } from '@/shared/mappers';

export interface IHuntShareService {
  shareHunt(huntId: number, sharedWithEmail: string, permission: HuntPermission, userId: string): Promise<ShareResult>;
  updatePermission(
    huntId: number,
    sharedWithId: string,
    permission: HuntPermission,
    userId: string,
  ): Promise<ShareResult>;
  revokeAccess(huntId: number, sharedWithId: string, userId: string): Promise<void>;
  listCollaborators(huntId: number, userId: string): Promise<Collaborator[]>;
}

@injectable()
export class HuntShareService implements IHuntShareService {
  constructor(@inject(TYPES.AuthorizationService) private authService: IAuthorizationService) {}

  private async validateShareTarget(
    sharedWithId: string,
    userId: string,
    creatorId: string,
    requireUserExists = true,
  ): Promise<void> {
    if (requireUserExists) {
      const targetUser = await UserModel.findById(sharedWithId);
      if (!targetUser) {
        throw new NotFoundError('User not found');
      }
    }

    if (sharedWithId === userId) {
      throw new ValidationError('You cannot share a hunt with yourself', []);
    }

    if (sharedWithId === creatorId) {
      throw new ValidationError('You cannot share a hunt with the creator', []);
    }
  }

  async shareHunt(
    huntId: number,
    sharedWithEmail: string,
    permission: HuntPermission,
    userId: string,
  ): Promise<ShareResult> {
    const access = await this.authService.requireAccess(huntId, userId, 'admin');
    if (!access.canShare) {
      throw new ForbiddenError('You do not have permission to share this hunt');
    }

    const creatorId = access.huntDoc.creatorId.toString();

    const targetUser = await UserModel.findOne({ email: sharedWithEmail });
    if (!targetUser) {
      throw new NotFoundError('User not found: ' + sharedWithEmail);
    }

    const sharedWithId = targetUser._id.toString();

    await this.validateShareTarget(sharedWithId, userId, creatorId);

    const share = await HuntAccessModel.shareHunt(huntId, creatorId, sharedWithId, userId, permission);

    return HuntShareMapper.toShareResult(share);
  }

  async updatePermission(
    huntId: number,
    sharedWithId: string,
    permission: HuntPermission,
    userId: string,
  ): Promise<ShareResult> {
    const access = await this.authService.requireAccess(huntId, userId, 'admin');

    if (!access.canShare) {
      throw new ForbiddenError('Insufficient permission to update permissions');
    }

    const creatorId = access.huntDoc.creatorId.toString();

    await this.validateShareTarget(sharedWithId, userId, creatorId);

    const updatedShare = await HuntAccessModel.updatePermission(huntId, sharedWithId, permission);

    if (!updatedShare) {
      throw new NotFoundError('Share not found');
    }

    return HuntShareMapper.toShareResult(updatedShare);
  }

  async revokeAccess(huntId: number, sharedWithId: string, userId: string): Promise<void> {
    const access = await this.authService.requireAccess(huntId, userId, 'admin');
    if (!access.canShare) {
      throw new ForbiddenError('Insufficient permission to revoke access');
    }

    await this.validateShareTarget(sharedWithId, userId, access.huntDoc.creatorId.toString());

    const revokedShare = await HuntAccessModel.revokeAccess(huntId, sharedWithId);
    if (!revokedShare) {
      throw new NotFoundError('Share not found');
    }
  }

  async listCollaborators(huntId: number, userId: string): Promise<Collaborator[]> {
    await this.authService.requireAccess(huntId, userId, 'view');

    const shares = await HuntAccessModel.findHuntCollaborators(huntId);

    return shares.map((share) =>
      HuntShareMapper.toCollaborator(share, share.sharedWithId as any, share.sharedBy as any),
    );
  }
}
