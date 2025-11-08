import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../.env.local') });

import mongoose from 'mongoose';
import CounterModel from '../src/database/models/Counter';
import { databaseUrl } from '../src/config/env.config';

async function initializeCounters() {
  try {
    const mongoUri = databaseUrl;
    if (!mongoUri) {
      throw new Error('databaseUrl environment variable is not defined');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const counters = [
      { name: 'hunt', seq: 999 },
      { name: 'step', seq: 9999 },
    ];

    for (const counter of counters) {
      const result = await CounterModel.updateOne(
        { name: counter.name },
        { $setOnInsert: counter }, // Only sets if document doesn't exist
        { upsert: true },
      );

      if (result.upsertedCount && result.upsertedCount > 0) {
        console.log(`Counter '${counter.name}' initialized to ${counter.seq}`);
      } else {
        console.log(`Counter '${counter.name}' already exists`);
      }
    }

    console.log('All counters initialized successfully');
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing counters:', error);
    process.exit(1);
  }
}

initializeCounters();
