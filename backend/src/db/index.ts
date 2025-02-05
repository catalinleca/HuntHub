import 'dotenv';
import mongoose from 'mongoose';

export default async function mustConnectDb(connectionURI: string) {
  try {
    await mongoose.connect(connectionURI);

    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}
