# Hunt Versioning Architecture

**Last updated:** 2025-11-04

**Status:** ✅ IMPLEMENTED AND COMPLETE

This document describes the complete versioning system for HuntHub. This is a **clean, fresh design** with no legacy logic.

**Implementation Status:**
- ✅ Phase 1: Database Models & Types - COMPLETE (2025-11-04)
- ✅ Phase 2: Service Layer - COMPLETE (2025-11-04)
- ✅ Data Integrity Fixes - COMPLETE (2025-11-04)
- ✅ Test Infrastructure - COMPLETE (MongoDB replica set for transactions)
- ✅ All 69 tests passing with transaction safety
- ⏳ Phase 3: Publishing Workflow - NEXT (publishHunt() method)

---

## Core Concepts

### What Is a Version?

A **version** is a complete snapshot of a hunt's content (metadata + steps) at a specific point in time.

**Key principles:**
1. **Publish** = Save current state as read-only snapshot
2. **Draft** = Latest version (always editable)
3. **Live** = The version players see (separate choice)
4. **History** = All published versions preserved forever

### Version Lifecycle

```
Create Hunt → Edit Draft (v1) → Publish → Edit Draft (v2) → Publish → Edit Draft (v3)...
                  ↓                  ↓                  ↓
              mutable          v1 locked          v2 locked
                               (can set live)     (can set live)
```

---

## High-Level Architecture

### Four Collections

**1. Hunt (Master Record)**
- One per unique hunt
- Stores identity and pointers
- Shows in "My Hunts" dashboard

**2. HuntVersion (Content Snapshots)**
- Multiple per hunt
- Stores versioned content
- Has `isPublished` flag for protection

**3. Step (Versioned Steps)**
- Multiple per hunt version
- Separate entities (FK to hunt + version)
- Efficient CRUD operations

**4. LiveHunt (Runtime State)**
- One per hunt
- Tracks which version is live
- Stores mutable operational data

---

## Schema Definitions

### Collection: Hunt

**Purpose:** Master record for each unique hunt. One document per hunt.

```typescript
interface IHunt {
  _id: mongoose.Types.ObjectId;  // MongoDB internal ID
  huntId: number;                 // Public ID (e.g., 1001)
  creatorId: string;              // User who created this hunt

  // Version pointers
  latestVersion: number;          // Current draft version (e.g., 3)
  liveVersion: number | null;     // Live version (e.g., 2), null if never published

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
```typescript
{ huntId: 1 } unique
{ creatorId: 1 }
```

**Example:**
```typescript
Hunt {
  _id: ObjectId("507f1f77bcf86cd799439011"),
  huntId: 1001,
  creatorId: "user-abc123",
  latestVersion: 3,
  liveVersion: 2,
  createdAt: Date("2025-01-15"),
  updatedAt: Date("2025-02-20")
}
```

---

### Collection: HuntVersion

**Purpose:** Versioned snapshots of hunt content. Multiple documents per hunt.

```typescript
interface IHuntVersion {
  _id: mongoose.Types.ObjectId;  // MongoDB internal ID
  huntId: number;                 // FK to Hunt
  version: number;                // Version number (1, 2, 3...)

  // Protection flag
  isPublished: boolean;           // true = read-only, false = draft

  // Content (changes per version)
  name: string;
  description: string;
  startLocation?: ILocation;
  stepOrder: number[];            // [101, 102, 103] - stepIds in order

  // Audit trail
  createdAt: Date;
  createdBy: string;              // User who created this version
}
```

**Indexes:**
```typescript
{ huntId: 1, version: 1 } unique compound
{ huntId: 1, isPublished: 1 }
```

**Example:**
```typescript
// Version 1 (published)
HuntVersion {
  _id: ObjectId("507f1f77bcf86cd799439012"),
  huntId: 1001,
  version: 1,
  isPublished: true,
  name: "Barcelona Adventure",
  description: "Explore the city",
  stepOrder: [101, 102, 103],
  createdAt: Date("2025-01-15"),
  createdBy: "user-abc123"
}

// Version 2 (published)
HuntVersion {
  _id: ObjectId("507f1f77bcf86cd799439013"),
  huntId: 1001,
  version: 2,
  isPublished: true,
  name: "Barcelona Adventure - Updated",
  description: "Explore the city with new challenges",
  stepOrder: [101, 104, 103],
  createdAt: Date("2025-02-10"),
  createdBy: "user-abc123"
}

// Version 3 (draft)
HuntVersion {
  _id: ObjectId("507f1f77bcf86cd799439014"),
  huntId: 1001,
  version: 3,
  isPublished: false,
  name: "Barcelona Adventure - Updated",
  description: "Explore the city with new challenges",
  stepOrder: [101, 104, 103],
  createdAt: Date("2025-02-10"),
  createdBy: "user-abc123"
}
```

---

### Collection: Step

**Purpose:** Individual hunt steps. Versioned separately, linked via FK.

```typescript
interface IStep {
  _id: mongoose.Types.ObjectId;  // MongoDB internal ID
  stepId: number;                 // Public ID (e.g., 101) - same across versions
  huntId: number;                 // FK to Hunt
  version: number;                // FK to HuntVersion

  // Content
  type: 'clue' | 'quiz' | 'mission' | 'task';
  challenge: IChallenge;          // Discriminated union based on type
  requiredLocation?: ILocation;
  hint?: string;

  createdAt: Date;
}
```

**Indexes:**
```typescript
{ huntId: 1, version: 1 }
{ stepId: 1, huntId: 1, version: 1 } unique compound
```

**Example:**
```typescript
// Version 1 steps
Step {
  _id: ObjectId("507f1f77bcf86cd799439015"),
  stepId: 101,
  huntId: 1001,
  version: 1,
  type: 'clue',
  challenge: { clue: { title: "Find the fountain", description: "..." } }
}

Step {
  _id: ObjectId("507f1f77bcf86cd799439016"),
  stepId: 102,
  huntId: 1001,
  version: 1,
  type: 'quiz',
  challenge: { quiz: { title: "Answer the riddle", ... } }
}

// Version 2 steps (cloned from v1, then modified)
Step {
  _id: ObjectId("507f1f77bcf86cd799439017"),
  stepId: 101,
  huntId: 1001,
  version: 2,
  type: 'clue',
  challenge: { clue: { title: "Find the magic fountain", ... } }  // Modified
}

Step {
  _id: ObjectId("507f1f77bcf86cd799439018"),
  stepId: 104,  // NEW step
  huntId: 1001,
  version: 2,
  type: 'mission',
  challenge: { mission: { ... } }
}
```

---

### Collection: LiveHunt

**Purpose:** Runtime operational state. One document per hunt.

```typescript
interface ILiveHunt {
  _id: mongoose.Types.ObjectId;
  huntId: number;                 // FK to Hunt
  version: number;                // Which version is live

  // Runtime state (mutable)
  activePlayerCount: number;
  lastPlayedAt: Date;

  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes:**
```typescript
{ huntId: 1 } unique
```

**Example:**
```typescript
LiveHunt {
  _id: ObjectId("507f1f77bcf86cd799439019"),
  huntId: 1001,
  version: 2,
  activePlayerCount: 12,
  lastPlayedAt: Date("2025-02-20T14:30:00Z"),
  createdAt: Date("2025-01-20"),
  updatedAt: Date("2025-02-20")
}
```

---

## Complete Workflows

### Workflow 1: Create Hunt

**User action:** Create new hunt

**Objects created:**
```typescript
// 1. Create Hunt master record
Hunt {
  huntId: 1001,
  creatorId: "user-abc123",
  latestVersion: 1,
  liveVersion: null,  // Not published yet
  createdAt: Date.now()
}

// 2. Create HuntVersion v1 (draft)
HuntVersion {
  huntId: 1001,
  version: 1,
  isPublished: false,  // Draft
  name: "Barcelona Adventure",
  description: "Explore the city",
  stepOrder: [],  // No steps yet
  createdAt: Date.now(),
  createdBy: "user-abc123"
}
```

**Result:** User has empty draft hunt (version 1).

---

### Workflow 2: Add Steps to Draft

**User action:** Add 3 steps to draft

**Objects created:**
```typescript
Step {
  stepId: 101,
  huntId: 1001,
  version: 1,
  type: 'clue',
  challenge: { clue: { title: "Find fountain", ... } }
}

Step {
  stepId: 102,
  huntId: 1001,
  version: 1,
  type: 'quiz',
  challenge: { quiz: { title: "Answer riddle", ... } }
}

Step {
  stepId: 103,
  huntId: 1001,
  version: 1,
  type: 'mission',
  challenge: { mission: { title: "Take photo", ... } }
}
```

**Object updated:**
```typescript
HuntVersion {
  huntId: 1001,
  version: 1,
  stepOrder: [101, 102, 103]  // Updated with step IDs
}
```

---

### Workflow 3: Edit Draft (Before Publishing)

**User action:** Edit step 101 title

**Object updated:**
```typescript
// Direct update to Step v1 (in-place, no cloning)
Step {
  stepId: 101,
  huntId: 1001,
  version: 1,
  type: 'clue',
  challenge: { clue: { title: "Find the magic fountain", ... } }  // Changed
}
```

**Other objects:** Unchanged

**Why no cloning?** Version 1 is still draft (`isPublished: false`), so we edit directly.

---

### Workflow 4: Publish Version 1

**User action:** Click "Publish" button

**Process:**

**Step 1: Clone HuntVersion**
```typescript
// Existing v1 (before publish)
HuntVersion {
  huntId: 1001,
  version: 1,
  isPublished: false,
  name: "Barcelona Adventure",
  stepOrder: [101, 102, 103]
}

// Update v1 to published
HuntVersion {
  huntId: 1001,
  version: 1,
  isPublished: true,  // ← Changed to true
  name: "Barcelona Adventure",
  stepOrder: [101, 102, 103]
}

// Create v2 (new draft, clone of v1)
HuntVersion {
  huntId: 1001,
  version: 2,
  isPublished: false,
  name: "Barcelona Adventure",
  stepOrder: [101, 102, 103]  // Same as v1
}
```

**Step 2: Clone all Steps**
```typescript
// Existing v1 steps (unchanged)
Step { stepId: 101, huntId: 1001, version: 1, ... }
Step { stepId: 102, huntId: 1001, version: 1, ... }
Step { stepId: 103, huntId: 1001, version: 1, ... }

// New v2 steps (clones)
Step { stepId: 101, huntId: 1001, version: 2, ... }  // Clone
Step { stepId: 102, huntId: 1001, version: 2, ... }  // Clone
Step { stepId: 103, huntId: 1001, version: 2, ... }  // Clone
```

**Step 3: Update Hunt**
```typescript
Hunt {
  huntId: 1001,
  latestVersion: 2,  // ← Changed from 1 to 2
  liveVersion: null  // ← Still null (not set as live yet)
}
```

**Result:**
- v1 is locked (isPublished: true)
- v2 is new draft (isPublished: false)
- User can now edit v2
- v1 preserved for history

---

### Workflow 5: Set Version as Live

**User action:** Click "Set v1 as Live"

**Objects updated:**
```typescript
// Update Hunt pointer
Hunt {
  huntId: 1001,
  latestVersion: 2,
  liveVersion: 1  // ← Changed from null to 1
}

// Create/update LiveHunt
LiveHunt {
  huntId: 1001,
  version: 1,  // ← Points to v1
  activePlayerCount: 0,
  lastPlayedAt: null
}
```

**Result:** Players now see version 1 data when they play.

---

### Workflow 6: Edit Draft v2

**User action:** Edit step 101 in draft v2

**Protection check:**
```typescript
const huntVersion = await HuntVersion.findOne({ huntId: 1001, version: 2 });

if (huntVersion.isPublished) {
  throw new Error('Cannot edit published version');
}
// isPublished = false, proceed
```

**Object updated:**
```typescript
// Direct update to Step v2
Step {
  stepId: 101,
  huntId: 1001,
  version: 2,
  challenge: { clue: { title: "Updated title", ... } }  // Changed
}
```

**Objects unchanged:**
```typescript
// v1 step remains intact
Step {
  stepId: 101,
  huntId: 1001,
  version: 1,
  challenge: { clue: { title: "Find the magic fountain", ... } }  // Original
}
```

**Result:** v2 modified, v1 unchanged, players still see v1.

---

### Workflow 7: Publish v2 and Set as Live

**User action:** Publish v2 and make it live

**Process:**

**Step 1: Publish v2**
```typescript
// Mark v2 as published
HuntVersion {
  huntId: 1001,
  version: 2,
  isPublished: true  // ← Changed
}

// Clone v2 → create v3 (new draft)
HuntVersion {
  huntId: 1001,
  version: 3,
  isPublished: false
}

// Clone all v2 steps → create v3 steps
Step { stepId: 101, huntId: 1001, version: 3, ... }
Step { stepId: 102, huntId: 1001, version: 3, ... }
Step { stepId: 103, huntId: 1001, version: 3, ... }
```

**Step 2: Set v2 as live**
```typescript
Hunt {
  huntId: 1001,
  latestVersion: 3,  // ← New draft
  liveVersion: 2     // ← Changed to v2
}

LiveHunt {
  huntId: 1001,
  version: 2,  // ← Updated to v2
  activePlayerCount: 0
}
```

**Final state:**
```typescript
// Hunt
Hunt { huntId: 1001, latestVersion: 3, liveVersion: 2 }

// Versions
HuntVersion { huntId: 1001, version: 1, isPublished: true }   // Old
HuntVersion { huntId: 1001, version: 2, isPublished: true }   // Live
HuntVersion { huntId: 1001, version: 3, isPublished: false }  // Draft

// Steps
Step { stepId: 101, huntId: 1001, version: 1 }  // Old
Step { stepId: 101, huntId: 1001, version: 2 }  // Live (updated title)
Step { stepId: 101, huntId: 1001, version: 3 }  // Draft
```

---

## Query Patterns

### Query 1: List User's Hunts (Dashboard)

**Goal:** Show all hunts user created

```typescript
const hunts = await Hunt.find({ creatorId: userId });
```

**Returns:**
```typescript
[
  { huntId: 1001, latestVersion: 3, liveVersion: 2 },
  { huntId: 1002, latestVersion: 1, liveVersion: null },
  { huntId: 1003, latestVersion: 5, liveVersion: 4 }
]
```

**To get names:**
```typescript
const huntsWithNames = await Hunt.aggregate([
  { $match: { creatorId: userId } },
  {
    $lookup: {
      from: 'huntversions',
      let: { huntId: '$huntId', latestVer: '$latestVersion' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$huntId', '$$huntId'] },
                { $eq: ['$version', '$$latestVer'] }
              ]
            }
          }
        }
      ],
      as: 'versionData'
    }
  },
  { $unwind: '$versionData' },
  {
    $project: {
      huntId: 1,
      name: '$versionData.name',
      latestVersion: 1,
      liveVersion: 1,
      createdAt: 1
    }
  }
]);
```

**Result:** Dashboard shows 20 hunts, not 100 version documents.

---

### Query 2: Get Hunt for Editing (Latest Version)

**Goal:** Load draft for editing

```typescript
const hunt = await Hunt.findOne({ huntId: 1001 });
const version = await HuntVersion.findOne({
  huntId: hunt.huntId,
  version: hunt.latestVersion
});
const steps = await Step.find({
  huntId: hunt.huntId,
  version: hunt.latestVersion
});

return {
  huntId: hunt.huntId,
  version: version.version,
  name: version.name,
  description: version.description,
  stepOrder: version.stepOrder,
  steps: steps
};
```

**Returns:** Latest version (v3) data only.

---

### Query 3: Get Hunt for Playing (Live Version)

**Goal:** Load live version for players

```typescript
const hunt = await Hunt.findOne({ huntId: 1001 });

if (!hunt.liveVersion) {
  throw new NotFoundError('Hunt not published');
}

const version = await HuntVersion.findOne({
  huntId: hunt.huntId,
  version: hunt.liveVersion
});
const steps = await Step.find({
  huntId: hunt.huntId,
  version: hunt.liveVersion
});

return {
  huntId: hunt.huntId,
  version: version.version,
  name: version.name,
  steps: steps
};
```

**Returns:** Live version (v2) data only.

---

### Query 4: Get Specific Version (History View)

**Goal:** View old version

```typescript
const version = await HuntVersion.findOne({
  huntId: 1001,
  version: 1
});
const steps = await Step.find({
  huntId: 1001,
  version: 1
});

return {
  huntId: 1001,
  version: version.version,
  name: version.name,
  steps: steps
};
```

**Returns:** Version 1 data (preserved).

---

### Query 5: List All Versions for Hunt

**Goal:** Show version history

```typescript
const versions = await HuntVersion.find({ huntId: 1001 })
  .sort({ version: -1 });

return versions.map(v => ({
  version: v.version,
  name: v.name,
  isPublished: v.isPublished,
  createdAt: v.createdAt
}));
```

**Returns:**
```typescript
[
  { version: 3, name: "...", isPublished: false, createdAt: "..." },
  { version: 2, name: "...", isPublished: true, createdAt: "..." },
  { version: 1, name: "...", isPublished: true, createdAt: "..." }
]
```

---

## Update Operations

### Update 1: Edit Hunt Metadata (Draft)

```typescript
const hunt = await Hunt.findOne({ huntId: 1001 });
const version = await HuntVersion.findOne({
  huntId: 1001,
  version: hunt.latestVersion
});

// Protection
if (version.isPublished) {
  throw new Error('Cannot edit published version');
}

// Update
await HuntVersion.updateOne(
  { huntId: 1001, version: hunt.latestVersion },
  {
    name: "New Name",
    description: "New Description"
  }
);
```

**Result:** HuntVersion v3 updated in place.

---

### Update 2: Edit Step (Draft)

```typescript
const hunt = await Hunt.findOne({ huntId: 1001 });
const version = await HuntVersion.findOne({
  huntId: 1001,
  version: hunt.latestVersion
});

// Protection
if (version.isPublished) {
  throw new Error('Cannot edit published version');
}

// Update
await Step.updateOne(
  {
    stepId: 101,
    huntId: 1001,
    version: hunt.latestVersion
  },
  {
    'challenge.clue.title': "Updated title"
  }
);
```

**Result:** Step 101 v3 updated in place.

---

### Update 3: Add Step (Draft)

```typescript
const hunt = await Hunt.findOne({ huntId: 1001 });
const version = await HuntVersion.findOne({
  huntId: 1001,
  version: hunt.latestVersion
});

// Protection
if (version.isPublished) {
  throw new Error('Cannot edit published version');
}

// Create new step
const newStep = await Step.create({
  stepId: await getNextStepId(),
  huntId: 1001,
  version: hunt.latestVersion,
  type: 'quiz',
  challenge: { quiz: { ... } }
});

// Add to stepOrder
await HuntVersion.updateOne(
  { huntId: 1001, version: hunt.latestVersion },
  { $push: { stepOrder: newStep.stepId } }
);
```

**Result:** New step created in v3, stepOrder updated.

---

### Update 4: Delete Step (Draft)

```typescript
const hunt = await Hunt.findOne({ huntId: 1001 });
const version = await HuntVersion.findOne({
  huntId: 1001,
  version: hunt.latestVersion
});

// Protection
if (version.isPublished) {
  throw new Error('Cannot edit published version');
}

// Delete step
await Step.deleteOne({
  stepId: 102,
  huntId: 1001,
  version: hunt.latestVersion
});

// Remove from stepOrder
await HuntVersion.updateOne(
  { huntId: 1001, version: hunt.latestVersion },
  { $pull: { stepOrder: 102 } }
);
```

**Result:** Step 102 removed from v3.

---

### Update 5: Reorder Steps (Draft)

```typescript
const hunt = await Hunt.findOne({ huntId: 1001 });
const version = await HuntVersion.findOne({
  huntId: 1001,
  version: hunt.latestVersion
});

// Protection
if (version.isPublished) {
  throw new Error('Cannot edit published version');
}

// Update order
await HuntVersion.updateOne(
  { huntId: 1001, version: hunt.latestVersion },
  { stepOrder: [103, 101, 102] }  // New order
);
```

**Result:** stepOrder updated in v3.

---

## Implementation: Publish Flow

### Service Method: publishHunt()

```typescript
async function publishHunt(huntId: number, userId: string): Promise<void> {
  // 1. Get current state
  const hunt = await Hunt.findOne({ huntId });
  if (!hunt) {
    throw new NotFoundError('Hunt not found');
  }

  const currentVersion = hunt.latestVersion;
  const newVersion = currentVersion + 1;

  // 2. Get current HuntVersion
  const currentHuntVersion = await HuntVersion.findOne({
    huntId,
    version: currentVersion
  });

  if (!currentHuntVersion) {
    throw new NotFoundError('Hunt version not found');
  }

  // 3. Mark current version as published
  await HuntVersion.updateOne(
    { huntId, version: currentVersion },
    { isPublished: true }
  );

  // 4. Clone HuntVersion → create new draft
  const newHuntVersion = {
    huntId: currentHuntVersion.huntId,
    version: newVersion,
    isPublished: false,
    name: currentHuntVersion.name,
    description: currentHuntVersion.description,
    startLocation: currentHuntVersion.startLocation,
    stepOrder: [...currentHuntVersion.stepOrder],
    createdAt: new Date(),
    createdBy: userId
  };
  await HuntVersion.create(newHuntVersion);

  // 5. Clone all Steps
  const currentSteps = await Step.find({ huntId, version: currentVersion });
  const newSteps = currentSteps.map(step => ({
    stepId: step.stepId,
    huntId: step.huntId,
    version: newVersion,
    type: step.type,
    challenge: step.challenge,
    requiredLocation: step.requiredLocation,
    hint: step.hint,
    createdAt: new Date()
  }));
  await Step.insertMany(newSteps);

  // 6. Update Hunt pointer
  await Hunt.updateOne(
    { huntId },
    {
      latestVersion: newVersion,
      updatedAt: new Date()
    }
  );
}
```

---

## Implementation: Set Live Version

### Service Method: setLiveVersion()

```typescript
async function setLiveVersion(huntId: number, version: number): Promise<void> {
  // 1. Validate hunt exists
  const hunt = await Hunt.findOne({ huntId });
  if (!hunt) {
    throw new NotFoundError('Hunt not found');
  }

  // 2. Validate version exists and is published
  const huntVersion = await HuntVersion.findOne({ huntId, version });
  if (!huntVersion) {
    throw new NotFoundError('Version not found');
  }

  if (!huntVersion.isPublished) {
    throw new ValidationError('Can only set published versions as live');
  }

  // 3. Check for active players (optional - can skip for MVP)
  const liveHunt = await LiveHunt.findOne({ huntId });
  if (liveHunt && liveHunt.activePlayerCount > 0) {
    throw new ValidationError(
      `Cannot change live version while ${liveHunt.activePlayerCount} players are active`
    );
  }

  // 4. Update Hunt pointer
  await Hunt.updateOne(
    { huntId },
    {
      liveVersion: version,
      updatedAt: new Date()
    }
  );

  // 5. Update LiveHunt
  await LiveHunt.updateOne(
    { huntId },
    {
      huntId,
      version,
      activePlayerCount: 0,
      updatedAt: new Date()
    },
    { upsert: true }
  );
}
```

---

## Protection Mechanisms

### 1. Application Layer Protection

**All update operations check isPublished:**

```typescript
async function updateHuntVersion(huntId: number, updates: Partial<HuntUpdate>) {
  const hunt = await Hunt.findOne({ huntId });
  const version = await HuntVersion.findOne({
    huntId,
    version: hunt.latestVersion
  });

  // Protection check
  if (version.isPublished) {
    throw new Error('Cannot edit published version');
  }

  // Proceed with update
  await HuntVersion.updateOne(
    { huntId, version: hunt.latestVersion },
    updates
  );
}
```

**This applies to:**
- Update hunt metadata
- Update step
- Add step
- Delete step
- Reorder steps

---

### 2. Mongoose Middleware Protection (Optional)

**Add pre-save hook to HuntVersion:**

```typescript
huntVersionSchema.pre('save', function(next) {
  if (this.isModified() && this.isPublished) {
    return next(new Error('Cannot modify published version'));
  }
  next();
});

huntVersionSchema.pre('updateOne', function(next) {
  this.getFilter(); // { huntId: 1001, version: 2 }

  HuntVersion.findOne(this.getFilter()).then(doc => {
    if (doc && doc.isPublished) {
      return next(new Error('Cannot modify published version'));
    }
    next();
  });
});
```

**This prevents accidental database modifications.**

---

### 3. Database-Level Protection (Future Enhancement)

**Create separate collections:**

```typescript
DraftHuntVersion { huntId, version, ... }  // Can update
PublishedHuntVersion { huntId, version, ... }  // Read-only
```

**On publish, move from Draft → Published collection.**

**Not needed for MVP** - application + middleware protection is sufficient.

---

## Summary

### Collections

1. **Hunt** - Master record (one per hunt)
2. **HuntVersion** - Versioned content (multiple per hunt)
3. **Step** - Versioned steps (multiple per version)
4. **LiveHunt** - Runtime state (one per hunt)

### Key Fields

- `Hunt.latestVersion` - Points to draft
- `Hunt.liveVersion` - Points to live version (null if never published)
- `HuntVersion.isPublished` - Protection flag (true = locked)
- `Step.version` - FK to HuntVersion

### Version Flow

```
Create → Edit Draft → Publish → Edit New Draft → Publish → ...
  v1        v1         (v1 locked,    v2          (v2 locked,
                        v2 created)                v3 created)
```

### Protection

- Application layer: Check `isPublished` before updates
- Middleware: Mongoose pre-save hooks
- Always edit `Hunt.latestVersion` only

### Efficiency

- Dashboard: Query Hunt collection only (20 docs, not 100)
- Editing: Load one version + its steps only
- Playing: Load live version + its steps only
- Updates: Direct updates to draft (no cloning until publish)

---

**This is the final, clean architecture. No legacy logic, no contradictions.**