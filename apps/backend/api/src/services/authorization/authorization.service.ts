import { injectable } from 'inversify';
import { HydratedDocument } from 'mongoose';
import { HuntModel, HuntAccessModel } from '@/database/models';
import { IHunt } from '@/database/types/Hunt';
import { HuntPermission } from '@/database/types/HuntAccess';
import { NotFoundError, ForbiddenError } from '@/shared/errors';

export interface AccessContext {
  huntDoc: HydratedDocument<IHunt>;
  userId: string;
  permission: HuntPermission | 'owner';
  isOwner: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canRelease: boolean;
  canDelete: boolean;
  canShare: boolean;
}

const PERMISSION_HIERARCHY: Record<HuntPermission, number> = {
  view: 1,
  admin: 3,
};

export interface IAuthorizationService {
  getAccess(huntId: number, userId: string): Promise<AccessContext | null>;
  requireAccess(huntId: number, userId: string, permission: HuntPermission | 'owner'): Promise<AccessContext>;
  canAccess(huntId: number, userId: string, requiredPermission: HuntPermission | 'owner'): Promise<boolean>;
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

  async requireAccess(
    huntId: number,
    userId: string,
    requiredPermission: HuntPermission | 'owner',
  ): Promise<AccessContext> {
    const access = await this.getAccess(huntId, userId);
    if (!access) {
      throw new ForbiddenError('User does not have access to this hunt');
    }

    if (!this.hasPermission(access.permission, requiredPermission)) {
      throw new ForbiddenError(`${requiredPermission} permission required (you have ${access.permission})`);
    }

    return access;
  }

  async canAccess(huntId: number, userId: string, requiredPermission: HuntPermission | 'owner'): Promise<boolean> {
    const access = await this.getAccess(huntId, userId);

    return access ? this.hasPermission(access.permission, requiredPermission) : false;
  }

  private hasPermission(
    userPermission: HuntPermission | 'owner',
    requiredPermission: HuntPermission | 'owner',
  ): boolean {
    if (userPermission === 'owner') {
      return true;
    }

    if (requiredPermission === 'owner') {
      return false;
    }

    const userPermissionLevel = PERMISSION_HIERARCHY[userPermission];
    const requiredPermissionLevel = PERMISSION_HIERARCHY[requiredPermission];

    return userPermissionLevel >= requiredPermissionLevel;
  }

  private createOwnerContext(huntDoc: HydratedDocument<IHunt>, userId: string): AccessContext {
    return {
      huntDoc,
      userId,
      permission: 'owner',
      isOwner: true,
      canEdit: true,
      canPublish: true,
      canRelease: true,
      canDelete: true,
      canShare: true,
    };
  }

  private createSharedContext(
    huntDoc: HydratedDocument<IHunt>,
    userId: string,
    permission: HuntPermission,
  ): AccessContext {
    return {
      huntDoc,
      userId,
      permission,
      isOwner: false,
      canEdit: permission === 'admin',
      canPublish: permission === 'admin',
      canRelease: permission === 'admin',
      canDelete: false,
      canShare: permission === 'admin',
    };
  }
}
