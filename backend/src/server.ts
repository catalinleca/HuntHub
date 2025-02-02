import 'module-alias/register';
import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import mustConnectDb from './db';
import { databaseUrl } from './config';

import huntRouter from '@/routes/hunt.router';

async function bootstrap() {
  if (!databaseUrl) {
    throw new Error('Database URL not found');
  }
  await mustConnectDb(databaseUrl);

  const app = express();
  app.use(bodyParser.json());

  const PORT = process?.env.PORT || 3000;

  app.use('/api/hunts', huntRouter);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

bootstrap();
