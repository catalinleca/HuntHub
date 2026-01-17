import 'tsconfig-paths/register';
import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';

const result = dotenv.config({ path: '.env.local' });
if (!result.error) {
  console.log('Environment loaded from .env.local');
} else {
  console.error('.env.local not found');
}

import mustConnectDb from './database';
import { databaseUrl } from './config/env.config';
import './config/firebase';

import huntRouter from '@/modules/hunts/hunt.routes';
import stepRouter from '@/modules/steps/step.routes';
import authRouter from '@/modules/auth/auth.routes';
import assetRouter from '@/modules/assets/asset.routes';
import publishingRouter from '@/features/publishing/publishing.routes';
import huntShareRouter from '@/features/sharing/hunt-share.routes';
import playRouter from '@/features/play/play.routes';
import cloneRouter from '@/features/cloning/clone.routes';

import { errorHandler, authMiddleware } from '@/shared/middlewares';

async function bootstrap() {
  if (!databaseUrl) {
    throw new Error('Database URL not found');
  }
  await mustConnectDb(databaseUrl);

  const app = express();

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean) || ['http://localhost:5174'];
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    }),
  );

  app.use(bodyParser.json());

  app.use('/auth', authRouter);

  app.use('/api/play', playRouter);

  app.use('/api', authMiddleware);
  app.use('/api/hunts', huntRouter);
  app.use('/api/hunts', stepRouter);
  app.use('/api/hunts', publishingRouter);
  app.use('/api/hunts', huntShareRouter);
  app.use('/api/hunts', cloneRouter);
  app.use('/api/assets', assetRouter);

  app.use(errorHandler);

  const PORT = process?.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

bootstrap();
