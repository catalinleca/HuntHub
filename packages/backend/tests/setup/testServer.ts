import 'tsconfig-paths/register';
import 'reflect-metadata';
import express, { Express } from 'express';
import bodyParser from 'body-parser';

import huntRouter from '@/routes/hunt.router';
import authRouter from '@/routes/auth.routes';
import { errorHandler } from '@/middlewares/error.middleware';
import { authMiddleware } from '@/middlewares/auth.middleware';

export const createTestApp = (): Express => {
  const app = express();

  // Middleware
  app.use(bodyParser.json());

  // Routes
  app.use('/auth', authRouter);
  app.use('/api', authMiddleware);
  app.use('/api/hunts', huntRouter);

  // Error handler
  app.use(errorHandler);

  return app;
};
