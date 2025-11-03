import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../../setup/testServer';
import { createTestUser } from '../../setup/factories/user.factory';
import {
  createTestAsset,
  createTestAssets,
  generateAssetCreateData,
} from '../../setup/factories/asset.factory';
import {
  mockFirebaseAuth,
  createTestAuthToken,
  clearFirebaseAuthMocks,
} from '../../helpers/authHelper';
import { IUser } from '@/database/types/User';
import { MimeTypes } from '@hunthub/shared';

describe('Asset CRUD Integration Tests', () => {
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

  describe('POST /api/assets/request-upload - Request Upload URL', () => {
    it('should generate presigned upload URLs for valid extension', async () => {
      const response = await request(app)
        .post('/api/assets/request-upload')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ extension: 'jpg' })
        .expect(200);

      expect(response.body).toHaveProperty('signedUrl');
      expect(response.body).toHaveProperty('publicUrl');
      expect(response.body).toHaveProperty('s3Key');

      expect(response.body.signedUrl).toContain('hunthub-assets-dev');
      expect(response.body.publicUrl).toContain('d2vf5nl8r3do9r.cloudfront.net');
      expect(response.body.s3Key).toContain(testUser.id);
      expect(response.body.s3Key).toMatch(/\.jpg$/);
    });

    it('should accept all allowed image extensions', async () => {
      const extensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

      for (const ext of extensions) {
        const response = await request(app)
          .post('/api/assets/request-upload')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ extension: ext })
          .expect(200);

        expect(response.body).toHaveProperty('signedUrl');
        expect(response.body.s3Key).toMatch(new RegExp(`\\.${ext}$`));
      }
    });

    it('should accept all allowed video extensions', async () => {
      const extensions = ['mp4', 'webm'];

      for (const ext of extensions) {
        const response = await request(app)
          .post('/api/assets/request-upload')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ extension: ext })
          .expect(200);

        expect(response.body).toHaveProperty('signedUrl');
        expect(response.body.s3Key).toMatch(new RegExp(`\\.${ext}$`));
      }
    });

    it('should accept all allowed audio extensions', async () => {
      const extensions = ['mp3', 'wav', 'ogg'];

      for (const ext of extensions) {
        const response = await request(app)
          .post('/api/assets/request-upload')
          .set('Authorization', `Bearer ${authToken}`)
          .query({ extension: ext })
          .expect(200);

        expect(response.body).toHaveProperty('signedUrl');
        expect(response.body.s3Key).toMatch(new RegExp(`\\.${ext}$`));
      }
    });

    it('should return 400 for invalid extension', async () => {
      const response = await request(app)
        .post('/api/assets/request-upload')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ extension: 'exe' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not allowed');
    });

    it('should return 400 when extension is missing', async () => {
      const response = await request(app)
        .post('/api/assets/request-upload')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('extension query parameter required');
    });

    it('should return 401 when no auth token provided', async () => {
      await request(app)
        .post('/api/assets/request-upload')
        .query({ extension: 'jpg' })
        .expect(401);
    });
  });

  describe('POST /api/assets - Create Asset', () => {
    it('should create a new asset and return 201', async () => {
      const assetData = generateAssetCreateData({
        name: 'test-image.jpg',
        mime: MimeTypes.ImageJpeg,
        sizeBytes: 2048000,
      });

      const response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(assetData)
        .expect(201);

      expect(response.body).toMatchObject({
        ownerId: testUser.id,
        mimeType: MimeTypes.ImageJpeg,
        originalFilename: 'test-image.jpg',
        size: 2048000,
        url: assetData.url,
      });

      expect(response.body).toHaveProperty('assetId');
      expect(typeof response.body.assetId).toBe('number');
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('storageLocation');
      expect(response.body.storageLocation).toHaveProperty('bucket');
      expect(response.body.storageLocation).toHaveProperty('path');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);
    });

    it('should reject invalid MIME type', async () => {
      const assetData = generateAssetCreateData({
        mime: 'application/exe',
      });

      const response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(assetData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not allowed');
    });

    it('should reject file size exceeding limit', async () => {
      const assetData = generateAssetCreateData({
        sizeBytes: 11 * 1024 * 1024,
      });

      const response = await request(app)
        .post('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(assetData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('exceeds');
    });

    it('should return 401 when no auth token provided', async () => {
      const assetData = generateAssetCreateData();

      await request(app).post('/api/assets').send(assetData).expect(401);
    });
  });

  describe('GET /api/assets - Get User Assets', () => {
    it('should return all user assets', async () => {
      await createTestAssets(3, { ownerId: testUser.id });

      const response = await request(app)
        .get('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3);

      response.body.forEach((asset: any) => {
        expect(asset).toHaveProperty('assetId');
        expect(asset).toHaveProperty('ownerId', testUser.id);
        expect(asset).toHaveProperty('url');
        expect(asset).toHaveProperty('mimeType');
      });
    });

    it('should return empty array when user has no assets', async () => {
      const response = await request(app)
        .get('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('should filter assets by MIME type', async () => {
      // Create mixed assets
      await createTestAsset({ ownerId: testUser.id, mimeType: MimeTypes.ImageJpeg });
      await createTestAsset({ ownerId: testUser.id, mimeType: MimeTypes.ImagePng });
      await createTestAsset({ ownerId: testUser.id, mimeType: MimeTypes.VideoMp4 });

      const response = await request(app)
        .get('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: MimeTypes.ImageJpeg })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].mimeType).toBe(MimeTypes.ImageJpeg);
    });

    it('should return 400 for invalid MIME type filter', async () => {
      const response = await request(app)
        .get('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ type: 'application/invalid' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not allowed');
    });

    it('should not return assets from other users', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      await createTestAssets(2, { ownerId: otherUser.id });

      await createTestAsset({ ownerId: testUser.id });

      const response = await request(app)
        .get('/api/assets')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].ownerId).toBe(testUser.id);
    });

    it('should return 401 when no auth token provided', async () => {
      await request(app).get('/api/assets').expect(401);
    });
  });

  describe('GET /api/assets/:id - Get Asset by ID', () => {
    it('should return asset by ID for owner', async () => {
      const asset = await createTestAsset({ ownerId: testUser.id });

      const response = await request(app)
        .get(`/api/assets/${asset.assetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        assetId: asset.assetId,
        ownerId: testUser.id,
        mimeType: asset.mimeType,
        url: asset.url,
      });

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('storageLocation');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should return 404 for non-existent asset', async () => {
      const response = await request(app)
        .get('/api/assets/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });

    it('should return 404 when trying to access another user asset', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherAsset = await createTestAsset({ ownerId: otherUser.id });

      const response = await request(app)
        .get(`/api/assets/${otherAsset.assetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 401 when no auth token provided', async () => {
      const asset = await createTestAsset({ ownerId: testUser.id });

      await request(app).get(`/api/assets/${asset.assetId}`).expect(401);
    });
  });

  describe('DELETE /api/assets/:id - Delete Asset', () => {
    it('should delete asset and return 204', async () => {
      const asset = await createTestAsset({ ownerId: testUser.id });

      await request(app)
        .delete(`/api/assets/${asset.assetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      const response = await request(app)
        .get(`/api/assets/${asset.assetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent asset', async () => {
      const response = await request(app)
        .delete('/api/assets/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });

    it('should return 404 when trying to delete another user asset', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherAsset = await createTestAsset({ ownerId: otherUser.id });

      const response = await request(app)
        .delete(`/api/assets/${otherAsset.assetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');

      mockFirebaseAuth(otherUser);
      const otherToken = createTestAuthToken(otherUser);

      await request(app)
        .get(`/api/assets/${otherAsset.assetId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200);
    });

    it('should return 401 when no auth token provided', async () => {
      const asset = await createTestAsset({ ownerId: testUser.id });

      await request(app).delete(`/api/assets/${asset.assetId}`).expect(401);
    });
  });
});
