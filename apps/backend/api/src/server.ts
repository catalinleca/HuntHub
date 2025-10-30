import 'tsconfig-paths/register';
import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import mustConnectDb from './database';
import { databaseUrl } from './config/env.config';
import './config/firebase';

import huntRouter from '@/modules/hunts/hunt.routes';
import stepRouter from '@/modules/steps/step.routes';
import authRouter from '@/modules/auth/auth.routes';
import { errorHandler, authMiddleware } from '@/shared/middlewares';

async function bootstrap() {
  if (!databaseUrl) {
    throw new Error('Database URL not found');
  }
  await mustConnectDb(databaseUrl);

  const app = express();
  app.use(bodyParser.json());

  app.use('/auth', authRouter);
  app.use('/api', authMiddleware);
  app.use('/api/hunts', huntRouter);
  app.use('/api/hunts', stepRouter);

  app.use(errorHandler);

  const PORT = process?.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

bootstrap();
