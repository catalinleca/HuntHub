import 'dotenv';
import mongoose from 'mongoose';
import { logger } from '@/utils/logger';
import CounterModel from './models/Counter';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function baseTransform(_: unknown, ret: any) {
  const id = ret._id.toString();
  delete ret._id;
  delete ret.__v;

  if (ret?.createdAt) {
    ret.createdAt = ret.createdAt.toISOString();
  }
  if (ret?.updatedAt) {
    ret.updatedAt = ret.updatedAt.toISOString();
  }

  return {
    id,
    ...ret,
  };
}

const COUNTER_DEFAULTS = [
  { name: 'hunt', seq: 999 },
  { name: 'step', seq: 9999 },
  { name: 'asset', seq: 99999 },
];

async function ensureCounters(): Promise<void> {
  for (const counter of COUNTER_DEFAULTS) {
    await CounterModel.updateOne({ name: counter.name }, { $setOnInsert: counter }, { upsert: true });
  }
  logger.info('Counters initialized');
}

export default async function mustConnectDb(connectionURI: string) {
  try {
    await mongoose.connect(connectionURI);
    mongoose.set('toJSON', {
      transform: baseTransform,
    });

    logger.info('Connected to MongoDB');

    await ensureCounters();
  } catch (err) {
    logger.error({ err }, 'MongoDB connection failed');
    process.exit(1);
  }
}
