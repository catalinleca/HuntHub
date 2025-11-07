import { AuthorizationService } from '@/services/authorization/authorization.service';
import { HuntModel, HuntAccessModel } from '@/database/models';
import { NotFoundError, ForbiddenError } from '@/shared/errors';
import { createTestHunt } from '../../setup/factories/hunt.factory';
import { createTestUser } from '../../setup/factories/user.factory';
import { IUser } from '@/database/types/User';
import { IHunt } from '@/database/types/Hunt';

describe('AuthorizationService Unit Tests', () => {
  let authService: AuthorizationService;
  let owner: IUser;
  let adminUser: IUser;
  let viewUser: IUser;
  let noAccessUser: IUser;
  let testHunt: IHunt;

  beforeEach(async () => {
    authService = new AuthorizationService();

    // Create test users
    owner = await createTestUser({ email: 'owner@example.com' });
    adminUser = await createTestUser({ email: 'admin@example.com' });
    viewUser = await createTestUser({ email: 'viewer@example.com' });
    noAccessUser = await createTestUser({ email: 'noaccess@example.com' });

    // Create test hunt
    testHunt = await createTestHunt({
      creatorId: owner.id,
      name: 'Authorization Test Hunt',
    });

    // Set up access permissions
    await HuntAccessModel.create({
      huntId: testHunt.huntId,
      ownerId: owner.id,
      sharedWithId: adminUser.id,
      sharedBy: owner.id,
      permission: 'admin',
    });

    await HuntAccessModel.create({
      huntId: testHunt.huntId,
      ownerId: owner.id,
      sharedWithId: viewUser.id,
      sharedBy: owner.id,
      permission: 'view',
    });
  });

  describe('getAccess', () => {
    it('should return owner context for hunt creator', async () => {
      const access = await authService.getAccess(testHunt.huntId, owner.id);

      expect(access).not.toBeNull();
      expect(access?.permission).toBe('owner');
      expect(access?.isOwner).toBe(true);
      expect(access?.canEdit).toBe(true);
      expect(access?.canPublish).toBe(true);
      expect(access?.canRelease).toBe(true);
      expect(access?.canDelete).toBe(true);
      expect(access?.canShare).toBe(true);
      expect(access?.huntDoc.huntId).toBe(testHunt.huntId);
      expect(access?.userId).toBe(owner.id);
    });

    it('should return admin context for user with admin permission', async () => {
      const access = await authService.getAccess(testHunt.huntId, adminUser.id);

      expect(access).not.toBeNull();
      expect(access?.permission).toBe('admin');
      expect(access?.isOwner).toBe(false);
      expect(access?.canEdit).toBe(true);
      expect(access?.canPublish).toBe(true);
      expect(access?.canRelease).toBe(true);
      expect(access?.canDelete).toBe(false); // Admin cannot delete
      expect(access?.canShare).toBe(true);
      expect(access?.huntDoc.huntId).toBe(testHunt.huntId);
      expect(access?.userId).toBe(adminUser.id);
    });

    it('should return view context for user with view permission', async () => {
      const access = await authService.getAccess(testHunt.huntId, viewUser.id);

      expect(access).not.toBeNull();
      expect(access?.permission).toBe('view');
      expect(access?.isOwner).toBe(false);
      expect(access?.canEdit).toBe(false);
      expect(access?.canPublish).toBe(false);
      expect(access?.canRelease).toBe(false);
      expect(access?.canDelete).toBe(false);
      expect(access?.canShare).toBe(false);
      expect(access?.huntDoc.huntId).toBe(testHunt.huntId);
      expect(access?.userId).toBe(viewUser.id);
    });

    it('should return null for user without access', async () => {
      const access = await authService.getAccess(testHunt.huntId, noAccessUser.id);

      expect(access).toBeNull();
    });

    it('should return null when hunt does not exist', async () => {
      const access = await authService.getAccess(99999, owner.id);

      expect(access).toBeNull();
    });

    it('should return null for deleted hunt', async () => {
      // Mark hunt as deleted
      await HuntModel.updateOne({ huntId: testHunt.huntId }, { isDeleted: true });

      const access = await authService.getAccess(testHunt.huntId, owner.id);

      expect(access).toBeNull();
    });
  });

  describe('requireAccess', () => {
    describe('Owner permissions', () => {
      it('should allow owner to require owner permission', async () => {
        const access = await authService.requireAccess(testHunt.huntId, owner.id, 'owner');

        expect(access.permission).toBe('owner');
        expect(access.isOwner).toBe(true);
      });

      it('should allow owner to require admin permission', async () => {
        const access = await authService.requireAccess(testHunt.huntId, owner.id, 'admin');

        expect(access.permission).toBe('owner');
        expect(access.isOwner).toBe(true);
      });

      it('should allow owner to require view permission', async () => {
        const access = await authService.requireAccess(testHunt.huntId, owner.id, 'view');

        expect(access.permission).toBe('owner');
        expect(access.isOwner).toBe(true);
      });
    });

    describe('Admin permissions', () => {
      it('should allow admin to require admin permission', async () => {
        const access = await authService.requireAccess(testHunt.huntId, adminUser.id, 'admin');

        expect(access.permission).toBe('admin');
        expect(access.isOwner).toBe(false);
      });

      it('should allow admin to require view permission', async () => {
        const access = await authService.requireAccess(testHunt.huntId, adminUser.id, 'view');

        expect(access.permission).toBe('admin');
        expect(access.isOwner).toBe(false);
      });

      it('should NOT allow admin to require owner permission', async () => {
        try {
          await authService.requireAccess(testHunt.huntId, adminUser.id, 'owner');
          fail('Should have thrown ForbiddenError');
        } catch (error: any) {
          expect(error.statusCode).toBe(403);
          expect(error.message).toContain('owner permission required');
        }
      });
    });

    describe('View permissions', () => {
      it('should allow view user to require view permission', async () => {
        const access = await authService.requireAccess(testHunt.huntId, viewUser.id, 'view');

        expect(access.permission).toBe('view');
        expect(access.isOwner).toBe(false);
      });

      it('should NOT allow view user to require admin permission', async () => {
        try {
          await authService.requireAccess(testHunt.huntId, viewUser.id, 'admin');
          fail('Should have thrown ForbiddenError');
        } catch (error: any) {
          expect(error.statusCode).toBe(403);
          expect(error.message).toContain('admin permission required');
        }
      });

      it('should NOT allow view user to require owner permission', async () => {
        try {
          await authService.requireAccess(testHunt.huntId, viewUser.id, 'owner');
          fail('Should have thrown ForbiddenError');
        } catch (error: any) {
          expect(error.statusCode).toBe(403);
          expect(error.message).toContain('owner permission required');
        }
      });
    });

    describe('No access', () => {
      it('should throw NotFoundError when user has no access', async () => {
        try {
          await authService.requireAccess(testHunt.huntId, noAccessUser.id, 'view');
          fail('Should have thrown NotFoundError');
        } catch (error: any) {
          expect(error.statusCode).toBe(404);
          expect(error.message).toContain('Hunt not found or access denied');
        }
      });

      it('should throw NotFoundError when hunt does not exist', async () => {
        try {
          await authService.requireAccess(99999, owner.id, 'view');
          fail('Should have thrown NotFoundError');
        } catch (error: any) {
          expect(error.statusCode).toBe(404);
          expect(error.message).toContain('Hunt not found or access denied');
        }
      });
    });
  });

  describe('canAccess', () => {
    describe('Owner permissions', () => {
      it('should return true when owner can access as owner', async () => {
        const can = await authService.canAccess(testHunt.huntId, owner.id, 'owner');

        expect(can).toBe(true);
      });

      it('should return true when owner can access as admin', async () => {
        const can = await authService.canAccess(testHunt.huntId, owner.id, 'admin');

        expect(can).toBe(true);
      });

      it('should return true when owner can access as view', async () => {
        const can = await authService.canAccess(testHunt.huntId, owner.id, 'view');

        expect(can).toBe(true);
      });
    });

    describe('Admin permissions', () => {
      it('should return false when admin cannot access as owner', async () => {
        const can = await authService.canAccess(testHunt.huntId, adminUser.id, 'owner');

        expect(can).toBe(false);
      });

      it('should return true when admin can access as admin', async () => {
        const can = await authService.canAccess(testHunt.huntId, adminUser.id, 'admin');

        expect(can).toBe(true);
      });

      it('should return true when admin can access as view', async () => {
        const can = await authService.canAccess(testHunt.huntId, adminUser.id, 'view');

        expect(can).toBe(true);
      });
    });

    describe('View permissions', () => {
      it('should return false when view user cannot access as owner', async () => {
        const can = await authService.canAccess(testHunt.huntId, viewUser.id, 'owner');

        expect(can).toBe(false);
      });

      it('should return false when view user cannot access as admin', async () => {
        const can = await authService.canAccess(testHunt.huntId, viewUser.id, 'admin');

        expect(can).toBe(false);
      });

      it('should return true when view user can access as view', async () => {
        const can = await authService.canAccess(testHunt.huntId, viewUser.id, 'view');

        expect(can).toBe(true);
      });
    });

    describe('No access', () => {
      it('should return false when user has no access', async () => {
        const can = await authService.canAccess(testHunt.huntId, noAccessUser.id, 'view');

        expect(can).toBe(false);
      });

      it('should return false when hunt does not exist', async () => {
        const can = await authService.canAccess(99999, owner.id, 'view');

        expect(can).toBe(false);
      });
    });
  });

  describe('Permission hierarchy', () => {
    it('should respect owner > admin > view hierarchy', async () => {
      // Owner has all permissions
      expect(await authService.canAccess(testHunt.huntId, owner.id, 'owner')).toBe(true);
      expect(await authService.canAccess(testHunt.huntId, owner.id, 'admin')).toBe(true);
      expect(await authService.canAccess(testHunt.huntId, owner.id, 'view')).toBe(true);

      // Admin has admin + view, not owner
      expect(await authService.canAccess(testHunt.huntId, adminUser.id, 'owner')).toBe(false);
      expect(await authService.canAccess(testHunt.huntId, adminUser.id, 'admin')).toBe(true);
      expect(await authService.canAccess(testHunt.huntId, adminUser.id, 'view')).toBe(true);

      // View only has view
      expect(await authService.canAccess(testHunt.huntId, viewUser.id, 'owner')).toBe(false);
      expect(await authService.canAccess(testHunt.huntId, viewUser.id, 'admin')).toBe(false);
      expect(await authService.canAccess(testHunt.huntId, viewUser.id, 'view')).toBe(true);
    });
  });

  describe('AccessContext flags', () => {
    it('should set correct action flags for owner', async () => {
      const access = await authService.getAccess(testHunt.huntId, owner.id);

      expect(access?.canEdit).toBe(true);
      expect(access?.canPublish).toBe(true);
      expect(access?.canRelease).toBe(true);
      expect(access?.canDelete).toBe(true);
      expect(access?.canShare).toBe(true);
    });

    it('should set correct action flags for admin', async () => {
      const access = await authService.getAccess(testHunt.huntId, adminUser.id);

      expect(access?.canEdit).toBe(true);
      expect(access?.canPublish).toBe(true);
      expect(access?.canRelease).toBe(true);
      expect(access?.canDelete).toBe(false); // Only owner can delete
      expect(access?.canShare).toBe(true);
    });

    it('should set correct action flags for view user', async () => {
      const access = await authService.getAccess(testHunt.huntId, viewUser.id);

      expect(access?.canEdit).toBe(false);
      expect(access?.canPublish).toBe(false);
      expect(access?.canRelease).toBe(false);
      expect(access?.canDelete).toBe(false);
      expect(access?.canShare).toBe(false);
    });
  });
});
