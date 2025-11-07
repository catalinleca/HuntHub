import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../../setup/testServer';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestHunt } from '../../setup/factories/hunt.factory';
import { mockFirebaseAuth, createTestAuthToken, clearFirebaseAuthMocks } from '../../helpers/authHelper';
import { IUser } from '@/database/types/User';
import { IHunt } from '@/database/types/Hunt';
import HuntAccessModel from '@/database/models/HuntAccess';

describe('Hunt Sharing Integration Tests', () => {
  let app: Express;
  let owner: IUser;
  let adminUser: IUser;
  let viewUser: IUser;
  let targetUser: IUser; // User to share with
  let noAccessUser: IUser;
  let ownerToken: string;
  let adminToken: string;
  let viewToken: string;
  let noAccessToken: string;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    // Create test users
    owner = await createTestUser({ email: 'owner@example.com', firstName: 'Owner' });
    adminUser = await createTestUser({ email: 'admin@example.com', firstName: 'Admin' });
    viewUser = await createTestUser({ email: 'viewer@example.com', firstName: 'Viewer' });
    targetUser = await createTestUser({ email: 'target@example.com', firstName: 'Target' });
    noAccessUser = await createTestUser({ email: 'noaccess@example.com', firstName: 'NoAccess' });

    // Setup auth tokens
    mockFirebaseAuth(owner);
    ownerToken = createTestAuthToken(owner);
    mockFirebaseAuth(adminUser);
    adminToken = createTestAuthToken(adminUser);
    mockFirebaseAuth(viewUser);
    viewToken = createTestAuthToken(viewUser);
    mockFirebaseAuth(noAccessUser);
    noAccessToken = createTestAuthToken(noAccessUser);
  });

  afterEach(() => {
    clearFirebaseAuthMocks();
  });

  describe('POST /api/hunts/:id/share - Share Hunt', () => {
    let testHunt: IHunt;

    beforeEach(async () => {
      testHunt = await createTestHunt({
        creatorId: owner.id,
        name: 'Sharing Test Hunt',
      });

      // Set up existing permissions for some tests
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

    it('should share hunt with admin permission successfully', async () => {
      const response = await request(app)
        .post(`/api/hunts/${testHunt.huntId}/share`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          email: targetUser.email,
          permission: 'admin',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        huntId: testHunt.huntId,
        sharedWithId: targetUser.id,
        permission: 'admin',
        sharedBy: owner.id,
      });
      expect(response.body).toHaveProperty('sharedAt');
    });

    it('should share hunt with view permission successfully', async () => {
      const response = await request(app)
        .post(`/api/hunts/${testHunt.huntId}/share`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          email: targetUser.email,
          permission: 'view',
        })
        .expect(200);

      expect(response.body.permission).toBe('view');
    });

    it('should allow admin user to share hunt', async () => {
      const response = await request(app)
        .post(`/api/hunts/${testHunt.huntId}/share`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: targetUser.email,
          permission: 'view',
        })
        .expect(200);

      expect(response.body.sharedBy).toBe(adminUser.id);
    });

    it('should return 404 when sharing with non-existent user', async () => {
      const response = await request(app)
        .post(`/api/hunts/${testHunt.huntId}/share`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          email: 'nonexistent@example.com',
          permission: 'admin',
        })
        .expect(404);

      expect(response.body.message).toContain('User not found');
    });

    it('should return 400 when trying to share hunt with yourself', async () => {
      const response = await request(app)
        .post(`/api/hunts/${testHunt.huntId}/share`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          email: owner.email, // Sharing with self
          permission: 'admin',
        })
        .expect(400);

      expect(response.body.message).toContain('cannot share a hunt with yourself');
    });

    it('should return 400 when trying to share hunt with creator (if different from requester)', async () => {
      const response = await request(app)
        .post(`/api/hunts/${testHunt.huntId}/share`)
        .set('Authorization', `Bearer ${adminToken}`) // Admin trying to share with owner
        .send({
          email: owner.email,
          permission: 'admin',
        })
        .expect(400);

      expect(response.body.message).toContain('cannot share a hunt with the creator');
    });

    it('should return 403 when view user tries to share', async () => {
      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/share`)
        .set('Authorization', `Bearer ${viewToken}`)
        .send({
          email: targetUser.email,
          permission: 'view',
        })
        .expect(403);
    });

    it('should return 404 when user has no access to hunt', async () => {
      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/share`)
        .set('Authorization', `Bearer ${noAccessToken}`)
        .send({
          email: targetUser.email,
          permission: 'view',
        })
        .expect(404);
    });

    it('should return 401 when no auth token provided', async () => {
      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/share`)
        .send({
          email: targetUser.email,
          permission: 'admin',
        })
        .expect(401);
    });

    it('should return 404 when hunt does not exist', async () => {
      await request(app)
        .post('/api/hunts/99999/share')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          email: targetUser.email,
          permission: 'admin',
        })
        .expect(404);
    });

    it('should update existing share if already shared with user', async () => {
      // First share with view permission
      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/share`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          email: targetUser.email,
          permission: 'view',
        })
        .expect(200);

      // Share again with admin permission (should update)
      const response = await request(app)
        .post(`/api/hunts/${testHunt.huntId}/share`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          email: targetUser.email,
          permission: 'admin',
        })
        .expect(200);

      expect(response.body.permission).toBe('admin');

      // Verify only one share record exists
      const shares = await HuntAccessModel.find({
        huntId: testHunt.huntId,
        sharedWithId: targetUser.id,
      });
      expect(shares.length).toBe(1);
    });
  });

  describe('GET /api/hunts/:id/collaborators - List Collaborators', () => {
    let testHunt: IHunt;

    beforeEach(async () => {
      testHunt = await createTestHunt({
        creatorId: owner.id,
        name: 'Collaborators Test Hunt',
      });

      // Share with multiple users
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

    it('should list all collaborators for owner', async () => {
      const response = await request(app)
        .get(`/api/hunts/${testHunt.huntId}/collaborators`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);

      const adminCollab = response.body.find((c: any) => c.userId === adminUser.id);
      const viewCollab = response.body.find((c: any) => c.userId === viewUser.id);

      expect(adminCollab).toMatchObject({
        userId: adminUser.id,
        permission: 'admin',
      });

      expect(viewCollab).toMatchObject({
        userId: viewUser.id,
        permission: 'view',
      });
    });

    it('should allow admin user to list collaborators', async () => {
      const response = await request(app)
        .get(`/api/hunts/${testHunt.huntId}/collaborators`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.length).toBe(2);
    });

    it('should allow view user to list collaborators', async () => {
      const response = await request(app)
        .get(`/api/hunts/${testHunt.huntId}/collaborators`)
        .set('Authorization', `Bearer ${viewToken}`)
        .expect(200);

      expect(response.body.length).toBe(2);
    });

    it('should return empty array when no collaborators', async () => {
      const soloHunt = await createTestHunt({
        creatorId: owner.id,
        name: 'Solo Hunt',
      });

      const response = await request(app)
        .get(`/api/hunts/${soloHunt.huntId}/collaborators`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return 404 when user has no access', async () => {
      await request(app)
        .get(`/api/hunts/${testHunt.huntId}/collaborators`)
        .set('Authorization', `Bearer ${noAccessToken}`)
        .expect(404);
    });

    it('should return 401 when no auth token provided', async () => {
      await request(app).get(`/api/hunts/${testHunt.huntId}/collaborators`).expect(401);
    });

    it('should return 404 when hunt does not exist', async () => {
      await request(app)
        .get('/api/hunts/99999/collaborators')
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/hunts/:id/collaborators/:userId - Update Permission', () => {
    let testHunt: IHunt;

    beforeEach(async () => {
      testHunt = await createTestHunt({
        creatorId: owner.id,
        name: 'Permission Update Test Hunt',
      });

      // Share with target user initially with view permission
      await HuntAccessModel.create({
        huntId: testHunt.huntId,
        ownerId: owner.id,
        sharedWithId: targetUser.id,
        sharedBy: owner.id,
        permission: 'view',
      });

      await HuntAccessModel.create({
        huntId: testHunt.huntId,
        ownerId: owner.id,
        sharedWithId: adminUser.id,
        sharedBy: owner.id,
        permission: 'admin',
      });
    });

    it('should update permission from view to admin successfully', async () => {
      const response = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/collaborators/${targetUser.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ permission: 'admin' })
        .expect(200);

      expect(response.body).toMatchObject({
        huntId: testHunt.huntId,
        sharedWithId: targetUser.id,
        permission: 'admin',
      });
    });

    it('should update permission from admin to view successfully', async () => {
      const response = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/collaborators/${targetUser.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ permission: 'admin' })
        .expect(200);

      // Now downgrade to view
      const downgradeResponse = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/collaborators/${targetUser.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ permission: 'view' })
        .expect(200);

      expect(downgradeResponse.body.permission).toBe('view');
    });

    it('should allow admin user to update permissions', async () => {
      const response = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/collaborators/${targetUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ permission: 'admin' })
        .expect(200);

      expect(response.body.permission).toBe('admin');
    });

    it('should return 404 when updating non-existent collaborator', async () => {
      await request(app)
        .put(`/api/hunts/${testHunt.huntId}/collaborators/${noAccessUser.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ permission: 'admin' })
        .expect(404);
    });

    it('should return 400 when trying to update own permission', async () => {
      const response = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/collaborators/${owner.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ permission: 'view' })
        .expect(400);

      expect(response.body.message).toContain('cannot share a hunt with yourself');
    });

    it('should return 403 when view user tries to update permission', async () => {
      const viewHunt = await createTestHunt({
        creatorId: owner.id,
        name: 'View Permission Test',
      });

      await HuntAccessModel.create({
        huntId: viewHunt.huntId,
        ownerId: owner.id,
        sharedWithId: viewUser.id,
        sharedBy: owner.id,
        permission: 'view',
      });

      await HuntAccessModel.create({
        huntId: viewHunt.huntId,
        ownerId: owner.id,
        sharedWithId: targetUser.id,
        sharedBy: owner.id,
        permission: 'view',
      });

      await request(app)
        .put(`/api/hunts/${viewHunt.huntId}/collaborators/${targetUser.id}`)
        .set('Authorization', `Bearer ${viewToken}`)
        .send({ permission: 'admin' })
        .expect(403);
    });

    it('should return 401 when no auth token provided', async () => {
      await request(app)
        .put(`/api/hunts/${testHunt.huntId}/collaborators/${targetUser.id}`)
        .send({ permission: 'admin' })
        .expect(401);
    });

    it('should return 404 when hunt does not exist', async () => {
      await request(app)
        .put(`/api/hunts/99999/collaborators/${targetUser.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ permission: 'admin' })
        .expect(404);
    });
  });

  describe('DELETE /api/hunts/:id/collaborators/:userId - Revoke Access', () => {
    let testHunt: IHunt;

    beforeEach(async () => {
      testHunt = await createTestHunt({
        creatorId: owner.id,
        name: 'Revoke Access Test Hunt',
      });

      // Share with multiple users
      await HuntAccessModel.create({
        huntId: testHunt.huntId,
        ownerId: owner.id,
        sharedWithId: targetUser.id,
        sharedBy: owner.id,
        permission: 'view',
      });

      await HuntAccessModel.create({
        huntId: testHunt.huntId,
        ownerId: owner.id,
        sharedWithId: adminUser.id,
        sharedBy: owner.id,
        permission: 'admin',
      });
    });

    it('should revoke access successfully', async () => {
      await request(app)
        .delete(`/api/hunts/${testHunt.huntId}/collaborators/${targetUser.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(204);

      // Verify access is revoked
      const share = await HuntAccessModel.findOne({
        huntId: testHunt.huntId,
        sharedWithId: targetUser.id,
      });
      expect(share).toBeNull();
    });

    it('should allow admin user to revoke access', async () => {
      await request(app)
        .delete(`/api/hunts/${testHunt.huntId}/collaborators/${targetUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const share = await HuntAccessModel.findOne({
        huntId: testHunt.huntId,
        sharedWithId: targetUser.id,
      });
      expect(share).toBeNull();
    });

    it('should return 404 when revoking non-existent collaborator', async () => {
      await request(app)
        .delete(`/api/hunts/${testHunt.huntId}/collaborators/${noAccessUser.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404);
    });

    it('should return 400 when trying to revoke own access', async () => {
      const response = await request(app)
        .delete(`/api/hunts/${testHunt.huntId}/collaborators/${owner.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(400);

      expect(response.body.message).toContain('cannot share a hunt with yourself');
    });

    it('should return 403 when view user tries to revoke access', async () => {
      const viewHunt = await createTestHunt({
        creatorId: owner.id,
        name: 'View Revoke Test',
      });

      await HuntAccessModel.create({
        huntId: viewHunt.huntId,
        ownerId: owner.id,
        sharedWithId: viewUser.id,
        sharedBy: owner.id,
        permission: 'view',
      });

      await HuntAccessModel.create({
        huntId: viewHunt.huntId,
        ownerId: owner.id,
        sharedWithId: targetUser.id,
        sharedBy: owner.id,
        permission: 'view',
      });

      await request(app)
        .delete(`/api/hunts/${viewHunt.huntId}/collaborators/${targetUser.id}`)
        .set('Authorization', `Bearer ${viewToken}`)
        .expect(403);
    });

    it('should return 401 when no auth token provided', async () => {
      await request(app).delete(`/api/hunts/${testHunt.huntId}/collaborators/${targetUser.id}`).expect(401);
    });

    it('should return 404 when hunt does not exist', async () => {
      await request(app)
        .delete(`/api/hunts/99999/collaborators/${targetUser.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(404);
    });

    it('should allow user to regain access after being revoked', async () => {
      // Revoke access
      await request(app)
        .delete(`/api/hunts/${testHunt.huntId}/collaborators/${targetUser.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(204);

      // Re-share with same user
      const response = await request(app)
        .post(`/api/hunts/${testHunt.huntId}/share`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          email: targetUser.email,
          permission: 'admin', // Different permission this time
        })
        .expect(200);

      expect(response.body.permission).toBe('admin');
    });
  });

  describe('Edge Cases and Integration', () => {
    let testHunt: IHunt;

    beforeEach(async () => {
      testHunt = await createTestHunt({
        creatorId: owner.id,
        name: 'Integration Test Hunt',
      });
    });

    it('should handle complete sharing workflow (share → update → revoke)', async () => {
      // Share with view permission
      const shareResponse = await request(app)
        .post(`/api/hunts/${testHunt.huntId}/share`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          email: targetUser.email,
          permission: 'view',
        })
        .expect(200);

      expect(shareResponse.body.permission).toBe('view');

      // List collaborators
      const listResponse = await request(app)
        .get(`/api/hunts/${testHunt.huntId}/collaborators`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(listResponse.body.length).toBe(1);

      // Update to admin permission
      const updateResponse = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/collaborators/${targetUser.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ permission: 'admin' })
        .expect(200);

      expect(updateResponse.body.permission).toBe('admin');

      // Revoke access
      await request(app)
        .delete(`/api/hunts/${testHunt.huntId}/collaborators/${targetUser.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(204);

      // Verify removed from collaborators list
      const finalListResponse = await request(app)
        .get(`/api/hunts/${testHunt.huntId}/collaborators`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(finalListResponse.body.length).toBe(0);
    });

    it('should reflect permission changes in authorization checks', async () => {
      // Share with view permission
      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/share`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          email: targetUser.email,
          permission: 'view',
        })
        .expect(200);

      // Setup target user auth
      mockFirebaseAuth(targetUser);
      const targetToken = createTestAuthToken(targetUser);

      // View user should not be able to share
      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/share`)
        .set('Authorization', `Bearer ${targetToken}`)
        .send({
          email: noAccessUser.email,
          permission: 'view',
        })
        .expect(403);

      // Upgrade to admin
      await request(app)
        .put(`/api/hunts/${testHunt.huntId}/collaborators/${targetUser.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ permission: 'admin' })
        .expect(200);

      // Admin should now be able to share
      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/share`)
        .set('Authorization', `Bearer ${targetToken}`)
        .send({
          email: noAccessUser.email,
          permission: 'view',
        })
        .expect(200);
    });
  });
});
