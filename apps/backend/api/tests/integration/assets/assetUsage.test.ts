/**
 * Asset Usage Tracking - Production Scenario Tests
 *
 * These tests verify the core protection mechanism:
 * - Assets used in steps cannot be deleted
 * - Assets become deletable when no longer in use
 *
 * Tests through the API, just like a real client would.
 */
import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../../setup/testServer';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestAsset } from '../../setup/factories/asset.factory';
import { createTestHunt } from '../../setup/factories/hunt.factory';
import { generateStepDataWithMedia } from '../../setup/factories/step.factory';
import { mockFirebaseAuth, createTestAuthToken, clearFirebaseAuthMocks } from '../../helpers/authHelper';
import { AssetUsageModel } from '@/database/models';
import { IUser } from '@/database/types/User';
import { Types } from 'mongoose';

describe('Asset Usage Tracking', () => {
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

  it('protects assets used in steps from deletion', async () => {
    const asset = await createTestAsset({ ownerId: testUser.id });
    const hunt = await createTestHunt({ creatorId: testUser.id });

    const stepData = generateStepDataWithMedia(asset.id);
    await request(app)
      .post(`/api/hunts/${hunt.huntId}/steps`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(stepData)
      .expect(201);

    const response = await request(app)
      .delete(`/api/assets/${asset.assetId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(409);

    expect(response.body.message).toMatch(/used by.*hunt/i);
  });

  it('allows deletion when step using asset is deleted', async () => {
    const asset = await createTestAsset({ ownerId: testUser.id });
    const hunt = await createTestHunt({ creatorId: testUser.id });

    const stepData = generateStepDataWithMedia(asset.id);
    const createResponse = await request(app)
      .post(`/api/hunts/${hunt.huntId}/steps`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(stepData)
      .expect(201);

    const stepId = createResponse.body.stepId;

    await request(app)
      .delete(`/api/hunts/${hunt.huntId}/steps/${stepId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);

    await request(app).delete(`/api/assets/${asset.assetId}`).set('Authorization', `Bearer ${authToken}`).expect(204);
  });

  it('allows deletion when hunt is deleted (cascade cleanup)', async () => {
    const asset = await createTestAsset({ ownerId: testUser.id });
    const hunt = await createTestHunt({ creatorId: testUser.id });

    const stepData = generateStepDataWithMedia(asset.id);
    await request(app)
      .post(`/api/hunts/${hunt.huntId}/steps`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(stepData)
      .expect(201);

    await request(app).delete(`/api/assets/${asset.assetId}`).set('Authorization', `Bearer ${authToken}`).expect(409);

    await request(app).delete(`/api/hunts/${hunt.huntId}`).set('Authorization', `Bearer ${authToken}`).expect(204);

    await request(app).delete(`/api/assets/${asset.assetId}`).set('Authorization', `Bearer ${authToken}`).expect(204);
  });

  it('protects assets used in multiple hunts', async () => {
    const asset = await createTestAsset({ ownerId: testUser.id });
    const hunt1 = await createTestHunt({ creatorId: testUser.id });
    const hunt2 = await createTestHunt({ creatorId: testUser.id });

    const stepData = generateStepDataWithMedia(asset.id);

    await request(app)
      .post(`/api/hunts/${hunt1.huntId}/steps`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(stepData)
      .expect(201);

    await request(app)
      .post(`/api/hunts/${hunt2.huntId}/steps`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(stepData)
      .expect(201);

    await request(app).delete(`/api/hunts/${hunt1.huntId}`).set('Authorization', `Bearer ${authToken}`).expect(204);

    const response = await request(app)
      .delete(`/api/assets/${asset.assetId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(409);

    expect(response.body.message).toMatch(/used by.*hunt/i);

    await request(app).delete(`/api/hunts/${hunt2.huntId}`).set('Authorization', `Bearer ${authToken}`).expect(204);

    await request(app).delete(`/api/assets/${asset.assetId}`).set('Authorization', `Bearer ${authToken}`).expect(204);
  });

  it('deduplicates same asset used in multiple steps of same hunt', async () => {
    const asset = await createTestAsset({ ownerId: testUser.id });
    const hunt = await createTestHunt({ creatorId: testUser.id });

    const stepData = generateStepDataWithMedia(asset.id);

    await request(app)
      .post(`/api/hunts/${hunt.huntId}/steps`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(stepData)
      .expect(201);

    await request(app)
      .post(`/api/hunts/${hunt.huntId}/steps`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(stepData)
      .expect(201);

    const usageRecords = await AssetUsageModel.find({
      assetId: new Types.ObjectId(asset.id),
      huntId: hunt.huntId,
    }).lean();

    expect(usageRecords).toHaveLength(1);
  });
});
