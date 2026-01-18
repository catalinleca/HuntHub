import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../../setup/testServer';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestHunt } from '../../setup/factories/hunt.factory';
import { createTestStep } from '../../setup/factories/step.factory';
import { mockFirebaseAuth, createTestAuthToken, clearFirebaseAuthMocks } from '../../helpers/authHelper';
import { IUser } from '@/database/types/User';
import { IHunt } from '@/database/types/Hunt';
import HuntModel from '@/database/models/Hunt';
import HuntVersionModel from '@/database/models/HuntVersion';
import StepModel from '@/database/models/Step';
import HuntAccessModel from '@/database/models/HuntAccess';
import { ChallengeType } from '@hunthub/shared';

describe('Publishing Workflow Integration Tests', () => {
  let app: Express;
  let owner: IUser;
  let authToken: string;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    owner = await createTestUser({ email: 'owner@example.com' });
    mockFirebaseAuth(owner);
    authToken = createTestAuthToken(owner);
  });

  afterEach(() => {
    clearFirebaseAuthMocks();
  });

  describe('POST /api/hunts/:id/publish - Publish Hunt', () => {
    let testHunt: IHunt;

    beforeEach(async () => {
      testHunt = await createTestHunt({
        creatorId: owner.id,
        name: 'Publish Test Hunt',
      });

      await createTestStep({
        huntId: testHunt.huntId,
        huntVersion: 1,
        type: ChallengeType.Clue,
      });
      await createTestStep({
        huntId: testHunt.huntId,
        huntVersion: 1,
        type: ChallengeType.Quiz,
      });
    });

    it('should publish hunt with steps successfully and return 200', async () => {
      const response = await request(app)
        .post(`/api/hunts/${testHunt.huntId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        publishedVersion: 1,
        newDraftVersion: 2,
      });
      expect(response.body).toHaveProperty('publishedAt');
    });

    it('should create new draft version (version 2) after publishing version 1', async () => {
      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Check that version 2 exists and is draft
      const version2 = await HuntVersionModel.findOne({ huntId: testHunt.huntId, version: 2 });
      expect(version2).not.toBeNull();
      expect(version2?.isPublished).toBe(false);
    });

    it('should clone all steps to new draft version', async () => {
      const originalSteps = await StepModel.find({ huntId: testHunt.huntId, huntVersion: 1 });
      const originalStepCount = originalSteps.length;

      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Check version 2 has cloned steps
      const clonedSteps = await StepModel.find({ huntId: testHunt.huntId, huntVersion: 2 });
      expect(clonedSteps.length).toBe(originalStepCount);
      expect(clonedSteps[0].type).toBe(originalSteps[0].type);
      expect(clonedSteps[1].type).toBe(originalSteps[1].type);
    });

    it('should mark version 1 as published', async () => {
      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const version1 = await HuntVersionModel.findOne({ huntId: testHunt.huntId, version: 1 });
      expect(version1?.isPublished).toBe(true);
      expect(version1?.publishedAt).toBeTruthy();
      expect(version1?.publishedBy).toBe(owner.id);
    });

    it('should update Hunt pointers (latestVersion = 2, liveVersion = null)', async () => {
      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const hunt = await HuntModel.findOne({ huntId: testHunt.huntId });
      expect(hunt?.latestVersion).toBe(2); // New draft version
      expect(hunt?.liveVersion).toBeNull(); // Not released yet
    });

    it('should return 400 when publishing hunt without steps', async () => {
      const emptyHunt = await createTestHunt({
        creatorId: owner.id,
        name: 'Empty Hunt',
      });

      const response = await request(app)
        .post(`/api/hunts/${emptyHunt.huntId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.message).toContain('at least one step');
    });

    it('should return 400 when publishing already published version', async () => {
      // First publish succeeds
      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Manually mark the new draft (version 2) as published to simulate edge case
      // After publishing, the system creates version 2 as a new draft.
      // To test "already published" error, we need to artificially mark it as published.
      await HuntVersionModel.updateOne(
        { huntId: testHunt.huntId, version: 2 },
        { isPublished: true, publishedAt: new Date(), publishedBy: owner.id },
      );

      // Second publish should fail because current draft is marked as published
      const response = await request(app)
        .post(`/api/hunts/${testHunt.huntId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.message).toContain('already published');
    });

    it('should handle concurrent publish attempts with optimistic locking', async () => {
      // Simulate concurrent publishes
      const [response1, response2] = await Promise.allSettled([
        request(app).post(`/api/hunts/${testHunt.huntId}/publish`).set('Authorization', `Bearer ${authToken}`),
        request(app).post(`/api/hunts/${testHunt.huntId}/publish`).set('Authorization', `Bearer ${authToken}`),
      ]);

      // One should succeed, one should fail
      const succeeded = [response1, response2].filter(
        (r) => r.status === 'fulfilled' && (r.value as any).status === 200,
      );
      const failed = [response1, response2].filter((r) => r.status === 'fulfilled' && (r.value as any).status !== 200);

      expect(succeeded.length).toBe(1);
      expect(failed.length).toBe(1);
    });

    it('should return 401 when no auth token provided', async () => {
      await request(app).post(`/api/hunts/${testHunt.huntId}/publish`).expect(401);
    });

    it('should return 404 when hunt does not exist', async () => {
      await request(app).post('/api/hunts/99999/publish').set('Authorization', `Bearer ${authToken}`).expect(404);
    });

    it('should allow admin user (non-owner) to publish shared hunt', async () => {
      const adminUser = await createTestUser({ email: 'admin@example.com' });
      const adminToken = createTestAuthToken(adminUser);
      mockFirebaseAuth(adminUser);

      await HuntAccessModel.create({
        huntId: testHunt.huntId,
        ownerId: owner.id,
        sharedWithId: adminUser.id,
        sharedBy: owner.id,
        permission: 'admin',
      });

      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const version1 = await HuntVersionModel.findOne({ huntId: testHunt.huntId, version: 1 });
      expect(version1?.publishedBy).toBe(adminUser.id);
    });

    it('should return 403 when view user tries to publish', async () => {
      const viewUser = await createTestUser({ email: 'viewer@example.com' });
      const viewToken = createTestAuthToken(viewUser);
      mockFirebaseAuth(viewUser);

      await HuntAccessModel.create({
        huntId: testHunt.huntId,
        ownerId: owner.id,
        sharedWithId: viewUser.id,
        sharedBy: owner.id,
        permission: 'view',
      });

      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/publish`)
        .set('Authorization', `Bearer ${viewToken}`)
        .expect(403);
    });
  });

  describe('PUT /api/hunts/:id/release - Release Hunt', () => {
    let testHunt: IHunt;

    beforeEach(async () => {
      testHunt = await createTestHunt({
        creatorId: owner.id,
        name: 'Release Test Hunt',
      });

      await createTestStep({
        huntId: testHunt.huntId,
        huntVersion: 1,
        type: ChallengeType.Clue,
      });

      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should release published version and return 200', async () => {
      const response = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ version: 1 })
        .expect(200);

      expect(response.body).toMatchObject({
        huntId: testHunt.huntId,
        liveVersion: 1,
        previousLiveVersion: null,
      });
      expect(response.body).toHaveProperty('releasedAt');
      expect(response.body.releasedBy).toBe(owner.id);
    });

    it('should auto-detect latest published version if not specified', async () => {
      const response = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({}) // No version specified
        .expect(200);

      expect(response.body.liveVersion).toBe(1); // Latest published version
    });

    it('should update Hunt with liveVersion, releasedAt, and releasedBy', async () => {
      await request(app)
        .put(`/api/hunts/${testHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ version: 1 })
        .expect(200);

      const hunt = await HuntModel.findOne({ huntId: testHunt.huntId });
      expect(hunt?.liveVersion).toBe(1);
      expect(hunt?.releasedAt).toBeTruthy();
      expect(hunt?.releasedBy).toBe(owner.id);
    });

    it('should rollback to previous version when releasing older version', async () => {
      await createTestStep({
        huntId: testHunt.huntId,
        huntVersion: 2, // New draft from first publish
        type: ChallengeType.Quiz,
      });

      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Release version 2 first
      await request(app)
        .put(`/api/hunts/${testHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ version: 2 })
        .expect(200);

      // Rollback to version 1
      const response = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ version: 1, currentLiveVersion: 2 })
        .expect(200);

      expect(response.body.liveVersion).toBe(1);
      expect(response.body.previousLiveVersion).toBe(2);
    });

    it('should use optimistic locking with currentLiveVersion parameter', async () => {
      // Release version 1
      await request(app)
        .put(`/api/hunts/${testHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ version: 1 })
        .expect(200);

      // Try to release with wrong currentLiveVersion (stale)
      const response = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ version: 1, currentLiveVersion: null }) // Stale value
        .expect(409);

      expect(response.body.message).toContain('modified');
    });

    it('should prevent concurrent release operations', async () => {
      // Simulate two simultaneous release requests
      const [response1, response2] = await Promise.allSettled([
        request(app)
          .put(`/api/hunts/${testHunt.huntId}/release`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ version: 1 }),
        request(app)
          .put(`/api/hunts/${testHunt.huntId}/release`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ version: 1 }),
      ]);

      // One should succeed, one should fail
      const succeeded = [response1, response2].filter(
        (r) => r.status === 'fulfilled' && (r.value as any).status === 200,
      );
      const failed = [response1, response2].filter((r) => r.status === 'fulfilled' && (r.value as any).status !== 200);

      expect(succeeded.length).toBe(1);
      expect(failed.length).toBe(1);
    });

    it('should return 400 when releasing draft (unpublished) version', async () => {
      const response = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ version: 2 }) // Version 2 is draft
        .expect(400);

      expect(response.body.message).toContain('not published');
    });

    it('should return 400 when no published versions exist', async () => {
      const unpublishedHunt = await createTestHunt({
        creatorId: owner.id,
        name: 'Unpublished Hunt',
      });

      const response = await request(app)
        .put(`/api/hunts/${unpublishedHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.message).toContain('No published versions');
    });

    it('should return 401 when no auth token provided', async () => {
      await request(app).put(`/api/hunts/${testHunt.huntId}/release`).send({ version: 1 }).expect(401);
    });

    it('should return 404 when hunt does not exist', async () => {
      await request(app)
        .put('/api/hunts/99999/release')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ version: 1 })
        .expect(404);
    });
  });

  describe('DELETE /api/hunts/:id/release - Take Hunt Offline', () => {
    let testHunt: IHunt;

    beforeEach(async () => {
      testHunt = await createTestHunt({
        creatorId: owner.id,
        name: 'Offline Test Hunt',
      });

      await createTestStep({
        huntId: testHunt.huntId,
        huntVersion: 1,
        type: ChallengeType.Clue,
      });

      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app)
        .put(`/api/hunts/${testHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ version: 1 })
        .expect(200);
    });

    it('should take hunt offline and return 200', async () => {
      const response = await request(app)
        .delete(`/api/hunts/${testHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currentLiveVersion: 1 })
        .expect(200);

      expect(response.body).toMatchObject({
        huntId: testHunt.huntId,
        previousLiveVersion: 1,
      });
      expect(response.body).toHaveProperty('takenOfflineAt');
    });

    it('should set Hunt liveVersion to null after taking offline', async () => {
      await request(app)
        .delete(`/api/hunts/${testHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currentLiveVersion: 1 })
        .expect(200);

      const hunt = await HuntModel.findOne({ huntId: testHunt.huntId });
      expect(hunt?.liveVersion).toBeNull();
    });

    it('should use optimistic locking with currentLiveVersion parameter', async () => {
      const response = await request(app)
        .delete(`/api/hunts/${testHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currentLiveVersion: null }) // Wrong value
        .expect(409);

      expect(response.body.message).toContain('modified');
    });

    it('should return 400 when hunt is already offline', async () => {
      await request(app)
        .delete(`/api/hunts/${testHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currentLiveVersion: 1 })
        .expect(200);

      const response = await request(app)
        .delete(`/api/hunts/${testHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currentLiveVersion: null })
        .expect(400);

      expect(response.body.message).toContain('not currently live');
    });

    it('should return 401 when no auth token provided', async () => {
      await request(app).delete(`/api/hunts/${testHunt.huntId}/release`).send({ currentLiveVersion: 1 }).expect(401);
    });

    it('should return 404 when hunt does not exist', async () => {
      await request(app)
        .delete('/api/hunts/99999/release')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currentLiveVersion: 1 })
        .expect(404);
    });

    it('should allow re-releasing hunt after taking offline', async () => {
      await request(app)
        .delete(`/api/hunts/${testHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ currentLiveVersion: 1 })
        .expect(200);

      const response = await request(app)
        .put(`/api/hunts/${testHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ version: 1, currentLiveVersion: null })
        .expect(200);

      expect(response.body.liveVersion).toBe(1);
      expect(response.body.previousLiveVersion).toBeNull();
    });
  });

  describe('Edge Cases and Race Conditions', () => {
    let testHunt: IHunt;

    beforeEach(async () => {
      testHunt = await createTestHunt({
        creatorId: owner.id,
        name: 'Edge Case Hunt',
      });

      await createTestStep({
        huntId: testHunt.huntId,
        huntVersion: 1,
        type: ChallengeType.Clue,
      });
    });

    it('should prevent deleting hunt while live', async () => {
      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app)
        .put(`/api/hunts/${testHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ version: 1 })
        .expect(200);

      const response = await request(app)
        .delete(`/api/hunts/${testHunt.huntId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);

      expect(response.body.message).toContain('live');
    });

    it('should manage multiple published versions correctly', async () => {
      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Add step to version 2 and publish
      await createTestStep({
        huntId: testHunt.huntId,
        huntVersion: 2,
        type: ChallengeType.Quiz,
      });

      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const version1 = await HuntVersionModel.findOne({ huntId: testHunt.huntId, version: 1 });
      const version2 = await HuntVersionModel.findOne({ huntId: testHunt.huntId, version: 2 });

      expect(version1?.isPublished).toBe(true);
      expect(version2?.isPublished).toBe(true);
    });

    it('should isolate versions correctly (draft vs published vs live)', async () => {
      // Publish version 1
      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Release version 1
      await request(app)
        .put(`/api/hunts/${testHunt.huntId}/release`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ version: 1 })
        .expect(200);

      const version1 = await HuntVersionModel.findOne({ huntId: testHunt.huntId, version: 1 });
      const version2 = await HuntVersionModel.findOne({ huntId: testHunt.huntId, version: 2 });
      const hunt = await HuntModel.findOne({ huntId: testHunt.huntId });

      // Version 1: Published + Live
      expect(version1?.isPublished).toBe(true);

      // Version 2: Draft (not published)
      expect(version2?.isPublished).toBe(false);

      // Hunt pointers
      expect(hunt?.latestVersion).toBe(2); // Draft version
      expect(hunt?.liveVersion).toBe(1); // Live version
    });

    it('should prevent race condition: concurrent publish + release', async () => {
      // Simulate publish and release happening simultaneously
      const [publishRes, releaseRes] = await Promise.allSettled([
        request(app).post(`/api/hunts/${testHunt.huntId}/publish`).set('Authorization', `Bearer ${authToken}`),
        request(app)
          .put(`/api/hunts/${testHunt.huntId}/release`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ version: 1 }),
      ]);

      // Publish should succeed, release should fail (version not published yet)
      // OR publish fails (concurrent access), release fails (no published version)
      const bothSucceeded =
        publishRes.status === 'fulfilled' &&
        (publishRes.value as any).status === 200 &&
        releaseRes.status === 'fulfilled' &&
        (releaseRes.value as any).status === 200;

      // This race condition should NOT result in both succeeding
      expect(bothSucceeded).toBe(false);
    });

    it('should prevent race condition: concurrent release + delete', async () => {
      // Publish version 1
      await request(app)
        .post(`/api/hunts/${testHunt.huntId}/publish`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Simulate release and delete happening simultaneously
      const [releaseRes, deleteRes] = await Promise.allSettled([
        request(app)
          .put(`/api/hunts/${testHunt.huntId}/release`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ version: 1 }),
        request(app).delete(`/api/hunts/${testHunt.huntId}`).set('Authorization', `Bearer ${authToken}`),
      ]);

      // Both should NOT succeed (one will fail due to transaction or locking)
      const bothSucceeded =
        releaseRes.status === 'fulfilled' &&
        (releaseRes.value as any).status === 200 &&
        deleteRes.status === 'fulfilled' &&
        (deleteRes.value as any).status === 204;

      expect(bothSucceeded).toBe(false);
    });
  });
});
