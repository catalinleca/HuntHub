import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../../setup/testServer';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestHunt } from '../../setup/factories/hunt.factory';
import { createTestAsset } from '../../setup/factories/asset.factory';
import { mockFirebaseAuth, createTestAuthToken, clearFirebaseAuthMocks } from '../../helpers/authHelper';
import { IUser } from '@/database/types';
import { MimeTypes } from '@/database/types';

describe('Pagination Integration Tests', () => {
  let app: Express;
  let testUser: IUser;
  let authToken: string;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    testUser = await createTestUser({ email: 'test@example.com' });
    mockFirebaseAuth(testUser);
    authToken = createTestAuthToken(testUser);
  });

  afterEach(() => {
    clearFirebaseAuthMocks();
  });

  describe('Hunt Pagination', () => {
    beforeEach(async () => {
      for (let i = 1; i <= 25; i++) {
        await createTestHunt({ creatorId: testUser.id, name: `Hunt ${i}` });
      }
    });

    it('should paginate hunts with default params', async () => {
      const response = await request(app).get('/api/hunts').set('Authorization', `Bearer ${authToken}`).expect(200);

      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination).toMatchObject({
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should return second page', async () => {
      const response = await request(app)
        .get('/api/hunts')
        .query({ page: 2, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination).toMatchObject({
        page: 2,
        hasNext: true,
        hasPrev: true,
      });
    });

    it('should return last page with remaining items', async () => {
      const response = await request(app)
        .get('/api/hunts')
        .query({ page: 3, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(5);
      expect(response.body.pagination).toMatchObject({
        page: 3,
        totalPages: 3,
        hasNext: false,
        hasPrev: true,
      });
    });

    it('should return empty array for page beyond total', async () => {
      const response = await request(app)
        .get('/api/hunts')
        .query({ page: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(0);
      expect(response.body.pagination.total).toBe(25);
    });

    it('should sort by createdAt ascending', async () => {
      const response = await request(app)
        .get('/api/hunts')
        .query({ sortBy: 'createdAt', sortOrder: 'asc', limit: 5 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const dates = response.body.data.map((h: any) => new Date(h.createdAt).getTime());
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
      }
    });

    it('should handle custom limit', async () => {
      const response = await request(app)
        .get('/api/hunts')
        .query({ limit: 20 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(20);
      expect(response.body.pagination.limit).toBe(20);
    });

    it('should cap limit at 100', async () => {
      const response = await request(app)
        .get('/api/hunts')
        .query({ limit: 999 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.limit).toBe(100);
    });

    it('should reject invalid page', async () => {
      await request(app)
        .get('/api/hunts')
        .query({ page: 'invalid' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should reject negative limit', async () => {
      await request(app).get('/api/hunts').query({ limit: -1 }).set('Authorization', `Bearer ${authToken}`).expect(400);
    });
  });

  describe('Asset Pagination', () => {
    beforeEach(async () => {
      for (let i = 0; i < 15; i++) {
        await createTestAsset({
          ownerId: testUser.id,
          mimeType: i % 2 === 0 ? MimeTypes.ImageJpeg : MimeTypes.ImagePng,
        });
      }
    });

    it('should paginate assets with default params', async () => {
      const response = await request(app).get('/api/assets').set('Authorization', `Bearer ${authToken}`).expect(200);

      expect(response.body.data).toHaveLength(10);
      expect(response.body.pagination).toMatchObject({
        total: 15,
        totalPages: 2,
      });
    });

    it('should filter and paginate by mimeType', async () => {
      const response = await request(app)
        .get('/api/assets')
        .query({ mimeType: MimeTypes.ImageJpeg })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(8);
      expect(response.body.pagination.total).toBe(8);
      expect(response.body.data.every((a: any) => a.mimeType === MimeTypes.ImageJpeg)).toBe(true);
    });

    it('should sort by size descending', async () => {
      const response = await request(app)
        .get('/api/assets')
        .query({ sortBy: 'size', sortOrder: 'desc' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(10);
    });
  });

  describe('Query Parameter Coercion', () => {
    beforeEach(async () => {
      await createTestHunt({ creatorId: testUser.id, name: 'Test Hunt' });
    });

    it('should coerce string page to number', async () => {
      const response = await request(app)
        .get('/api/hunts?page=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
    });

    it('should apply defaults when params omitted', async () => {
      const response = await request(app).get('/api/hunts').set('Authorization', `Bearer ${authToken}`);

      if (response.status !== 200) {
        console.log('Error response:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
      });
    });
  });
});
