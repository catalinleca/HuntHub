import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import CounterModel from '@/database/models/Counter';

let mongoServer: MongoMemoryServer | null = null;

/**
 * Base transform for toJSON - converts _id to id and formats dates
 */
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

/**
 * Connect to in-memory MongoDB for testing
 */
export const connectTestDatabase = async (): Promise<void> => {
  try {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Connect mongoose to in-memory DB
    await mongoose.connect(mongoUri);

    // Configure toJSON transform (same as production)
    mongoose.set('toJSON', {
      transform: baseTransform,
    });

    await initializeCounters();

    console.log('✅ Connected to in-memory test database');
  } catch (error) {
    console.error('❌ Error connecting to test database:', error);
    throw error;
  }
};

/**
 * Clear all data from database (run before each test)
 */
export const clearTestDatabase = async (): Promise<void> => {
  if (!mongoose.connection.db) {
    throw new Error('Database connection not established');
  }

  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }

  // Reinitialize counters after clearing database
  await initializeCounters();
};

const initializeCounters = async (): Promise<void> => {
  const counters = [
    { name: 'hunt', seq: 999 },
    { name: 'step', seq: 9999 },
  ];

  for (const counter of counters) {
    await CounterModel.findOneAndUpdate(
      { name: counter.name },
      { $set: { seq: counter.seq } },  // Reset to starting value each time
      { upsert: true, new: true },
    );
  }
};

/**
 * Close database connection and stop in-memory server
 */
export const closeTestDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();

    if (mongoServer) {
      await mongoServer.stop();
    }

    console.log('✅ Closed test database connection');
  } catch (error) {
    console.error('❌ Error closing test database:', error);
    throw error;
  }
};
