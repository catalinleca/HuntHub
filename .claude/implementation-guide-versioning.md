# Implementation Guide: Versioning Architecture Migration

**Last updated:** 2025-11-04

**Status:** Ready to implement

This guide walks through implementing the new versioning architecture step by step.

---

## Overview

**Goal:** Migrate from current mixed-content Hunt model to clean versioning architecture.

**Architecture:** Hunt (master) + HuntVersion (content) + versioned Steps + LiveHunt (runtime)

**Total Estimated Time:** 32-41 hours

---

## Phase 1: Database Models & Types (8-10 hours)

### ✅ Step 1.1: Create HuntVersion Type Interface (15 min)

**File:** `apps/backend/api/src/database/types/HuntVersion.ts`

**Action:** Create new file with IHuntVersion interface

**Fields to add:**
```typescript
interface IHuntVersion {
  huntId: number;           // Compound key part 1 (FK to Hunt)
  version: number;          // Compound key part 2 (1, 2, 3...)

  // Content
  name: string;
  description?: string;
  startLocation?: ILocation;
  stepOrder: number[];

  // State flags
  isPublished: boolean;     // true = read-only
  isDraft: boolean;         // true = current working version

  // Audit
  publishedAt?: Date;
  publishedBy?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
```

**Note:**
- Use existing ILocation from location.schema.ts
- `(huntId, version)` is the compound primary key (no separate versionId)

---

### ✅ Step 1.2: Create HuntVersion Mongoose Schema (30 min)

**File:** `apps/backend/api/src/database/models/HuntVersion.ts`

**Action:** Create Mongoose model with schema

**Schema fields:**
- huntId: Number, required (compound key part 1)
- version: Number, required (compound key part 2)
- name: String, required, trim, minLength: 3, maxLength: 100
- description: String, optional
- startLocation: locationSchema (embedded)
- stepOrder: [Number], default: []
- isPublished: Boolean, default: false
- isDraft: Boolean, default: true
- publishedAt: Date, optional
- publishedBy: String, optional
- timestamps: true

**Indexes:**
```typescript
{ huntId: 1, version: 1 } unique compound (primary key)
{ huntId: 1, isDraft: 1 } unique partial (where isDraft: true) - only one draft per hunt
{ huntId: 1, isPublished: 1 }
```

**toJSON transform:**
- Remove _id, __v
- Keep huntId and version as identifiers

**No counter needed:**
- version number is calculated (currentMaxVersion + 1)

---

### ✅ Step 1.3: Create HuntVersion Mapper (20 min)

**File:** `apps/backend/api/src/shared/mappers/huntVersion.mapper.ts`

**Action:** Create mapper functions

**Methods needed:**
```typescript
toDocument(data: HuntVersionCreate): Partial<IHuntVersion>
toDocumentUpdate(data: HuntVersionUpdate): Partial<IHuntVersion>
fromDocument(doc: IHuntVersion): HuntVersionResponse
```

**Handle:**
- Location object transformation
- Date formatting
- ObjectId → string conversions

---

### ✅ Step 1.4: Update Hunt Type (10 min)

**File:** `apps/backend/api/src/database/types/Hunt.ts`

**Action:** Update IHunt interface

**REMOVE these fields:**
- `name: string`
- `description?: string`
- `startLocation?: ILocation`
- `stepOrder?: number[]`
- `currentVersion: number`

**ADD these fields:**
- `latestVersion: number` - Points to current draft HuntVersion
- `liveVersion?: number` - Points to playable HuntVersion (null if never published)

**KEEP these fields:**
- huntId, creatorId, status
- isDeleted, deletedAt
- activePlayerCount, lastPlayedAt
- createdAt, updatedAt

**Result:**
```typescript
interface IHunt {
  huntId: number;
  creatorId: mongoose.Types.ObjectId;
  status: HuntStatus;

  // NEW: Version pointers
  latestVersion: number;    // Current draft version
  liveVersion?: number;     // Live version (null = not published)

  // Runtime state
  isDeleted: boolean;
  deletedAt?: Date;
  activePlayerCount: number;
  lastPlayedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}
```

---

### ✅ Step 1.5: Update Hunt Mongoose Schema (20 min)

**File:** `apps/backend/api/src/database/models/Hunt.ts`

**Action:** Update schema to match new IHunt

**Remove from schema:**
- name field
- description field
- startLocation field
- stepOrder field
- currentVersion field

**Add to schema:**
- latestVersion: Number, required
- liveVersion: Number, optional

**Update indexes if needed:**
- Keep: huntId unique, creatorId, status

---

### ✅ Step 1.6: Update Step Type (5 min)

**File:** `apps/backend/api/src/database/types/Step.ts`

**Action:** Add version field

**ADD:**
```typescript
version: number;  // FK to HuntVersion (together with huntId forms compound FK)
```

**KEEP:**
- huntId (for convenience queries and compound FK)
- All other existing fields

**Result:**
```typescript
interface IStep {
  stepId: number;
  huntId: number;           // Compound FK part 1
  version: number;          // NEW: Compound FK part 2 - which version owns this step
  type: string;
  challenge: unknown;
  // ... rest unchanged
}
```

**Note:**
- `(huntId, version)` together form compound FK to HuntVersion
- Query Steps with: `{ huntId, version }`

---

### ✅ Step 1.7: Update Step Mongoose Schema (15 min)

**File:** `apps/backend/api/src/database/models/Step.ts`

**Action:** Add version field and compound index

**Add to schema:**
- version: Number, required

**Add compound index:**
- `{ huntId: 1, version: 1, createdAt: 1 }` - Query steps by hunt version

**Keep existing indexes:**
- stepId unique
- huntId indexes

**Note:**
- Always query Steps with both huntId AND version
- Example: `Step.find({ huntId, version })`

---

### ✅ Step 1.8: Update LiveHunt Type (10 min)

**File:** `apps/backend/api/src/database/types/LiveHunt.ts`

**Action:** Add huntId and version, remove versionId

**REMOVE:**
- `versionId: ObjectId`

**ADD:**
- `huntId: number` - Which master hunt this belongs to
- `version: number` - Which version is live (compound FK with huntId)
- `sessionCount: number` - Active player sessions
- `lastPlayedAt?: Date` - Last access time

**Result:**
```typescript
interface ILiveHunt {
  id: string;               // Keep MongoDB _id
  huntId: number;           // NEW: Compound FK part 1
  version: number;          // NEW: Compound FK part 2 - which version is live
  sessionCount: number;     // NEW: Active sessions
  lastPlayedAt?: Date;      // NEW: Last play time
  createdAt?: Date;
  updatedAt?: Date;
}
```

**Note:**
- `(huntId, version)` together reference HuntVersion
- Hunt.liveVersion stores the version number that matches this

---

### ✅ Step 1.9: Update LiveHunt Mongoose Schema (15 min)

**File:** `apps/backend/api/src/database/models/LiveHunt.ts`

**Action:** Update schema with new fields

**Update schema:**
- huntId: Number, required, unique (one live version per hunt)
- version: Number, required
- sessionCount: Number, default: 0
- lastPlayedAt: Date, optional

**Update indexes:**
- `{ huntId: 1 }` unique (ensure only one live version per hunt)
- `{ huntId: 1, version: 1 }` compound (FK to HuntVersion)

**Note:**
- Unique index on huntId ensures only ONE live version per hunt
- Compound index on (huntId, version) enables FK constraint verification

---

### ✅ Step 1.10: Mark PublishedHunt as Deprecated (5 min)

**Files:**
- `apps/backend/api/src/database/types/PublishedHunt.ts`
- `apps/backend/api/src/database/models/PublishedHunt.ts`

**Action:** Add deprecation comments

**Add to top of each file:**
```typescript
/**
 * @deprecated
 * This model is replaced by HuntVersion.isPublished flag.
 * Kept for migration reference only.
 * Will be removed after migration is complete.
 */
```

**Do NOT delete files yet** - needed for data migration

---

## Phase 2: Service Layer (10-12 hours)

### ✅ Step 2.1: Create HuntVersionService (2 hours)

**File:** `apps/backend/api/src/modules/hunts/huntVersion.service.ts`

**Action:** Create new service

**Methods to implement:**
```typescript
interface IHuntVersionService {
  // Basic CRUD
  createVersion(data: HuntVersionCreate, userId: string): Promise<IHuntVersion>;
  getVersion(huntId: number, version: number): Promise<IHuntVersion>;
  getDraftVersion(huntId: number): Promise<IHuntVersion>;

  // Updates
  updateVersion(huntId: number, version: number, data: HuntVersionUpdate): Promise<IHuntVersion>;

  // Version management
  cloneVersion(huntId: number, sourceVersion: number, newVersion: number): Promise<IHuntVersion>;
  markAsPublished(huntId: number, version: number, userId: string): Promise<IHuntVersion>;

  // Queries
  listVersions(huntId: number): Promise<IHuntVersion[]>;
  getPublishedVersions(huntId: number): Promise<IHuntVersion[]>;
}
```

**Key patterns:**
- All methods use compound key `(huntId, version)` to identify versions
- Query pattern: `HuntVersionModel.findOne({ huntId, version })`
- Protection: Check `isPublished` flag before any update

---

### ✅ Step 2.2: Update HuntService.createHunt (1 hour)

**File:** `apps/backend/api/src/modules/hunts/hunt.service.ts`

**Action:** Update to create Hunt + HuntVersion

**Current logic:**
```typescript
// OLD: Creates Hunt with content
const hunt = await HuntModel.create({
  huntId,
  creatorId,
  name,
  description,
  status: 'draft'
});
```

**New logic:**
```typescript
// 1. Create Hunt master record
const hunt = await HuntModel.create({
  huntId: await getNextSequence('huntId'),
  creatorId,
  status: 'draft',
  latestVersion: 1,     // Points to version number 1
  liveVersion: null     // Not published yet
});

// 2. Create HuntVersion v1 (draft)
const version = await HuntVersionModel.create({
  huntId: hunt.huntId,  // Compound key part 1
  version: 1,           // Compound key part 2
  name,
  description,
  isPublished: false,
  isDraft: true
});

// 3. Return combined data
return {
  huntId: hunt.huntId,
  version: version.version,
  name: version.name,
  description: version.description,
  status: hunt.status,
  latestVersion: hunt.latestVersion,
  liveVersion: hunt.liveVersion,
  // ... merge Hunt + HuntVersion
};
```

**Note:**
- NO versionId field
- Hunt.latestVersion stores version NUMBER (1, 2, 3...)
- Query this version with: `{ huntId, version: 1 }`

---

### ✅ Step 2.3: Update HuntService.getHuntById (45 min)

**File:** `apps/backend/api/src/modules/hunts/hunt.service.ts`

**Action:** Fetch Hunt + latest HuntVersion

**Current logic:**
```typescript
// OLD: Returns Hunt with content
const hunt = await HuntModel.findOne({ huntId });
return hunt.toJSON();
```

**New logic:**
```typescript
// 1. Fetch Hunt
const hunt = await HuntModel.findOne({ huntId });
if (!hunt) throw new NotFoundError();

// 2. Fetch latest HuntVersion
const version = await HuntVersionModel.findOne({
  huntId,
  version: hunt.latestVersion  // ✅ CORRECT: Query with version number
});
if (!version) throw new NotFoundError();

// 3. Combine and return
return {
  huntId: hunt.huntId,
  version: version.version,
  name: version.name,
  description: version.description,
  stepOrder: version.stepOrder,
  isPublished: version.isPublished,
  status: hunt.status,
  latestVersion: hunt.latestVersion,
  liveVersion: hunt.liveVersion,
  // ... merge all fields
};
```

**Note:**
- ✅ This query pattern is CORRECT
- Uses `{ huntId, version: hunt.latestVersion }` compound key
- NO versionId in response

---

### ✅ Step 2.4: Update HuntService.updateHunt (1 hour)

**File:** `apps/backend/api/src/modules/hunts/hunt.service.ts`

**Action:** Update draft HuntVersion, not Hunt

**Current logic:**
```typescript
// OLD: Updates Hunt directly
await HuntModel.updateOne({ huntId }, { name, description });
```

**New logic:**
```typescript
// 1. Find Hunt
const hunt = await HuntModel.findOne({ huntId });
if (!hunt) throw new NotFoundError();

// 2. Find draft HuntVersion
const version = await HuntVersionModel.findOne({
  huntId,
  version: hunt.latestVersion  // ✅ CORRECT: Compound key query
});
if (!version) throw new NotFoundError();

// 3. Protection check
if (version.isPublished) {
  throw new Error('Cannot edit published version');
}

// 4. Update HuntVersion
await HuntVersionModel.updateOne(
  { huntId, version: hunt.latestVersion },  // ✅ CORRECT: Compound key
  { name, description, startLocation }
);

// 5. Return combined data (same as getHuntById)
```

**Note:**
- Query pattern: `{ huntId, version: hunt.latestVersion }`
- Hunt.latestVersion is a VERSION NUMBER
- Always query HuntVersion with both huntId AND version

---

### ✅ Step 2.5: Add HuntService.publishDraft (2 hours)

**File:** `apps/backend/api/src/modules/hunts/hunt.service.ts`

**Action:** Add new method to publish current draft

**New method:**
```typescript
async publishDraft(huntId: number, userId: string): Promise<void> {
  // 1. Get Hunt
  const hunt = await HuntModel.findOne({ huntId });
  if (!hunt) throw new NotFoundError();

  // 2. Get current draft version
  const currentVersion = await HuntVersionModel.findOne({
    huntId,
    version: hunt.latestVersion  // ✅ Compound key
  });
  if (!currentVersion) throw new NotFoundError();

  // 3. Mark current version as published
  await HuntVersionModel.updateOne(
    { huntId, version: hunt.latestVersion },  // ✅ Compound key
    {
      isPublished: true,
      isDraft: false,
      publishedAt: new Date(),
      publishedBy: userId
    }
  );

  // 4. Clone HuntVersion → create new draft
  const newVersionNumber = currentVersion.version + 1;
  await HuntVersionModel.create({
    huntId: currentVersion.huntId,      // Compound key part 1
    version: newVersionNumber,          // Compound key part 2
    name: currentVersion.name,
    description: currentVersion.description,
    startLocation: currentVersion.startLocation,
    stepOrder: [...currentVersion.stepOrder],
    isPublished: false,
    isDraft: true
  });

  // 5. Clone all Steps
  const steps = await StepModel.find({
    huntId,
    version: currentVersion.version  // ✅ Compound key
  });
  const newSteps = steps.map(step => ({
    stepId: step.stepId,
    huntId: step.huntId,
    version: newVersionNumber,  // ✅ New version number
    type: step.type,
    challenge: step.challenge,
    hint: step.hint,
    requiredLocation: step.requiredLocation
  }));
  await StepModel.insertMany(newSteps);

  // 6. Update Hunt pointer to new version NUMBER
  await HuntModel.updateOne(
    { huntId },
    { latestVersion: newVersionNumber }  // ✅ Store version NUMBER
  );
}
```

**Note:**
- All queries use compound key `{ huntId, version }`
- Version numbers are simple integers: 1, 2, 3...
- Hunt.latestVersion stores the new version NUMBER
- Steps are cloned with new version number

---

### ✅ Step 2.6: Add HuntService.setLiveVersion (1 hour)

**File:** `apps/backend/api/src/modules/hunts/hunt.service.ts`

**Action:** Add new method to set live version

**New method:**
```typescript
async setLiveVersion(huntId: number, versionNumber: number): Promise<void> {
  // 1. Validate Hunt exists
  const hunt = await HuntModel.findOne({ huntId });
  if (!hunt) throw new NotFoundError();

  // 2. Validate version exists and is published
  const version = await HuntVersionModel.findOne({
    huntId,
    version: versionNumber  // ✅ Compound key
  });
  if (!version) throw new NotFoundError('Version not found');
  if (!version.isPublished) {
    throw new ValidationError('Can only set published versions as live');
  }

  // 3. Check for active players (optional)
  const liveHunt = await LiveHuntModel.findOne({ huntId });
  if (liveHunt && liveHunt.sessionCount > 0) {
    throw new ValidationError(
      `Cannot change live version while ${liveHunt.sessionCount} players are active`
    );
  }

  // 4. Update Hunt.liveVersion to version NUMBER
  await HuntModel.updateOne(
    { huntId },
    { liveVersion: versionNumber }  // ✅ Store version NUMBER
  );

  // 5. Update/create LiveHunt
  await LiveHuntModel.updateOne(
    { huntId },
    {
      huntId,
      version: versionNumber,  // ✅ Store version NUMBER
      sessionCount: 0,
      lastPlayedAt: new Date()
    },
    { upsert: true }
  );
}
```

**Note:**
- Parameter is `versionNumber` (1, 2, 3...), not versionId
- Query HuntVersion with compound key: `{ huntId, version: versionNumber }`
- Hunt.liveVersion stores version NUMBER
- LiveHunt.version stores version NUMBER

---

### ✅ Step 2.7: Update StepService.createStep (45 min)

**File:** `apps/backend/api/src/modules/steps/step.service.ts`

**Action:** Associate step with HuntVersion

**Current logic:**
```typescript
// OLD: Creates step with huntId only
const step = await StepModel.create({
  stepId,
  huntId,
  type,
  challenge
});

// Update hunt's stepOrder
await HuntModel.updateOne(
  { huntId },
  { $push: { stepOrder: step.stepId } }
);
```

**New logic:**
```typescript
// 1. Get Hunt
const hunt = await HuntModel.findOne({ huntId });
if (!hunt) throw new NotFoundError();

// 2. Get draft HuntVersion
const version = await HuntVersionModel.findOne({
  huntId,
  version: hunt.latestVersion  // ✅ Compound key
});
if (!version) throw new NotFoundError();

// 3. Protection check
if (version.isPublished) {
  throw new Error('Cannot add steps to published version');
}

// 4. Create Step with version number
const step = await StepModel.create({
  stepId: await getNextSequence('stepId'),
  huntId,
  version: version.version,  // ✅ NEW: Store version number
  type,
  challenge
});

// 5. Update HuntVersion.stepOrder (not Hunt!)
await HuntVersionModel.updateOne(
  { huntId, version: version.version },  // ✅ Compound key
  { $push: { stepOrder: step.stepId } }
);
```

**Note:**
- Step.version stores version NUMBER
- Query HuntVersion with compound key
- Steps belong to a specific version

---

### ✅ Step 2.8: Update StepService.updateStep (30 min)

**File:** `apps/backend/api/src/modules/steps/step.service.ts`

**Action:** Verify editing draft only

**Current logic:**
```typescript
// OLD: Updates step directly
await StepModel.updateOne(
  { stepId, huntId },
  { challenge, hint }
);
```

**New logic:**
```typescript
// 1. Find Step
const step = await StepModel.findOne({ stepId, huntId });
if (!step) throw new NotFoundError();

// 2. Find HuntVersion
const version = await HuntVersionModel.findOne({
  huntId,
  version: step.version  // ✅ Compound key
});
if (!version) throw new NotFoundError();

// 3. Protection check
if (version.isPublished) {
  throw new Error('Cannot edit steps in published version');
}

// 4. Update Step
await StepModel.updateOne(
  { stepId, huntId, version: step.version },  // ✅ Include version
  { challenge, hint }
);
```

**Note:**
- Step has version field (not versionId)
- Query HuntVersion with compound key `{ huntId, version }`

---

### ✅ Step 2.9: Update StepService.deleteStep (30 min)

**File:** `apps/backend/api/src/modules/steps/step.service.ts`

**Action:** Remove from HuntVersion.stepOrder

**Current logic:**
```typescript
// OLD: Removes from Hunt.stepOrder
await HuntModel.updateOne(
  { huntId },
  { $pull: { stepOrder: stepId } }
);
await StepModel.deleteOne({ stepId, huntId });
```

**New logic:**
```typescript
// 1. Find Step
const step = await StepModel.findOne({ stepId, huntId });
if (!step) throw new NotFoundError();

// 2. Find HuntVersion
const version = await HuntVersionModel.findOne({
  huntId,
  version: step.version  // ✅ Compound key
});
if (!version) throw new NotFoundError();

// 3. Protection check
if (version.isPublished) {
  throw new Error('Cannot delete steps from published version');
}

// 4. Remove from HuntVersion.stepOrder
await HuntVersionModel.updateOne(
  { huntId, version: step.version },  // ✅ Compound key
  { $pull: { stepOrder: stepId } }
);

// 5. Delete Step
await StepModel.deleteOne({ stepId, huntId, version: step.version });
```

**Note:**
- Query HuntVersion with compound key
- Delete Step using huntId, stepId, and version

---

### ✅ Step 2.10: Update HuntService.reorderSteps (30 min)

**File:** `apps/backend/api/src/modules/hunts/hunt.service.ts`

**Action:** Update HuntVersion.stepOrder, not Hunt

**Current logic:**
```typescript
// OLD: Updates Hunt.stepOrder
await HuntModel.updateOne(
  { huntId },
  { stepOrder: newOrder }
);
```

**New logic:**
```typescript
// 1. Get Hunt
const hunt = await HuntModel.findOne({ huntId });
if (!hunt) throw new NotFoundError();

// 2. Get draft HuntVersion
const version = await HuntVersionModel.findOne({
  huntId,
  version: hunt.latestVersion  // ✅ Compound key
});
if (!version) throw new NotFoundError();

// 3. Protection check
if (version.isPublished) {
  throw new Error('Cannot reorder steps in published version');
}

// 4. Update HuntVersion.stepOrder
await HuntVersionModel.updateOne(
  { huntId, version: version.version },  // ✅ Compound key
  { stepOrder: newOrder }
);
```

**Note:**
- Query HuntVersion with compound key
- Only draft versions can be reordered

---

## Phase 3: Data Migration (6-8 hours)

### ✅ Step 3.1: Create Migration Script (4 hours)

**File:** `apps/backend/api/scripts/migrate-to-versioning.ts`

**Action:** Create migration script

**Script structure:**
```typescript
import mongoose from 'mongoose';
import HuntModel from '../src/database/models/Hunt';
import HuntVersionModel from '../src/database/models/HuntVersion';
import StepModel from '../src/database/models/Step';
import LiveHuntModel from '../src/database/models/LiveHunt';

async function migrate(dryRun = false) {
  console.log(`Starting migration (dry-run: ${dryRun})`);

  // 1. Migrate Hunts → create HuntVersion v1 and v2
  const hunts = await HuntModel.find({});
  console.log(`Found ${hunts.length} hunts to migrate`);

  for (const hunt of hunts) {
    console.log(`\nMigrating hunt ${hunt.huntId}...`);

    // Create HuntVersion v1 from Hunt content
    const v1Data = {
      huntId: hunt.huntId,      // ✅ Compound key part 1
      version: 1,               // ✅ Compound key part 2
      name: hunt.name,
      description: hunt.description,
      startLocation: hunt.startLocation,
      stepOrder: hunt.stepOrder || [],
      isPublished: hunt.status === 'published',
      isDraft: false
    };

    if (!dryRun) {
      await HuntVersionModel.create(v1Data);
    }
    console.log(`  Created HuntVersion v1`);

    // Create HuntVersion v2 as draft (clone of v1)
    const v2Data = {
      huntId: hunt.huntId,      // ✅ Compound key part 1
      version: 2,               // ✅ Compound key part 2
      name: hunt.name,
      description: hunt.description,
      startLocation: hunt.startLocation,
      stepOrder: hunt.stepOrder || [],
      isPublished: false,
      isDraft: true
    };

    if (!dryRun) {
      await HuntVersionModel.create(v2Data);
    }
    console.log(`  Created HuntVersion v2 (draft)`);

    // Update Hunt record - store version NUMBERS
    if (!dryRun) {
      await HuntModel.updateOne(
        { huntId: hunt.huntId },
        {
          $unset: { name: '', description: '', startLocation: '', stepOrder: '', currentVersion: '' },
          $set: {
            latestVersion: 2,  // ✅ Version NUMBER (not versionId)
            liveVersion: hunt.status === 'published' ? 1 : null  // ✅ Version NUMBER
          }
        }
      );
    }
    console.log(`  Updated Hunt: latestVersion=2, liveVersion=${hunt.status === 'published' ? 1 : null}`);
  }

  // 2. Update Steps with version number
  console.log(`\nUpdating Steps...`);
  const steps = await StepModel.find({});
  console.log(`Found ${steps.length} steps to update`);

  for (const step of steps) {
    const hunt = await HuntModel.findOne({ huntId: step.huntId });
    if (!hunt) {
      console.warn(`  Warning: Step ${step.stepId} references missing hunt ${step.huntId}`);
      continue;
    }

    // All existing steps belong to the latest version (v2)
    if (!dryRun) {
      await StepModel.updateOne(
        { _id: step._id },
        { $set: { version: 2 } }  // ✅ Version NUMBER (matches latestVersion)
      );
    }
  }
  console.log(`Updated ${steps.length} steps with version=2`);

  // 3. Update LiveHunt records
  console.log(`\nUpdating LiveHunt records...`);
  const liveHunts = await LiveHuntModel.find({});
  console.log(`Found ${liveHunts.length} live hunts`);

  for (const liveHunt of liveHunts) {
    // Old versionId was ObjectId pointing to Hunt
    // Need to find which hunt and get its liveVersion
    const hunt = await HuntModel.findOne({ _id: liveHunt.versionId });
    if (!hunt) {
      console.warn(`  Warning: LiveHunt references missing hunt`);
      continue;
    }

    if (!dryRun) {
      await LiveHuntModel.updateOne(
        { _id: liveHunt._id },
        {
          $unset: { versionId: '' },  // Remove old ObjectId field
          $set: {
            huntId: hunt.huntId,
            version: hunt.liveVersion || hunt.latestVersion,  // ✅ Version NUMBER
            sessionCount: 0
          }
        }
      );
    }
  }
  console.log(`Updated ${liveHunts.length} live hunts`);

  console.log(`\nMigration complete!`);
}

// CLI
const dryRun = process.argv.includes('--dry-run');
migrate(dryRun)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
```

**Key points:**
- ✅ NO versionId field anywhere
- ✅ HuntVersion uses compound key `(huntId, version)`
- ✅ Hunt.latestVersion = 2 (version NUMBER)
- ✅ Hunt.liveVersion = 1 or null (version NUMBER)
- ✅ Steps get version = 2 (matches latestVersion)
- ✅ LiveHunt uses version NUMBER

**Usage:**
```bash
# Dry run first (no changes)
ts-node apps/backend/api/scripts/migrate-to-versioning.ts --dry-run

# Real migration
ts-node apps/backend/api/scripts/migrate-to-versioning.ts
```

---

### ✅ Step 3.2: Test Migration on Dev Data (2 hours)

**Actions:**
1. Create database backup
2. Run migration in dry-run mode
3. Review output logs
4. Run real migration
5. Verify data:
   - All hunts have HuntVersion v1 and v2
   - All steps have version = 2
   - All LiveHunt records have huntId and version
   - Hunt fields removed correctly (name, description, stepOrder)
   - Hunt.latestVersion = 2, Hunt.liveVersion = 1 or null
6. Test rollback (restore from backup)

---

## Phase 4: API Types & Validation (2-3 hours)

### ✅ Step 4.1: Update Shared Hunt Type (20 min)

**File:** `packages/shared/src/types/index.ts`

**Action:** Update Hunt interface for API

**Current:**
```typescript
export interface Hunt {
  huntId: number;
  creatorId: string;
  name: string;
  description?: string;
  currentVersion: number;
  status: HuntStatus;
  stepOrder?: number[];
  // ...
}
```

**New (Combined for backward compatibility):**
```typescript
export interface Hunt {
  huntId: number;
  creatorId: string;
  status: HuntStatus;

  // From HuntVersion (latest/draft)
  version: number;             // NEW (replaces currentVersion)
  name: string;
  description?: string;
  startLocation?: Location;
  stepOrder?: number[];

  // Version metadata
  isPublished: boolean;        // NEW
  isDraft: boolean;            // NEW
  publishedAt?: string;        // NEW

  // Hunt-level metadata
  latestVersion: number;       // NEW: Points to latest version number
  liveVersion?: number;        // NEW: Points to live version number (null if not published)

  createdAt?: string;
  updatedAt?: string;
}
```

**Note:**
- ✅ NO versionId field
- ✅ version identifies which HuntVersion this represents
- ✅ latestVersion and liveVersion store version NUMBERS (1, 2, 3...)

---

### ✅ Step 4.2: Create HuntVersion API Type (15 min)

**File:** `packages/shared/src/types/index.ts`

**Action:** Add new types

**Add:**
```typescript
export interface HuntVersion {
  huntId: number;            // Compound key part 1
  version: number;           // Compound key part 2
  name: string;
  description?: string;
  startLocation?: Location;
  stepOrder: number[];
  isPublished: boolean;
  isDraft: boolean;
  publishedAt?: string;
  publishedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HuntVersionSummary {
  huntId: number;            // Compound key part 1
  version: number;           // Compound key part 2
  name: string;
  isPublished: boolean;
  isDraft: boolean;
  publishedAt?: string;
  createdAt: string;
}
```

**Note:**
- ✅ NO versionId field
- ✅ Identified by compound key `(huntId, version)`
- ✅ Frontend queries with: `/api/hunts/${huntId}/versions/${version}`

---

### ✅ Step 4.3: Update OpenAPI Schema (45 min)

**File:** `packages/shared/openapi/hunthub_models.yaml`

**Action:** Update Hunt schema, add HuntVersion schema

**Update Hunt schema:**
- Remove: currentVersion
- Add: version, isPublished, isDraft, latestVersion, liveVersion

**Add HuntVersion schema:**
- All HuntVersion fields
- Mark as separate component
- Document compound key (huntId, version)

**Update Step schema:**
- Add: version (required)
- Document that version + huntId form compound FK to HuntVersion

**Note:**
- ✅ NO versionId in any schema
- ✅ All version references are simple numbers (1, 2, 3...)

---

### ✅ Step 4.4: Regenerate Types (30 min)

**Actions:**
1. Run `npm run generate` in packages/shared
2. Fix any TypeScript errors in backend
3. Update imports if needed

---

### ✅ Step 4.5: Update Validation Schemas (30 min)

**Files:** Validation schemas in backend

**Action:** Update Zod schemas

**Updates needed:**
- Hunt creation schema (no version fields)
- Hunt update schema (no version fields)
- Hunt response schema (add version fields)
- Step creation schema (no version field - auto-set by backend)
- Step response schema (add version field)

**Note:**
- ✅ NO versionId in schemas
- ✅ version field stores simple numbers (1, 2, 3...)

---

## Phase 5: Testing (4-6 hours)

### ✅ Step 5.1: Update Hunt CRUD Tests (1.5 hours)

**File:** `apps/backend/api/tests/integration/hunts/huntCrud.test.ts`

**Actions:**
- Update createHunt test: Verify HuntVersion v1 created
- Update getHunt test: Verify combined Hunt + HuntVersion data
- Update updateHunt test: Verify HuntVersion updated (not Hunt)
- Update deleteHunt test: Verify still works

---

### ✅ Step 5.2: Add Publishing Tests (2 hours)

**File:** `apps/backend/api/tests/integration/hunts/publishing.test.ts` (NEW)

**Tests to add:**
- POST /hunts/:id/publish - Publish draft
- POST /hunts/:id/publish - Cannot publish if already published
- PUT /hunts/:id/live - Set version as live
- PUT /hunts/:id/live - Cannot set unpublished version as live
- PUT /hunts/:id - Cannot edit published version

---

### ✅ Step 5.3: Update Step Tests (1 hour)

**File:** `apps/backend/api/tests/integration/steps/stepCrud.test.ts`

**Actions:**
- Update createStep test: Verify version field set (matches hunt.latestVersion)
- Update updateStep test: Verify can only edit draft
- Update deleteStep test: Verify can only delete from draft

**Note:**
- ✅ Steps have version field (not versionId)
- ✅ Step.version matches Hunt.latestVersion

---

### ✅ Step 5.4: Add Version Management Tests (1.5 hours)

**File:** `apps/backend/api/tests/integration/hunts/versions.test.ts` (NEW)

**Tests to add:**
- GET /hunts/:id/versions - List all versions
- GET /hunts/:id/versions/:version - Get specific version
- Verify version cloning works
- Verify step cloning works
- Verify draft vs published version retrieval

---

## Phase 6: Documentation & Cleanup (2 hours)

### ✅ Step 6.1: Update Backend Documentation (45 min)

**Files:**
- `.claude/backend/architecture.md` - Add versioning explanation
- `.claude/backend/current-state.md` - Update with new models

---

### ✅ Step 6.2: Add Migration Notes (30 min)

**File:** `.claude/backend/migration-notes.md` (NEW)

**Content:**
- Document migration steps
- Add rollback instructions
- Known issues and fixes

---

### ✅ Step 6.3: Code Cleanup (45 min)

**Actions:**
- Remove unused imports
- Update comments
- Run linter and fix issues
- Remove PublishedHunt files (after confirming migration success)

---

## Summary Checklist

**Phase 1: Models & Types**
- [ ] 1.1 Create HuntVersion type
- [ ] 1.2 Create HuntVersion schema
- [ ] 1.3 Create HuntVersion mapper
- [ ] 1.4 Update Hunt type
- [ ] 1.5 Update Hunt schema
- [ ] 1.6 Update Step type
- [ ] 1.7 Update Step schema
- [ ] 1.8 Update LiveHunt type
- [ ] 1.9 Update LiveHunt schema
- [ ] 1.10 Mark PublishedHunt deprecated

**Phase 2: Services**
- [ ] 2.1 Create HuntVersionService
- [ ] 2.2 Update createHunt
- [ ] 2.3 Update getHuntById
- [ ] 2.4 Update updateHunt
- [ ] 2.5 Add publishDraft
- [ ] 2.6 Add setLiveVersion
- [ ] 2.7 Update createStep
- [ ] 2.8 Update updateStep
- [ ] 2.9 Update deleteStep
- [ ] 2.10 Update reorderSteps

**Phase 3: Migration**
- [ ] 3.1 Create migration script
- [ ] 3.2 Test on dev data

**Phase 4: API Types**
- [ ] 4.1 Update Hunt type
- [ ] 4.2 Create HuntVersion type
- [ ] 4.3 Update OpenAPI schema
- [ ] 4.4 Regenerate types
- [ ] 4.5 Update validation schemas

**Phase 5: Testing**
- [ ] 5.1 Update Hunt tests
- [ ] 5.2 Add publishing tests
- [ ] 5.3 Update Step tests
- [ ] 5.4 Add version tests

**Phase 6: Docs**
- [ ] 6.1 Update backend docs
- [ ] 6.2 Add migration notes
- [ ] 6.3 Code cleanup

---

## Estimated Timeline

- **Phase 1:** 8-10 hours
- **Phase 2:** 10-12 hours
- **Phase 3:** 6-8 hours
- **Phase 4:** 2-3 hours
- **Phase 5:** 4-6 hours
- **Phase 6:** 2 hours

**Total:** 32-41 hours

---

## Ready to Start?

We'll go step by step. Let me know when you want to begin with Step 1.1!