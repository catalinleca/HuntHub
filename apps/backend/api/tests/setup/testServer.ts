import 'tsconfig-paths/register';
import 'reflect-metadata';
import express, { Express } from 'express';
import bodyParser from 'body-parser';

// Mock StorageService BEFORE importing routes (routes resolve dependencies at import time)
import { container } from '@/config/inversify';
import { TYPES } from '@/shared/types';
import { MockStorageService } from '../mocks/storageService.mock';

container.unbind(TYPES.StorageService);
container.bind(TYPES.StorageService).to(MockStorageService);

import huntRouter from '@/modules/hunts/hunt.routes';
import stepRouter from '@/modules/steps/step.routes';
import authRouter from '@/modules/auth/auth.routes';
import assetRouter from '@/modules/assets/asset.routes';
import { errorHandler } from '@/shared/middlewares/error.middleware';
import { authMiddleware } from '@/shared/middlewares/auth.middleware';

export const createTestApp = (): Express => {
  const app = express();

  // Middleware
  app.use(bodyParser.json());

  // Routes
  app.use('/auth', authRouter);
  app.use('/api', authMiddleware);
  app.use('/api/hunts', huntRouter);
  app.use('/api/hunts', stepRouter);
  app.use('/api/assets', assetRouter);

  // Error handler
  app.use(errorHandler);

  return app;
};
