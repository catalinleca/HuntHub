import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import huntRouter from './routes/hunt';

// Load .env.local file first
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import mustConnectDb from './db';
import { databaseUrl } from './config';

async function bootstrap() {
  await mustConnectDb(databaseUrl);

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(bodyParser.json());

  app.use('/api', huntRouter);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

bootstrap();
