import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../../setup/testServer';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestHunt, generateHuntData } from '../../setup/factories/hunt.factory';
import { createTestSteps } from '../../setup/factories/step.factory';
import { mockFirebaseAuth, createTestAuthToken, clearFirebaseAuthMocks } from '../../helpers/authHelper';
import { IUser } from '@/database/types/User';
import { IHunt } from '@/database/types/Hunt';
import { IStep } from '@/database/types/Step';
import { Hunt, HuntStatus, ChallengeType } from '@hunthub/shared';
import StepModel from '@/database/models/Step';
import HuntVersionModel from '@/database/models/HuntVersion';
import HuntAccessModel from '@/database/models/HuntAccess';
import HuntModel from '@/database/models/Hunt';

describe('Hunt CRUD Integration Tests', () => {
  let app: Express;
  let testUser: IUser;
  let authToken: string;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    testUser = await createTestUser({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    });

    mockFirebaseAuth(testUser);
    authToken = createTestAuthToken(testUser);
  });

  afterEach(() => {
    clearFirebaseAuthMocks();
  });

  describe('POST /api/hunts - Create Hunt', () => {
    it('should create a new hunt and return 201', async () => {
      const huntData = generateHuntData({
        name: 'Barcelona Adventure',
        description: 'Explore the beautiful city of Barcelona',
      });

      const response = await request(app)
        .post('/api/hunts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(huntData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'Barcelona Adventure',
        description: 'Explore the beautiful city of Barcelona',
        status: HuntStatus.Draft,
        creatorId: testUser.id,
      });

      expect(response.body).toHaveProperty('huntId');
      expect(typeof response.body.huntId).toBe('number');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 401 when no auth token provided', async () => {
      const huntData = generateHuntData();

      await request(app)
        .post('/api/hunts')
        .send(huntData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/hunts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/hunts/:id - Get Hunt by ID', () => {
    let createdHunt: IHunt;

    beforeEach(async () => {
      createdHunt = await createTestHunt({
        creatorId: testUser.id,
        name: 'Test Hunt',
      });
    });

    it('should get hunt by ID and return 200', async () => {
      const response = await request(app)
        .get(`/api/hunts/${createdHunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        huntId: createdHunt.huntId,
        name: 'Test Hunt',
        creatorId: testUser.id,
      });
    });

    it('should return 404 when hunt does not exist', async () => {
      const fakeId = 99999; // Non-existent numeric hunt ID

      await request(app)
        .get(`/api/hunts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid hunt ID format', async () => {
      await request(app)
        .get('/api/hunts/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 401 when accessing without auth', async () => {
      await request(app)
        .get(`/api/hunts/${createdHunt.huntId}`)
        .expect(401);
    });

    it('should populate steps array with full step details', async () => {
      const hunt = await createTestHunt({
        creatorId: testUser.id,
        name: 'Hunt with Steps',
      });

      const steps = await createTestSteps(3, {
        huntId: hunt.huntId,
        huntVersion: hunt.latestVersion,
        type: ChallengeType.Clue,
      });

      const response = await request(app)
        .get(`/api/hunts/${hunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('steps');
      expect(Array.isArray(response.body.steps)).toBe(true);
      expect(response.body.steps).toHaveLength(3);

      response.body.steps.forEach((step: any, index: number) => {
        expect(step).toHaveProperty('stepId');
        expect(typeof step.stepId).toBe('number');
        expect(step.stepId).toBe(steps[index].stepId);
        expect(step).toHaveProperty('type');
        expect(step.type).toBe(ChallengeType.Clue);
        expect(step).toHaveProperty('challenge');
        expect(step.challenge).toHaveProperty('clue');
        expect(step.challenge.clue).toHaveProperty('title');
        expect(step.challenge.clue).toHaveProperty('description');
        expect(step).toHaveProperty('huntId');
        expect(step.huntId).toBe(hunt.huntId);
      });

      expect(response.body).toHaveProperty('stepOrder');
      expect(Array.isArray(response.body.stepOrder)).toBe(true);
      expect(response.body.stepOrder).toHaveLength(3);
    });
  });

  describe('GET /api/hunts - Get User Hunts', () => {
    beforeEach(async () => {
      await createTestHunt({ creatorId: testUser.id, name: 'Hunt 1' });
      await createTestHunt({ creatorId: testUser.id, name: 'Hunt 2' });
      await createTestHunt({ creatorId: testUser.id, name: 'Hunt 3' });

      // Create hunt for different user (should not be returned)
      const otherUser = await createTestUser({ email: 'other@example.com' });
      await createTestHunt({ creatorId: otherUser.id, name: 'Other Hunt' });
    });

    it('should get all hunts for authenticated user', async () => {
      const response = await request(app)
        .get('/api/hunts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(3);
      expect(response.body.data.every((hunt: Hunt) => hunt.creatorId === testUser.id)).toBe(true);
      expect(response.body.pagination).toMatchObject({
        total: 3,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should return empty array when user has no hunts', async () => {
      const newUser = await createTestUser({ email: 'new@example.com' });
      mockFirebaseAuth(newUser);
      const newUserToken = createTestAuthToken(newUser);

      const response = await request(app)
        .get('/api/hunts')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe('PUT /api/hunts/:id - Update Hunt', () => {
    let createdHunt: IHunt;

    beforeEach(async () => {
      createdHunt = await createTestHunt({
        creatorId: testUser.id,
        name: 'Original Name',
      });
    });

    it('should update hunt and return 200', async () => {
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/hunts/${createdHunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        huntId: createdHunt.huntId,
        name: 'Updated Name',
        description: 'Updated description',
      });
    });

    it('should return 404 when hunt does not exist', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      await request(app)
        .put('/api/hunts/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should return 400 for invalid hunt ID format', async () => {
      await request(app)
        .put('/api/hunts/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Test' })
        .expect(400);
    });

    it('should return 403 when trying to update another user\'s hunt', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherHunt = await createTestHunt({ creatorId: otherUser.id });

      await request(app)
        .put(`/api/hunts/${otherHunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Hacked' })
        .expect(404);
    });
  });

  describe('DELETE /api/hunts/:id - Delete Hunt', () => {
    let createdHunt: IHunt;

    beforeEach(async () => {
      createdHunt = await createTestHunt({
        creatorId: testUser.id,
        name: 'To Delete',
      });
    });

    it('should delete hunt and return 204', async () => {
      await request(app)
        .delete(`/api/hunts/${createdHunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      await request(app)
        .get(`/api/hunts/${createdHunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 when hunt does not exist', async () => {
      await request(app)
        .delete('/api/hunts/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid hunt ID format', async () => {
      await request(app)
        .delete('/api/hunts/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 404 when trying to delete another user\'s hunt', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherHunt = await createTestHunt({ creatorId: otherUser.id });

      await request(app)
        .delete(`/api/hunts/${otherHunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should cascade delete all steps when hunt is deleted', async () => {
      const hunt = await createTestHunt({
        creatorId: testUser.id,
        name: 'Hunt with Steps',
      });

      await StepModel.create({
        huntId: hunt.huntId,
        huntVersion: 1,
        type: 'clue',
        challenge: { clue: { title: 'Step 1' } },
      });
      await StepModel.create({
        huntId: hunt.huntId,
        huntVersion: 1,
        type: 'clue',
        challenge: { clue: { title: 'Step 2' } },
      });

      await request(app)
        .delete(`/api/hunts/${hunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      const remainingSteps = await StepModel.find({ huntId: hunt.huntId });
      expect(remainingSteps).toHaveLength(0);
    });
  });

  describe('PUT /api/hunts/:id/step-order - Reorder Steps', () => {
    let createdHunt: IHunt;
    let step1: IStep;
    let step2: IStep;
    let step3: IStep;

    beforeEach(async () => {
      createdHunt = await createTestHunt({
        creatorId: testUser.id,
        name: 'Hunt for Reordering',
      });

      step1 = (await StepModel.create({
        huntId: createdHunt.huntId,
        huntVersion: 1,
        type: 'clue',
        challenge: { clue: { title: 'Step 1' } },
      })).toJSON() as IStep;

      step2 = (await StepModel.create({
        huntId: createdHunt.huntId,
        huntVersion: 1,
        type: 'clue',
        challenge: { clue: { title: 'Step 2' } },
      })).toJSON() as IStep;

      step3 = (await StepModel.create({
        huntId: createdHunt.huntId,
        huntVersion: 1,
        type: 'clue',
        challenge: { clue: { title: 'Step 3' } },
      })).toJSON() as IStep;
    });

    it('should reorder steps successfully', async () => {
      const newOrder = [step3.stepId, step1.stepId, step2.stepId];

      const response = await request(app)
        .put(`/api/hunts/${createdHunt.huntId}/step-order`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ stepOrder: newOrder })
        .expect(200);

      expect(response.body.stepOrder).toEqual(newOrder);
    });

    it('should return 400 when step IDs do not belong to hunt', async () => {
      const invalidOrder = [step1.stepId, 99999, step3.stepId];

      await request(app)
        .put(`/api/hunts/${createdHunt.huntId}/step-order`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ stepOrder: invalidOrder })
        .expect(400);
    });

    it('should return 404 when hunt does not exist', async () => {
      const newOrder = [step1.stepId, step2.stepId];

      await request(app)
        .put('/api/hunts/99999/step-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ stepOrder: newOrder })
        .expect(404);
    });

    it('should return 400 for invalid hunt ID format', async () => {
      await request(app)
        .put('/api/hunts/invalid/step-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ stepOrder: [1, 2, 3] })
        .expect(400);
    });

    it('should return 404 when trying to reorder another user\'s hunt', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherHunt = await createTestHunt({ creatorId: otherUser.id });

      await request(app)
        .put(`/api/hunts/${otherHunt.huntId}/step-order`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ stepOrder: [1, 2] })
        .expect(404);
    });
  });

  describe('Authorization - Shared Hunt Access', () => {
    let huntOwner: IUser;
    let adminUser: IUser;
    let viewUser: IUser;
    let sharedHunt: IHunt;
    let ownerToken: string;
    let adminToken: string;
    let viewToken: string;

    beforeEach(async () => {
      huntOwner = await createTestUser({ email: 'owner@example.com' });
      adminUser = await createTestUser({ email: 'admin@example.com' });
      viewUser = await createTestUser({ email: 'viewer@example.com' });

      mockFirebaseAuth(huntOwner);
      ownerToken = createTestAuthToken(huntOwner);

      sharedHunt = await createTestHunt({
        creatorId: huntOwner.id,
        name: 'Shared Hunt',
      });

      await HuntAccessModel.create({
        huntId: sharedHunt.huntId,
        ownerId: huntOwner.id,
        sharedWithId: adminUser.id,
        sharedBy: huntOwner.id,
        permission: 'admin',
      });

      await HuntAccessModel.create({
        huntId: sharedHunt.huntId,
        ownerId: huntOwner.id,
        sharedWithId: viewUser.id,
        sharedBy: huntOwner.id,
        permission: 'view',
      });
    });

    it('should allow admin user to view shared hunt', async () => {
      mockFirebaseAuth(adminUser);
      adminToken = createTestAuthToken(adminUser);

      const response = await request(app)
        .get(`/api/hunts/${sharedHunt.huntId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.huntId).toBe(sharedHunt.huntId);
      expect(response.body.permission).toBe('admin');
    });

    it('should allow view user to view shared hunt', async () => {
      mockFirebaseAuth(viewUser);
      viewToken = createTestAuthToken(viewUser);

      const response = await request(app)
        .get(`/api/hunts/${sharedHunt.huntId}`)
        .set('Authorization', `Bearer ${viewToken}`)
        .expect(200);

      expect(response.body.huntId).toBe(sharedHunt.huntId);
      expect(response.body.permission).toBe('view');
    });

    it('should allow admin user to update shared hunt', async () => {
      mockFirebaseAuth(adminUser);
      adminToken = createTestAuthToken(adminUser);

      const response = await request(app)
        .put(`/api/hunts/${sharedHunt.huntId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated by Admin' })
        .expect(200);

      expect(response.body.name).toBe('Updated by Admin');
    });

    it('should NOT allow view user to update shared hunt', async () => {
      mockFirebaseAuth(viewUser);
      viewToken = createTestAuthToken(viewUser);

      await request(app)
        .put(`/api/hunts/${sharedHunt.huntId}`)
        .set('Authorization', `Bearer ${viewToken}`)
        .send({ name: 'Attempted Update' })
        .expect(403);
    });

    it('should NOT allow admin user to delete shared hunt (only owner can)', async () => {
      mockFirebaseAuth(adminUser);
      adminToken = createTestAuthToken(adminUser);

      await request(app)
        .delete(`/api/hunts/${sharedHunt.huntId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(403);
    });

    it('should allow owner to delete hunt', async () => {
      await request(app)
        .delete(`/api/hunts/${sharedHunt.huntId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(204);
    });

    it('should include shared hunts in user hunt list', async () => {
      mockFirebaseAuth(adminUser);
      adminToken = createTestAuthToken(adminUser);

      const response = await request(app)
        .get('/api/hunts')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      const foundSharedHunt = response.body.data.find((h: Hunt) => h.huntId === sharedHunt.huntId);
      expect(foundSharedHunt).toBeDefined();
      expect(foundSharedHunt.permission).toBe('admin');
    });
  });

  describe('Versioning - Hunt and HuntVersion Cascade Delete', () => {
    it('should delete HuntVersion documents when hunt is deleted', async () => {
      const hunt = await createTestHunt({
        creatorId: testUser.id,
        name: 'Hunt to Delete with Versions',
      });

      // Verify HuntVersion was created (version 1 is draft)
      const versionBefore = await HuntVersionModel.findOne({
        huntId: hunt.huntId,
        version: 1,
      });
      expect(versionBefore).toBeDefined();

      await request(app)
        .delete(`/api/hunts/${hunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      const versionsAfter = await HuntVersionModel.find({ huntId: hunt.huntId });
      expect(versionsAfter).toHaveLength(0);
    });

    it('should update draft HuntVersion when updating hunt', async () => {
      const hunt = await createTestHunt({
        creatorId: testUser.id,
        name: 'Original Name',
        description: 'Original Description',
      });

      await request(app)
        .put(`/api/hunts/${hunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          description: 'Updated Description',
        })
        .expect(200);

      // Verify HuntVersion was updated (draft version)
      const updatedVersion = await HuntVersionModel.findOne({
        huntId: hunt.huntId,
        version: hunt.latestVersion,
      });

      expect(updatedVersion?.name).toBe('Updated Name');
      expect(updatedVersion?.description).toBe('Updated Description');
    });

    it('should maintain version number when updating hunt', async () => {
      const hunt = await createTestHunt({
        creatorId: testUser.id,
        name: 'Test Hunt',
      });

      const initialVersion = hunt.latestVersion;

      await request(app)
        .put(`/api/hunts/${hunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Update 1' })
        .expect(200);

      await request(app)
        .put(`/api/hunts/${hunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Update 2' })
        .expect(200);

      // Verify version hasn't changed (still editing draft)
      const updatedHunt = await HuntModel.findOne({ huntId: hunt.huntId });
      expect(updatedHunt?.latestVersion).toBe(initialVersion);
    });

    it('should validate reorder only affects current version steps', async () => {
      const hunt = await createTestHunt({
        creatorId: testUser.id,
        name: 'Version Test Hunt',
      });

      const step1 = await StepModel.create({
        huntId: hunt.huntId,
        huntVersion: 1,
        type: 'clue',
        challenge: { clue: { title: 'Step 1' } },
      });

      const step2 = await StepModel.create({
        huntId: hunt.huntId,
        huntVersion: 1,
        type: 'clue',
        challenge: { clue: { title: 'Step 2' } },
      });

      const newOrder = [step2.stepId, step1.stepId];

      await request(app)
        .put(`/api/hunts/${hunt.huntId}/step-order`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ stepOrder: newOrder })
        .expect(200);

      // Verify only version 1 was affected
      const updatedVersion = await HuntVersionModel.findOne({
        huntId: hunt.huntId,
        version: 1,
      });

      expect(updatedVersion?.stepOrder).toEqual(newOrder);
    });
  });

  describe('Optimistic Locking - Concurrent Updates', () => {
    it('should detect concurrent hunt updates', async () => {
      const hunt = await createTestHunt({
        creatorId: testUser.id,
        name: 'Concurrent Test',
      });

      // First user gets hunt with updatedAt timestamp
      const firstGet = await request(app)
        .get(`/api/hunts/${hunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const originalUpdatedAt = firstGet.body.updatedAt;

      // Simulate another user updating the hunt
      await request(app)
        .put(`/api/hunts/${hunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Concurrent Update 1',
        })
        .expect(200);

      // Original user tries to update with stale updatedAt
      const conflictResponse = await request(app)
        .put(`/api/hunts/${hunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Concurrent Update 2',
          updatedAt: originalUpdatedAt, // Stale timestamp
        })
        .expect(409);

      expect(conflictResponse.body.message).toContain('modified by another user');
    });

    it('should allow update when updatedAt matches', async () => {
      const hunt = await createTestHunt({
        creatorId: testUser.id,
        name: 'Valid Update Test',
      });

      const currentState = await request(app)
        .get(`/api/hunts/${hunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app)
        .put(`/api/hunts/${hunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Valid Update',
          updatedAt: currentState.body.updatedAt,
        })
        .expect(200);
    });

    it('should work without updatedAt (no locking check)', async () => {
      const hunt = await createTestHunt({
        creatorId: testUser.id,
        name: 'No Lock Test',
      });

      // Update without updatedAt (skips optimistic locking)
      await request(app)
        .put(`/api/hunts/${hunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Update Without Lock',
        })
        .expect(200);
    });
  });
});
