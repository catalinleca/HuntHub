import { injectable } from 'inversify';
import { HydratedDocument } from 'mongoose';
import { HuntPermission } from '@hunthub/shared';
import { HuntModel, HuntAccessModel } from '@/database/models';
import { IHunt } from '@/database/types/Hunt';
import { NotFoundError, ForbiddenError } from '@/shared/errors';

export interface AccessContext {
  huntDoc: HydratedDocument<IHunt>;
  userId: string;
  permission: HuntPermission;
  isOwner: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canRelease: boolean;
  canDelete: boolean;
  canShare: boolean;
  canClone: boolean;
}

const PERMISSION_HIERARCHY: Record<HuntPermission, number> = {
  [HuntPermission.View]: 1,
  [HuntPermission.Admin]: 3,
  [HuntPermission.Owner]: 5,
};

export interface IAuthorizationService {
  getAccess(huntId: number, userId: string): Promise<AccessContext | null>;
  requireAccess(huntId: number, userId: string, permission: HuntPermission): Promise<AccessContext>;
  canAccess(huntId: number, userId: string, requiredPermission: HuntPermission): Promise<boolean>;
}

@injectable()
export class AuthorizationService implements IAuthorizationService {
  async getAccess(huntId: number, userId: string): Promise<AccessContext | null> {
    const huntDoc = await HuntModel.findOne({ huntId, isDeleted: false }).exec();
    if (!huntDoc) {
      return null;
    }

    const isOwner = huntDoc.creatorId.toString() === userId;
    if (isOwner) {
      return this.createOwnerContext(huntDoc, userId);
    }

    const permission = await HuntAccessModel.getPermission(huntId, userId);
    if (!permission) {
      return null;
    }

    return this.createSharedContext(huntDoc, userId, permission);
  }

  async requireAccess(huntId: number, userId: string, requiredPermission: HuntPermission): Promise<AccessContext> {
    const access = await this.getAccess(huntId, userId);
    if (!access) {
      throw new NotFoundError('Hunt not found or access denied');
    }

    if (!this.hasPermission(access.permission, requiredPermission)) {
      throw new ForbiddenError(`${requiredPermission} permission required (you have ${access.permission})`);
    }

    return access;
  }

  async canAccess(huntId: number, userId: string, requiredPermission: HuntPermission): Promise<boolean> {
    const access = await this.getAccess(huntId, userId);

    return access ? this.hasPermission(access.permission, requiredPermission) : false;
  }

  private hasPermission(userPermission: HuntPermission, requiredPermission: HuntPermission): boolean {
    return PERMISSION_HIERARCHY[userPermission] >= PERMISSION_HIERARCHY[requiredPermission];
  }

  private createOwnerContext(huntDoc: HydratedDocument<IHunt>, userId: string): AccessContext {
    return {
      huntDoc,
      userId,
      permission: HuntPermission.Owner,
      isOwner: true,
      canEdit: true,
      canPublish: true,
      canRelease: true,
      canDelete: true,
      canShare: true,
      canClone: true,
    };
  }

  private createSharedContext(
    huntDoc: HydratedDocument<IHunt>,
    userId: string,
    permission: HuntPermission,
  ): AccessContext {
    const isAdmin = permission === HuntPermission.Admin;
    return {
      huntDoc,
      userId,
      permission,
      isOwner: false,
      canEdit: isAdmin,
      canPublish: isAdmin,
      canRelease: isAdmin,
      canDelete: false,
      canShare: isAdmin,
      canClone: true,
    };
  }
}
