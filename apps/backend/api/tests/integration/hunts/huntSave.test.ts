import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../../setup/testServer';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestHunt } from '../../setup/factories/hunt.factory';
import { createTestSteps } from '../../setup/factories/step.factory';
import { mockFirebaseAuth, createTestAuthToken, clearFirebaseAuthMocks } from '../../helpers/authHelper';
import { IUser } from '@/database/types/User';
import { IHunt } from '@/database/types/Hunt';
import { IStep } from '@/database/types/Step';
import { ChallengeType, HuntStatus, Hunt, Step, Challenge, HuntAccessMode } from '@hunthub/shared';
import StepModel from '@/database/models/Step';
import HuntVersionModel from '@/database/models/HuntVersion';
import HuntAccessModel from '@/database/models/HuntAccess';

describe('Hunt Save Integration Tests', () => {
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

  const mapStep = (s: IStep): Step => ({
    stepId: s.stepId,
    huntId: s.huntId,
    type: s.type as ChallengeType,
    challenge: s.challenge as Challenge,
    media: s.media,
    requiredLocation: s.requiredLocation,
    hint: s.hint,
    timeLimit: s.timeLimit,
    maxAttempts: s.maxAttempts,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  });

  const buildSavePayload = async (hunt: IHunt, steps: IStep[] = []): Promise<Hunt> => {
    const versionDoc = await HuntVersionModel.findOne({
      huntId: hunt.huntId,
      version: hunt.latestVersion,
    });

    const startLocation = versionDoc?.startLocation
      ? {
          lat: versionDoc.startLocation.lat,
          lng: versionDoc.startLocation.lng,
          radius: versionDoc.startLocation.radius,
          address: versionDoc.startLocation.address,
        }
      : undefined;

    return {
      huntId: hunt.huntId,
      creatorId: hunt.creatorId.toString(),
      version: hunt.latestVersion,
      latestVersion: hunt.latestVersion,
      liveVersion: hunt.liveVersion ?? null,
      name: versionDoc?.name || 'Test Hunt',
      description: versionDoc?.description,
      status: HuntStatus.Draft,
      startLocation,
      stepOrder: versionDoc?.stepOrder || [],
      steps: steps.map(mapStep),
      isPublished: false,
      playSlug: hunt.playSlug,
      accessMode: hunt.accessMode as HuntAccessMode,
      createdAt: versionDoc?.createdAt?.toISOString(),
      updatedAt: versionDoc?.updatedAt?.toISOString(),
    };
  };

  describe('PUT /api/hunts/:id/save - Save Hunt', () => {
    let testHunt: IHunt;

    beforeEach(async () => {
      testHunt = await createTestHunt({
        creatorId: testUser.id,
        name: 'Original Name',
        description: 'Original description',
      });
    });

    it('should save hunt with updated metadata', async () => {
      const payload = await buildSavePayload(testHunt);
      payload.name = 'Updated Name';
      payload.description = 'Updated description';

      const response = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/save`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.description).toBe('Updated description');
      expect(response.body.huntId).toBe(testHunt.huntId);
    });

    it('should return hunt with all steps populated', async () => {
      const steps = await createTestSteps(2, {
        huntId: testHunt.huntId,
        huntVersion: testHunt.latestVersion,
        type: ChallengeType.Clue,
      });

      const payload = await buildSavePayload(testHunt, steps);

      const response = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/save`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.steps).toHaveLength(2);
      expect(response.body.steps[0]).toHaveProperty('stepId');
      expect(response.body.steps[0]).toHaveProperty('challenge');
    });
  });

  describe('Step Sync Operations', () => {
    let testHunt: IHunt;

    beforeEach(async () => {
      testHunt = await createTestHunt({
        creatorId: testUser.id,
        name: 'Step Sync Hunt',
      });
    });

    it('should create new step when stepId is missing', async () => {
      const payload = await buildSavePayload(testHunt);
      payload.steps = [
        {
          huntId: testHunt.huntId,
          type: ChallengeType.Clue,
          challenge: { clue: { title: 'New Step', description: 'Created via save' } },
        } as any,
      ];

      const response = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/save`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.steps).toHaveLength(1);
      expect(response.body.steps[0].stepId).toBeDefined();
      expect(response.body.steps[0].challenge.clue.title).toBe('New Step');

      const dbStep = await StepModel.findOne({ stepId: response.body.steps[0].stepId });
      expect(dbStep).toBeDefined();
    });

    it('should update existing step when stepId is provided', async () => {
      const [existingStep] = await createTestSteps(1, {
        huntId: testHunt.huntId,
        huntVersion: testHunt.latestVersion,
        type: ChallengeType.Clue,
      });

      const payload = await buildSavePayload(testHunt, [existingStep]);
      payload.steps![0].challenge = { clue: { title: 'Updated Title', description: 'Updated' } };

      const response = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/save`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.steps).toHaveLength(1);
      expect(response.body.steps[0].stepId).toBe(existingStep.stepId);
      expect(response.body.steps[0].challenge.clue.title).toBe('Updated Title');
    });

    it('should delete step when stepId not in payload', async () => {
      const [step1, step2] = await createTestSteps(2, {
        huntId: testHunt.huntId,
        huntVersion: testHunt.latestVersion,
        type: ChallengeType.Clue,
      });

      const payload = await buildSavePayload(testHunt, [step1]);

      const response = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/save`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.steps).toHaveLength(1);
      expect(response.body.steps[0].stepId).toBe(step1.stepId);

      const deletedStep = await StepModel.findOne({ stepId: step2.stepId });
      expect(deletedStep).toBeNull();
    });

    it('should handle mixed operations (create + update + delete)', async () => {
      const [toUpdate, toDelete] = await createTestSteps(2, {
        huntId: testHunt.huntId,
        huntVersion: testHunt.latestVersion,
        type: ChallengeType.Clue,
      });

      const payload = await buildSavePayload(testHunt, [toUpdate]);
      payload.steps![0].challenge = { clue: { title: 'Updated', description: 'Updated via mixed' } };
      payload.steps!.push({
        huntId: testHunt.huntId,
        type: ChallengeType.Quiz,
        challenge: { quiz: { title: 'New Quiz' } },
      } as any);

      const response = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/save`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.steps).toHaveLength(2);

      const updatedStep = response.body.steps.find((s: any) => s.stepId === toUpdate.stepId);
      expect(updatedStep.challenge.clue.title).toBe('Updated');

      const newStep = response.body.steps.find((s: any) => s.stepId !== toUpdate.stepId);
      expect(newStep.type).toBe(ChallengeType.Quiz);

      const deletedStep = await StepModel.findOne({ stepId: toDelete.stepId });
      expect(deletedStep).toBeNull();
    });

    it('should preserve stepOrder from payload', async () => {
      const [step1, step2, step3] = await createTestSteps(3, {
        huntId: testHunt.huntId,
        huntVersion: testHunt.latestVersion,
        type: ChallengeType.Clue,
      });

      const payload = await buildSavePayload(testHunt, [step3, step1, step2]);

      const response = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/save`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.stepOrder).toEqual([step3.stepId, step1.stepId, step2.stepId]);
    });
  });

  describe('Authorization', () => {
    let huntOwner: IUser;
    let adminUser: IUser;
    let viewUser: IUser;
    let sharedHunt: IHunt;

    beforeEach(async () => {
      huntOwner = await createTestUser({ email: 'owner@example.com' });
      adminUser = await createTestUser({ email: 'admin@example.com' });
      viewUser = await createTestUser({ email: 'viewer@example.com' });

      mockFirebaseAuth(huntOwner);

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

    it('should allow owner to save hunt', async () => {
      const ownerToken = createTestAuthToken(huntOwner);
      const payload = await buildSavePayload(sharedHunt);
      payload.name = 'Owner Updated';

      const response = await request(app)
        .put(`/api/hunts/${sharedHunt.huntId}/save`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.name).toBe('Owner Updated');
    });

    it('should allow admin to save hunt', async () => {
      mockFirebaseAuth(adminUser);
      const adminToken = createTestAuthToken(adminUser);
      const payload = await buildSavePayload(sharedHunt);
      payload.name = 'Admin Updated';

      const response = await request(app)
        .put(`/api/hunts/${sharedHunt.huntId}/save`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload)
        .expect(200);

      expect(response.body.name).toBe('Admin Updated');
    });

    it('should reject viewer from saving hunt', async () => {
      mockFirebaseAuth(viewUser);
      const viewToken = createTestAuthToken(viewUser);
      const payload = await buildSavePayload(sharedHunt);

      await request(app)
        .put(`/api/hunts/${sharedHunt.huntId}/save`)
        .set('Authorization', `Bearer ${viewToken}`)
        .send(payload)
        .expect(403);
    });
  });

  describe('Error Cases', () => {
    it('should return 404 for non-existent hunt', async () => {
      const payload = {
        huntId: 99999,
        creatorId: testUser.id,
        version: 1,
        latestVersion: 1,
        liveVersion: null,
        name: 'Fake Hunt',
        status: HuntStatus.Draft,
        stepOrder: [],
        isPublished: false,
        playSlug: 'abc123',
        accessMode: HuntAccessMode.Open,
      };

      await request(app)
        .put('/api/hunts/99999/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(404);
    });

    it('should return 409 for optimistic locking conflict', async () => {
      const hunt = await createTestHunt({
        creatorId: testUser.id,
        name: 'Conflict Test',
      });

      const payload = await buildSavePayload(hunt);
      payload.updatedAt = new Date(Date.now() - 60000).toISOString();

      await HuntVersionModel.findOneAndUpdate(
        { huntId: hunt.huntId, version: hunt.latestVersion },
        { updatedAt: new Date() },
      );

      const response = await request(app)
        .put(`/api/hunts/${hunt.huntId}/save`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(409);

      expect(response.body.message).toContain('modified by another user');
    });
  });
});
