import 'dotenv';
import mongoose from 'mongoose';
import { logger } from '@/utils/logger';

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

export default async function mustConnectDb(connectionURI: string) {
  try {
    await mongoose.connect(connectionURI);
    mongoose.set('toJSON', {
      transform: baseTransform,
    });

    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}
