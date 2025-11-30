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

  /**
   * Production scenario 1:
   * User creates a step with an image → tries to delete the image from library
   * Expected: Cannot delete (asset is in use)
   */
  it('protects assets used in steps from deletion', async () => {
    // Setup: Create asset and hunt
    const asset = await createTestAsset({ ownerId: testUser.id });
    const hunt = await createTestHunt({ creatorId: testUser.id });

    // Create step with asset attached
    const stepData = generateStepDataWithMedia(asset.id);
    await request(app)
      .post(`/api/hunts/${hunt.huntId}/steps`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(stepData)
      .expect(201);

    // Try to delete asset → should fail
    const response = await request(app)
      .delete(`/api/assets/${asset.assetId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(409);

    expect(response.body.message).toMatch(/used by.*hunt/i);
  });

  /**
   * Production scenario 2:
   * User deletes the step that uses the asset → can now delete it from library
   * Expected: Asset becomes deletable after step is deleted
   */
  it('allows deletion when step using asset is deleted', async () => {
    // Setup: Create asset, hunt, and step with asset
    const asset = await createTestAsset({ ownerId: testUser.id });
    const hunt = await createTestHunt({ creatorId: testUser.id });

    const stepData = generateStepDataWithMedia(asset.id);
    const createResponse = await request(app)
      .post(`/api/hunts/${hunt.huntId}/steps`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(stepData)
      .expect(201);

    const stepId = createResponse.body.stepId;

    // Delete the step that uses the asset
    await request(app)
      .delete(`/api/hunts/${hunt.huntId}/steps/${stepId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);

    // Now asset delete should succeed
    await request(app)
      .delete(`/api/assets/${asset.assetId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);
  });

  /**
   * Production scenario 3:
   * User deletes a hunt → assets are no longer in use
   * This tests the cascade delete bug fix (no orphan records)
   */
  it('allows deletion when hunt is deleted (cascade cleanup)', async () => {
    // Setup: Create asset, hunt, and step with asset
    const asset = await createTestAsset({ ownerId: testUser.id });
    const hunt = await createTestHunt({ creatorId: testUser.id });

    const stepData = generateStepDataWithMedia(asset.id);
    await request(app)
      .post(`/api/hunts/${hunt.huntId}/steps`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(stepData)
      .expect(201);

    // Verify asset is protected
    await request(app)
      .delete(`/api/assets/${asset.assetId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(409);

    // Delete the hunt
    await request(app)
      .delete(`/api/hunts/${hunt.huntId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);

    // Now asset should be deletable (no orphan usage records)
    await request(app)
      .delete(`/api/assets/${asset.assetId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);
  });

  /**
   * Production scenario 4:
   * Same asset used in multiple hunts
   * Deleting one hunt should NOT make the asset deletable
   */
  it('protects assets used in multiple hunts', async () => {
    // Setup: Create asset and TWO hunts
    const asset = await createTestAsset({ ownerId: testUser.id });
    const hunt1 = await createTestHunt({ creatorId: testUser.id });
    const hunt2 = await createTestHunt({ creatorId: testUser.id });

    // Use same asset in both hunts
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

    // Delete hunt 1
    await request(app)
      .delete(`/api/hunts/${hunt1.huntId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);

    // Asset still protected by hunt 2
    const response = await request(app)
      .delete(`/api/assets/${asset.assetId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(409);

    expect(response.body.message).toMatch(/used by.*hunt/i);

    // Delete hunt 2
    await request(app)
      .delete(`/api/hunts/${hunt2.huntId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);

    // Now asset is deletable
    await request(app)
      .delete(`/api/assets/${asset.assetId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(204);
  });

  /**
   * Production scenario 5:
   * Same asset in multiple steps of the same hunt
   * Should create only ONE usage record (deduplication)
   */
  it('deduplicates same asset used in multiple steps of same hunt', async () => {
    // Setup: Create asset and hunt
    const asset = await createTestAsset({ ownerId: testUser.id });
    const hunt = await createTestHunt({ creatorId: testUser.id });

    // Create TWO steps with same asset
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

    // Check database: should have exactly 1 usage record, not 2
    const usageRecords = await AssetUsageModel.find({
      assetId: new Types.ObjectId(asset.id),
      huntId: hunt.huntId,
    }).lean();

    expect(usageRecords).toHaveLength(1);
  });
});
