import { Schema, model } from 'mongoose';
import { ICounter } from '../types/Counter';

const counterSchema = new Schema<ICounter>({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  seq: {
    type: Number,
    required: true,
  },
});

export async function getNextSequence(counterName: string): Promise<number> {
  const counter = await CounterModel.findOneAndUpdate(
    { name: counterName },
    { $inc: { seq: 1 } }, // Atomic increment
    { new: true }, // Return updated value
  );

  if (!counter) {
    throw new Error(`Counter '${counterName}' not found. ` + `Run 'npm run init-counters' to initialize counters.`);
  }

  return counter.seq;
}

const CounterModel = model<ICounter>('Counter', counterSchema);
export default CounterModel;
