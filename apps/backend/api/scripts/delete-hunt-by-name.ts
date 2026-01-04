import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(__dirname, '../.env.local') });

import mongoose from 'mongoose';
import { databaseUrl } from '../src/config/env.config';
import { HuntModel, HuntVersionModel, StepModel } from '../src/database/models';

const huntName = process.argv[2];

if (!huntName) {
  console.error('Usage: npx ts-node -r tsconfig-paths/register scripts/delete-hunt-by-name.ts "Hunt Name"');
  process.exit(1);
}

async function deleteHuntByName() {
  await mongoose.connect(databaseUrl);
  console.log('Connected to MongoDB');

  const huntVersion = await HuntVersionModel.findOne({ name: huntName });
  if (!huntVersion) {
    console.log(`No hunt found with name: "${huntName}"`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const huntId = huntVersion.huntId;
  console.log(`Found hunt #${huntId}: "${huntName}"`);

  // Delete steps
  const stepsDeleted = await StepModel.deleteMany({ huntId });
  console.log(`Deleted ${stepsDeleted.deletedCount} steps`);

  // Delete hunt versions
  const versionsDeleted = await HuntVersionModel.deleteMany({ huntId });
  console.log(`Deleted ${versionsDeleted.deletedCount} hunt versions`);

  // Delete hunt master
  const huntDeleted = await HuntModel.deleteOne({ huntId });
  console.log(`Deleted ${huntDeleted.deletedCount} hunt master`);

  console.log(`\n✅ Hunt #${huntId} deleted successfully`);
  await mongoose.disconnect();
}

deleteHuntByName();
