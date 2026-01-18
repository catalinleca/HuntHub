import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../../setup/testServer';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestHunt } from '../../setup/factories/hunt.factory';
import { createTestStep, generateStepData } from '../../setup/factories/step.factory';
import { mockFirebaseAuth, createTestAuthToken, clearFirebaseAuthMocks } from '../../helpers/authHelper';
import { IUser } from '@/database/types/User';
import { IHunt } from '@/database/types/Hunt';
import { IStep } from '@/database/types/Step';
import { ChallengeType } from '@hunthub/shared';
import HuntModel from '@/database/models/Hunt';
import HuntVersionModel from '@/database/models/HuntVersion';

describe('Step CRUD Integration Tests', () => {
  let app: Express;
  let testUser: IUser;
  let authToken: string;
  let testHunt: IHunt;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    testUser = await createTestUser({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    });

    // Mock Firebase auth for this user
    mockFirebaseAuth(testUser);
    authToken = createTestAuthToken(testUser);

    // Create a test hunt for the user
    testHunt = await createTestHunt({
      creatorId: testUser.id,
      name: 'Test Hunt',
    });
  });

  afterEach(() => {
    clearFirebaseAuthMocks();
  });

  describe('POST /api/hunts/:huntId/steps - Create Step', () => {
    it('should create a new step and return 201', async () => {
      const stepData = generateStepData({
        type: ChallengeType.Quiz,
        challenge: {
          quiz: {
            title: 'What is the capital of France?',
            type: 'choice',
            options: [
              { id: '1', text: 'Paris' },
              { id: '2', text: 'London' },
              { id: '3', text: 'Berlin' },
            ],
            targetId: '1',
          },
        },
      });

      const response = await request(app)
        .post(`/api/hunts/${testHunt.huntId}/steps`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(stepData)
        .expect(201);

      expect(response.body).toMatchObject({
        type: ChallengeType.Quiz,
        huntId: testHunt.huntId,
      });
      expect(response.body).toHaveProperty('stepId');
      expect(typeof response.body.stepId).toBe('number');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should auto-add step to hunt stepOrder array', async () => {
      const stepData = generateStepData();

      const response = await request(app)
        .post(`/api/hunts/${testHunt.huntId}/steps`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(stepData)
        .expect(201);

      const stepId = response.body.stepId;

      // Verify step was added to hunt version's stepOrder
      const huntVersion = await HuntVersionModel.findOne({ huntId: testHunt.huntId, version: 1 });
      expect(huntVersion?.stepOrder).toContain(stepId);
    });

    it('should return 401 when no auth token provided', async () => {
      const stepData = generateStepData();

      await request(app).post(`/api/hunts/${testHunt.huntId}/steps`).send(stepData).expect(401);
    });

    it("should return 404 when trying to create step in another user's hunt (access denied)", async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherHunt = await createTestHunt({ creatorId: otherUser.id });

      const stepData = generateStepData();

      await request(app)
        .post(`/api/hunts/${otherHunt.huntId}/steps`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(stepData)
        .expect(404);
    });

    it('should return 404 when hunt does not exist', async () => {
      const stepData = generateStepData();

      await request(app)
        .post('/api/hunts/99999/steps')
        .set('Authorization', `Bearer ${authToken}`)
        .send(stepData)
        .expect(404);
    });

    it('should return 400 for invalid hunt ID format', async () => {
      const stepData = generateStepData();

      await request(app)
        .post('/api/hunts/invalid/steps')
        .set('Authorization', `Bearer ${authToken}`)
        .send(stepData)
        .expect(400);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post(`/api/hunts/${testHunt.huntId}/steps`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({}) // Empty body
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PUT /api/hunts/:huntId/steps/:stepId - Update Step', () => {
    let testStep: IStep;

    beforeEach(async () => {
      testStep = await createTestStep({
        huntId: testHunt.huntId,
        type: ChallengeType.Clue,
        challenge: { clue: { title: 'Original Title' } },
      });
    });

    it('should update step and return 200', async () => {
      const updateData = {
        type: ChallengeType.Clue,
        challenge: {
          clue: {
            title: 'Updated Title',
            description: 'Updated description',
          },
        },
      };

      const response = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/steps/${testStep.stepId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        stepId: testStep.stepId,
        huntId: testHunt.huntId,
      });
      expect(response.body.challenge.clue.title).toBe('Updated Title');
    });

    it("should return 404 when trying to update step in another user's hunt (access denied)", async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherHunt = await createTestHunt({ creatorId: otherUser.id });
      const otherStep = await createTestStep({ huntId: otherHunt.huntId });

      const updateData = generateStepData();

      await request(app)
        .put(`/api/hunts/${otherHunt.huntId}/steps/${otherStep.stepId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should return 404 when step does not exist', async () => {
      const updateData = generateStepData();

      await request(app)
        .put(`/api/hunts/${testHunt.huntId}/steps/99999`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should return 404 when step does not belong to specified hunt', async () => {
      const anotherHunt = await createTestHunt({ creatorId: testUser.id, name: 'Another Hunt' });
      const updateData = generateStepData();

      await request(app)
        .put(`/api/hunts/${anotherHunt.huntId}/steps/${testStep.stepId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });

    it('should return 400 for invalid hunt ID format', async () => {
      const updateData = generateStepData();

      await request(app)
        .put(`/api/hunts/invalid/steps/${testStep.stepId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });

    it('should return 400 for invalid step ID format', async () => {
      const updateData = generateStepData();

      await request(app)
        .put(`/api/hunts/${testHunt.huntId}/steps/invalid`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe('DELETE /api/hunts/:huntId/steps/:stepId - Delete Step', () => {
    let testStep: IStep;

    beforeEach(async () => {
      testStep = await createTestStep({
        huntId: testHunt.huntId,
        type: ChallengeType.Clue,
      });

      // Add step to hunt version's stepOrder
      await HuntVersionModel.findOneAndUpdate(
        { huntId: testHunt.huntId, version: 1 },
        { $push: { stepOrder: testStep.stepId } },
      );
    });

    it('should delete step and return 204', async () => {
      await request(app)
        .delete(`/api/hunts/${testHunt.huntId}/steps/${testStep.stepId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('should remove step from hunt stepOrder array', async () => {
      await request(app)
        .delete(`/api/hunts/${testHunt.huntId}/steps/${testStep.stepId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify step was removed from hunt version's stepOrder
      const huntVersion = await HuntVersionModel.findOne({ huntId: testHunt.huntId, version: 1 });
      expect(huntVersion?.stepOrder).not.toContain(testStep.stepId);
    });

    it("should return 404 when trying to delete step from another user's hunt (access denied)", async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherHunt = await createTestHunt({ creatorId: otherUser.id });
      const otherStep = await createTestStep({ huntId: otherHunt.huntId });

      await request(app)
        .delete(`/api/hunts/${otherHunt.huntId}/steps/${otherStep.stepId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 when step does not exist', async () => {
      await request(app)
        .delete(`/api/hunts/${testHunt.huntId}/steps/99999`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 when step does not belong to specified hunt', async () => {
      const anotherHunt = await createTestHunt({ creatorId: testUser.id, name: 'Another Hunt' });

      await request(app)
        .delete(`/api/hunts/${anotherHunt.huntId}/steps/${testStep.stepId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid hunt ID format', async () => {
      await request(app)
        .delete(`/api/hunts/invalid/steps/${testStep.stepId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should return 400 for invalid step ID format', async () => {
      await request(app)
        .delete(`/api/hunts/${testHunt.huntId}/steps/invalid`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });
});
