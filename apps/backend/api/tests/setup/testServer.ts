import 'tsconfig-paths/register';
import 'reflect-metadata';
import express, { Express } from 'express';
import bodyParser from 'body-parser';

import huntRouter from '@/modules/hunts/hunt.routes';
import stepRouter from '@/modules/steps/step.routes';
import authRouter from '@/modules/auth/auth.routes';
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

  // Error handler
  app.use(errorHandler);

  return app;
};
