import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../../setup/testServer';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestHunt, generateHuntData } from '../../setup/factories/hunt.factory';
import { mockFirebaseAuth, createTestAuthToken, clearFirebaseAuthMocks } from '../../helpers/authHelper';
import { IUser } from '@db/types/User';
import { IHunt, HuntStatus } from '@db/types/Hunt';

describe('Hunt CRUD Integration Tests', () => {
  let app: Express;
  let testUser: IUser;
  let authToken: string;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    // Create test user
    testUser = await createTestUser({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    });

    // Mock Firebase auth for this user
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
        currentVersion: 1,
      });

      expect(response.body).toHaveProperty('id');
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
        .send({}) // Empty body
        .expect(400);

      expect(response.body).toHaveProperty('error');
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
        .get(`/api/hunts/${createdHunt.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdHunt.id,
        name: 'Test Hunt',
        creatorId: testUser.id,
      });
    });

    it('should return 404 when hunt does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format

      await request(app)
        .get(`/api/hunts/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 when accessing without auth', async () => {
      await request(app)
        .get(`/api/hunts/${createdHunt.id}`)
        .expect(401);
    });
  });

  describe('GET /api/hunts - Get User Hunts', () => {
    beforeEach(async () => {
      // Create multiple hunts for the user
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

      expect(response.body).toHaveLength(3);
      expect(response.body.every((hunt: IHunt) => hunt.creatorId === testUser.id)).toBe(true);
    });

    it('should return empty array when user has no hunts', async () => {
      const newUser = await createTestUser({ email: 'new@example.com' });
      mockFirebaseAuth(newUser);
      const newUserToken = createTestAuthToken(newUser);

      const response = await request(app)
        .get('/api/hunts')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  // TODO: Uncomment when update/delete endpoints are implemented
  /*
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
        .put(`/api/hunts/${createdHunt.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: createdHunt.id,
        name: 'Updated Name',
        description: 'Updated description',
      });
    });

    it('should return 403 when trying to update another user\'s hunt', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherHunt = await createTestHunt({ creatorId: otherUser.id });

      await request(app)
        .put(`/api/hunts/${otherHunt.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Hacked' })
        .expect(403);
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
        .delete(`/api/hunts/${createdHunt.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify hunt is deleted
      await request(app)
        .get(`/api/hunts/${createdHunt.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 403 when trying to delete another user\'s hunt', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherHunt = await createTestHunt({ creatorId: otherUser.id });

      await request(app)
        .delete(`/api/hunts/${otherHunt.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });
  */
});