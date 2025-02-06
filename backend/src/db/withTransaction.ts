import mongoose, { ClientSession } from 'mongoose';

type TransactionCallback<T> = (session: ClientSession) => Promise<T>;

export const executeTransaction = async <T>(callback: TransactionCallback<T>): Promise<T> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
