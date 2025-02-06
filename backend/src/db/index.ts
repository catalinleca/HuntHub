import 'dotenv';
import mongoose from 'mongoose';

function baseTransform(_: unknown, ret: any) {
  const id = ret._id.toString();
  delete ret._id;

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
    mongoose.set('toObject', {
      transform: baseTransform,
      virtuals: true,
      versionKey: false,
      depopulate: true,
      flattenObjectIds: true,
    });

    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}
