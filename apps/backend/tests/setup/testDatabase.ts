import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer | null = null;

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