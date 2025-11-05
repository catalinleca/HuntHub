# Publishing Workflow Implementation - Analysis & Decisions

**Date:** 2025-11-04
**Status:** Planning Complete - Ready for Implementation
**Feature:** Hunt Publishing with Version Management

---

## 📋 Executive Summary

**What We're Building:**
A production-ready publishing workflow that:
- Marks current draft HuntVersion as published (frozen)
- Clones all steps to a new draft version
- Updates Hunt pointers (liveVersion, latestVersion)
- Handles concurrent requests safely
- Provides clear error messages

**Key Decisions:**
1. ✅ **Feature-based architecture** - `features/publishing/` not in modules
2. ✅ **Optimistic locking on `latestVersion`** - Prevents race conditions
3. ✅ **Two-phase operation order** - Prepare first, commit last
4. ✅ **Helper functions** - Readable, testable, maintainable
5. ✅ **Lock on Hunt model** - HuntVersion doesn't need locking

---

## 🔒 Concurrency Control Analysis

### Problem Statement

**Race Condition Scenario:**
```
Time  | User A (Request 1)              | User B (Request 2)
------|----------------------------------|----------------------------------
T1    | Read: latestVersion = 1         | Read: latestVersion = 1
T2    | Validate draft v1 exists        | Validate draft v1 exists
T3    | Mark v1 as published            | Mark v1 as published (CONFLICT!)
T4    | Create v2 draft                 | Create v2 draft (DUPLICATE!)
T5    | Update: latestVersion = 2       | Update: latestVersion = 2 (OVERWRITE!)
```

**Result:** Data corruption, lost work, inconsistent state.

---

### Locking Options Considered

#### ❌ Option 1: No Locking (Naive)
```typescript
const hunt = await HuntModel.findOne({ huntId });
const currentVersion = hunt.latestVersion;
// ... do work ...
await HuntModel.updateOne({ huntId }, { latestVersion: currentVersion + 1 });
```

**Why Rejected:**
- Race conditions guaranteed
- Multiple requests can read same version
- No conflict detection
- Data corruption risk

---

#### ❌ Option 2: Pessimistic Lock (Manual)
```typescript
const hunt = await HuntModel.findOneAndUpdate(
  { huntId, locked: { $ne: true } },
  { locked: true, lockedBy: userId, lockedAt: new Date() },
  { new: true }
);

try {
  // Do publishing work
} finally {
  await HuntModel.updateOne({ huntId }, { locked: false });
}
```

**Pros:**
- Exclusive access guaranteed
- Clear "locked" state

**Why Rejected:**
- Complex lock management
- Must handle lock expiration (what if process crashes?)
- Need background job to clean stale locks
- Overkill for low-contention scenario
- Not transactional (lock is separate from work)

---

#### ❌ Option 3: Optimistic Locking with `updatedAt`
```typescript
const hunt = await HuntModel.findOne({ huntId });
const lastUpdatedAt = hunt.updatedAt;

// Later...
const result = await HuntModel.findOneAndUpdate(
  { huntId, updatedAt: lastUpdatedAt },
  { /* updates */ },
  { new: true, session }
);
```

**Pros:**
- Detects ANY modification to Hunt
- Catches unrelated changes

**Why Rejected:**
- **Too aggressive** - Fails even on non-conflicting changes
- Example: User updates hunt name → blocks publishing (false positive)
- We only care about version conflicts, not metadata changes
- User gets error for unrelated modifications
- More false positives = worse UX

---

#### ✅ Option 4: Dual-Lock Strategy (SELECTED)

**Key Insight:** We have TWO distinct operations, each needs appropriate locking.

---

## 🎯 Final Locking Strategy: Two Approaches

After careful analysis, we implement **TWO distinct locking approaches** based on operation type:

```
┌──────────────────────────────────────────────────────────────────┐
│ APPROACH 1: Hunt Update (Edit)                                  │
├──────────────────────────────────────────────────────────────────┤
│ Lock: updatedAt ONLY                                             │
│                                                                  │
│ HuntVersionModel.findOneAndUpdate({                              │
│   huntId,                                                        │
│   version: latestVersion,                                        │
│   updatedAt: expectedUpdatedAt,  ← SINGLE LOCK                  │
│   isPublished: false             ← Validation (not a lock)      │
│ }, {                                                             │
│   name: "New Name",                                              │
│   description: "New Description"                                 │
│ })                                                               │
│                                                                  │
│ Protects Against:                                                │
│ ✅ Edit vs Edit    - updatedAt catches concurrent edits         │
│ ✅ Edit vs Publish - isPublished blocks after freeze            │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ APPROACH 2: Hunt Publish                                        │
├──────────────────────────────────────────────────────────────────┤
│ Lock: updatedAt + latestVersion (DUAL LOCK - Defense in Depth)  │
│                                                                  │
│ Step 1: Mark version published                                  │
│ HuntVersionModel.findOneAndUpdate({                              │
│   huntId,                                                        │
│   version: currentVersion,                                       │
│   updatedAt: expectedUpdatedAt,  ← LOCK 1 (Primary)            │
│   isPublished: false                                             │
│ }, {                                                             │
│   isPublished: true,                                             │
│   publishedAt: new Date()                                        │
│ })                                                               │
│                                                                  │
│ Step 2: Update Hunt pointers                                    │
│ HuntModel.findOneAndUpdate({                                     │
│   huntId,                                                        │
│   latestVersion: currentVersion  ← LOCK 2 (Backup)             │
│ }, {                                                             │
│   latestVersion: currentVersion + 1,                             │
│   liveVersion: currentVersion                                    │
│ })                                                               │
│                                                                  │
│ Protects Against:                                                │
│ ✅ Publish vs Publish - BOTH locks catch it                     │
│ ✅ Publish vs Edit    - updatedAt lock catches it               │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Why Dual Lock in Publishing? Defense in Depth

### The Question: Is `latestVersion` check redundant?

**Short Answer:** Technically yes, practically NO.

The `updatedAt` lock alone would catch most conflicts. But production systems use **defense in depth** - multiple layers of protection.

### Four Reasons for Dual Lock:

**1. Defense in Depth**
- Multiple layers of protection
- If one fails, another catches it
- Standard in banking, aviation, medical systems
- Belt-and-suspenders engineering

**2. Data Integrity Check**
- Even without concurrency, validates Hunt is in expected state
- Catches bugs in other parts of system
- Example: What if something else modified latestVersion incorrectly?
- Fail fast on corrupted state

**3. Clear Intent (Self-Documenting)**
- Code explicitly states: "latestVersion should be X"
- Future developers understand the invariant
- Documents expected state transitions
- No guessing required

**4. Protection Against Edge Cases**
- Handles time-based bugs (clock skew)
- Guards against ORM bugs (Mongoose not updating timestamps)
- Protects from replication lag
- Shields from unexpected failure modes

---

## 📊 Conflict Detection Matrix

**Who detects what conflict:**

| Conflict Scenario | Primary Detection | Backup Detection | Result |
|-------------------|-------------------|------------------|--------|
| **Publish vs Publish** | `updatedAt` on HuntVersion | `latestVersion` on Hunt | Both catch it ✅ |
| **Publish vs Edit** | `updatedAt` on HuntVersion | - | updatedAt catches ✅ |
| **Edit vs Edit** | `updatedAt` on HuntVersion | - | updatedAt catches ✅ |
| **Edit vs Publish** | `isPublished` flag | `updatedAt` mismatch | Either catches ✅ |

---

## 🚨 Real-World Production Scenarios

### Why BOTH locks matter in production:

#### **Scenario 1: Database Replication Lag**
```
Problem: Replica read shows stale data
────────────────────────────────────────────────────────
T1: Publish A writes to primary
    - Updates HuntVersion: updatedAt = T2
    - Primary database has latest state

T2: Publish B reads from replica (replication lag!)
    - Replica still shows: updatedAt = T1 (stale!)
    - Publish B thinks version hasn't changed

T3: Publish B marks version published
    - updatedAt check: T1 == T1 → PASSES (wrong!)

T4: Publish B updates Hunt pointers
    - latestVersion check: expects 1, now 2 → FAILS ✅

Result: latestVersion backup lock SAVED US!
```

#### **Scenario 2: Clock Skew / Time-Based Bug**
```
Problem: Server clocks drift, timestamps unreliable
────────────────────────────────────────────────────────
T1: Server A clock: 10:00:00.000
    Server B clock: 10:00:01.500 (1.5 seconds ahead!)

T2: Publish A (Server A) updates: updatedAt = 10:00:00.500

T3: Publish B (Server B) reads: updatedAt = 10:00:00.500
    Compares with local time 10:00:01.500
    Due to clock skew, comparison logic fails

T4: updatedAt check unreliable due to time drift
    latestVersion check: integer comparison, no time involved → WORKS ✅

Result: Integer-based lock is time-independent, reliable!
```

#### **Scenario 3: Mongoose Bug / ORM Issue**
```
Problem: ORM doesn't update timestamp properly
────────────────────────────────────────────────────────
T1: Publish A marks version published
    - BUG: Mongoose hook doesn't fire
    - updatedAt stays as T1 (should be T2)

T2: Publish B reads: updatedAt = T1

T3: Publish B marks version published
    - updatedAt check: T1 == T1 → PASSES (bug allowed it!)

T4: Publish B updates Hunt pointers
    - latestVersion check: expects 1, now 2 → FAILS ✅

Result: latestVersion backup lock caught the ORM bug!
```

#### **Scenario 4: Manual Database Modification**
```
Problem: DBA or migration script modifies data
────────────────────────────────────────────────────────
T1: DBA runs manual update (hotfix in production)
    - Updates HuntVersion directly
    - Forgets to update updatedAt timestamp

T2: Publish attempts to publish
    - updatedAt check passes (timestamp unchanged)
    - latestVersion check: detects inconsistent state → FAILS ✅

Result: Catches manual modifications that bypass ORM!
```

---

## ✅ Production Cost-Benefit Analysis

**Cost of Dual Lock:**
```
Performance Impact:
- One extra WHERE clause in query
- ~0.01ms additional check time
- Negligible database load
- No blocking or waiting

Code Complexity:
- One extra line: latestVersion: currentVersion
- Easy to understand
- Well-documented pattern

Total Cost: Minimal
```

**Benefit of Dual Lock:**
```
Protection Gained:
- Catches edge cases
- Handles ORM bugs
- Guards against replication issues
- Protects from clock skew
- Detects data corruption
- Self-documenting invariants

Debugging Value:
- Clear error: "Version mismatch detected"
- Indicates data corruption vs concurrency
- Faster root cause analysis

Total Benefit: Massive
```

**Verdict:** Use BOTH locks ✅ (Industry best practice)

---

## 🎯 How Dual Lock Works in Practice

### Timeline: Publish vs Publish with Dual Lock

```
Time  | Publish A                          | Publish B
------|------------------------------------|---------------------------------
T1    | Read: updatedAt=T1, version=1     | Read: updatedAt=T1, version=1
T2    | Prepare: Clone steps, create v2   | Prepare: Clone steps, create v2
      |                                    |
T3    | LOCK 1: Mark published             |
      | WHERE updatedAt=T1 → ✅ SUCCESS    |
      | (Mongoose sets updatedAt=T2)       |
      |                                    |
T4    | LOCK 2: Update Hunt pointers       |
      | WHERE latestVersion=1 → ✅ SUCCESS |
      | (Now latestVersion=2)              |
      |                                    |
T5    |                                    | LOCK 1: Mark published
      |                                    | WHERE updatedAt=T1 → ❌ FAIL
      |                                    | (updatedAt is now T2, not T1)
      |                                    | → Throw ConflictError
      |                                    | → Transaction aborts
      |                                    | → LOCK 2 never executes

Result: First publish wins, second fails with clear error ✅
```

### Timeline: Publish vs Edit with Single Lock

```
Time  | Publish A                          | Edit B
------|------------------------------------|---------------------------------
T1    | Read: updatedAt=T1, version=1     |
T2    | Prepare: Clone steps...           | Read: updatedAt=T1
      |                                    |
T3    |                                    | Update hunt name
      |                                    | WHERE updatedAt=T1 → ✅ SUCCESS
      |                                    | (Mongoose sets updatedAt=T2)
      |                                    |
T4    | LOCK 1: Mark published             |
      | WHERE updatedAt=T1 → ❌ FAIL       |
      | (updatedAt is now T2, not T1)      |
      | → Throw ConflictError              |
      | → "Hunt was modified during publishing"

Result: Edit wins, publish fails with clear error ✅
User gets message: "Hunt was modified. Please review changes and publish again."
```

---

## 🧩 Why Two Approaches? Different Needs

### Edit Operation: Light Protection
```typescript
// Editing is frequent, needs to be fast
// Single lock is sufficient
await HuntVersionModel.findOneAndUpdate(
  { updatedAt: expectedUpdatedAt },  // ← One check
  { name: "New Name" }
);
```

**Philosophy:** Edits are **reversible**, lower stakes.

### Publish Operation: Heavy Protection
```typescript
// Publishing is rare, critical, irreversible
// Dual lock for maximum safety
await HuntVersionModel.findOneAndUpdate(
  { updatedAt: expectedUpdatedAt },  // ← Check 1
  { isPublished: true }
);

await HuntModel.findOneAndUpdate(
  { latestVersion: currentVersion },  // ← Check 2
  { latestVersion: currentVersion + 1 }
);
```

**Philosophy:** Publishing is **permanent**, QR codes distributed, players mid-game. Higher stakes demand stronger protection.

---

## 🎯 Lock Location Analysis: Hunt vs HuntVersion

### Question: Should we lock Hunt, HuntVersion, or both?

#### Option A: Lock on HuntVersion
```typescript
const result = await HuntVersionModel.findOneAndUpdate(
  {
    huntId,
    version: currentVersion,
    isPublished: false,  // ← Lock here?
  },
  { isPublished: true },
  { new: true, session }
);
```

**Analysis:**
- ❌ Doesn't prevent concurrent version creation
- ❌ Two requests can both mark v1 published, both create v2
- ❌ Doesn't protect Hunt.latestVersion pointer

#### Option B: Lock on Hunt Only (RECOMMENDED)
```typescript
const result = await HuntModel.findOneAndUpdate(
  {
    huntId,
    latestVersion: currentVersion,  // ← Lock here!
  },
  { latestVersion: currentVersion + 1 },
  { new: true, session }
);
```

**Analysis:**
- ✅ **Single source of truth** - Hunt.latestVersion is the authority
- ✅ Prevents concurrent version increments
- ✅ Simpler - one lock point, not two
- ✅ Follows single-responsibility principle
- ✅ HuntVersion is content, Hunt is control

**Reasoning:**
- Hunt model manages **version pointers** (latestVersion, liveVersion)
- HuntVersion model stores **content** (name, description, steps)
- **Control plane** (Hunt) should enforce locking, not content plane
- If Hunt.latestVersion check passes → we have exclusive right to create next version

#### Option C: Lock Both (Overkill)
```typescript
// Check both
const draft = await HuntVersionModel.findOne({ ..., isPublished: false });
const hunt = await HuntModel.findOneAndUpdate({ ..., latestVersion: X });
```

**Analysis:**
- ❌ **Redundant** - if Hunt lock succeeds, HuntVersion check is guaranteed
- ❌ More complexity, no additional safety
- ❌ Violates DRY principle

### ✅ Decision: Lock on Hunt.latestVersion Only

**Why:**
1. Hunt is the authority on version management
2. Single lock point = simpler reasoning
3. HuntVersion.isPublished is **validation**, not **locking**
4. Clearer separation: Hunt = control, HuntVersion = content

**Implementation:**
```typescript
// 1. Validate business rules (including isPublished check)
await VersionValidatorHelper.validateCanPublish(huntId, currentVersion, session);

// 2. Do preparation work (clone steps, create new version)
// ...

// 3. Commit with optimistic lock on Hunt
const updatedHunt = await HuntModel.findOneAndUpdate(
  { huntId, latestVersion: currentVersion },  // ← THE LOCK
  { latestVersion: currentVersion + 1, liveVersion: currentVersion },
  { new: true, session }
);

if (!updatedHunt) {
  throw new ConflictError('Concurrent modification detected');
}
```

**Note:** The `isPublished` check is still valuable as **validation**, but it's not the **locking mechanism**.

---

## 📐 Operation Order Analysis

### ❌ Original Order (Risky)
```
1. Verify ownership
2. Get draft version
3. Validate has steps
4. Mark version published       ← STATE CHANGE (if step 5 fails, already modified!)
5. Clone steps                  ← HEAVY OPERATION (can fail)
6. Create new version           ← HEAVY OPERATION (can fail)
7. Update Hunt pointers
```

**Problem:**
- If step 5 or 6 fails, version is already marked published
- Transaction rollback fixes DB, but operation feels risky
- State changes happen before preparation complete

### ✅ Improved Order (Two-Phase)
```
PHASE 1: PREPARE (can fail safely)
────────────────────────────────────
1. Verify ownership (outside transaction - fail fast)
2. Start transaction
3. Validate business rules (draft exists, has steps, not published)
4. Clone steps to new version       ← HEAVY WORK FIRST
5. Create new HuntVersion draft     ← HEAVY WORK FIRST

PHASE 2: COMMIT (should never fail)
────────────────────────────────────
6. Mark old version as published    ← STATE CHANGE
7. Update Hunt pointers (with lock) ← STATE CHANGE (atomic)
8. Return merged DTO
```

**Why Better:**
1. **Heavy operations first** - If cloning fails, no state changed yet
2. **State changes last** - Happens only after prep succeeds
3. **Atomic commit** - All state changes in rapid succession
4. **Clear phases** - Easier to reason about
5. **Transaction-friendly** - Rollback always safe

**Mental Model:**
```
PREPARE → Can fail, safe to rollback
COMMIT  → Should succeed, changes state atomically
```

---

## 🏗️ Architecture Decision: Features vs Modules

### Question: Where does publishing logic belong?

#### ❌ Option: In HuntService (modules/hunts/)
```
modules/hunts/
└── hunt.service.ts
    └── publishHunt()  ← Here?
```

**Why Rejected:**
- ❌ HuntService already complex (CRUD operations)
- ❌ Publishing **orchestrates** Hunt + HuntVersion + Step (multiple domains)
- ❌ Violates Single Responsibility Principle
- ❌ Makes testing harder
- ❌ Not reusable for other workflows

#### ✅ Option: In Features Layer (SELECTED)
```
features/publishing/
├── publishing.service.ts       # Main orchestration
├── publishing.controller.ts    # HTTP handler
├── publishing.routes.ts        # Routes
└── helpers/
    ├── step-cloner.helper.ts
    ├── version-validator.helper.ts
    └── version-publisher.helper.ts
```

**Why Selected:**
- ✅ **Features = orchestration** (per README.md)
- ✅ Publishing orchestrates multiple models (Hunt, HuntVersion, Step)
- ✅ Complex workflow with multiple steps
- ✅ Application-level use case
- ✅ Keeps HuntService focused on CRUD
- ✅ Easier to test in isolation
- ✅ Reusable helpers for other workflows
- ✅ Clear separation of concerns

**From `features/README.md`:**
> **Purpose:** Complex workflows and orchestration across multiple domain modules.
>
> **Examples:**
> - `player/` - Gameplay workflow (orchestrates Hunt + Step + Progress + Session)
> - `publishing/` - Publishing workflow (orchestrates Hunt + Step + PublishedHunt + LiveHunt)

**Publishing matches this pattern perfectly.**

---

## 🛠️ Helper Functions Design

### Why Break Into Helpers?

**Original Plan: One Big Method**
```typescript
async publishHunt(huntId: number, userId: string): Promise<Hunt> {
  // 150+ lines of logic
  // Mix of validation, cloning, state updates
  // Hard to test individual pieces
  // Hard to read and maintain
}
```

**Problems:**
- ❌ Too many responsibilities
- ❌ Hard to test individual parts
- ❌ Hard to understand flow
- ❌ Not reusable

### ✅ Helper-Based Design

#### **1. VersionValidatorHelper**
```typescript
class VersionValidatorHelper {
  static async validateCanPublish(
    huntId: number,
    version: number,
    session: ClientSession
  ): Promise<void>
}
```

**Responsibility:** Business rule validation
- Check version exists and is draft
- Check has steps
- Check stepOrder not empty

**Why Separate:**
- ✅ Single responsibility
- ✅ Easy to test (mock session)
- ✅ Reusable for "can I publish?" checks
- ✅ Clear error messages

#### **2. StepClonerHelper**
```typescript
class StepClonerHelper {
  static async cloneSteps(
    huntId: number,
    sourceVersion: number,
    targetVersion: number,
    session: ClientSession
  ): Promise<void>
}
```

**Responsibility:** Step cloning logic
- Fetch source steps
- Map using StepMapper.toCloneDocument()
- Insert cloned steps

**Why Separate:**
- ✅ Heavy operation isolated
- ✅ Easy to test (verify cloning correctness)
- ✅ Reusable for other workflows (rollback?)
- ✅ Clear input/output

#### **3. VersionPublisherHelper**
```typescript
class VersionPublisherHelper {
  static async markVersionPublished(
    huntId: number,
    version: number,
    userId: string,
    session: ClientSession
  ): Promise<void>

  static async updateHuntPointers(
    huntId: number,
    currentVersion: number,
    newVersion: number,
    session: ClientSession
  ): Promise<HydratedDocument<IHunt>>
}
```

**Responsibility:** State transition operations
- Mark version published
- Update Hunt pointers with optimistic lock

**Why Separate:**
- ✅ Critical operations isolated
- ✅ Locking logic in one place
- ✅ Easy to test (verify lock behavior)
- ✅ Clear failure modes

### Main Service (Clean Orchestration)
```typescript
async publishHunt(huntId: number, userId: string): Promise<Hunt> {
  // Fail fast
  const huntDoc = await this.huntService.verifyOwnership(huntId, userId);

  const session = await mongoose.startSession();
  let result: Hunt;

  await session.withTransaction(async () => {
    const currentVersion = huntDoc.latestVersion;
    const newVersion = currentVersion + 1;

    // PHASE 1: PREPARE
    await VersionValidatorHelper.validateCanPublish(huntId, currentVersion, session);
    await StepClonerHelper.cloneSteps(huntId, currentVersion, newVersion, session);
    const newVersionDoc = await this.createDraftVersion(huntDoc, currentVersion, newVersion, session);

    // PHASE 2: COMMIT
    await VersionPublisherHelper.markVersionPublished(huntId, currentVersion, userId, session);
    const updatedHunt = await VersionPublisherHelper.updateHuntPointers(huntId, currentVersion, newVersion, session);

    result = HuntMapper.fromDocuments(updatedHunt, newVersionDoc);
  });

  await session.endSession();
  return result!;
}
```

**Result:**
- ✅ Reads like a story
- ✅ Each helper has clear purpose
- ✅ Easy to test each piece
- ✅ Easy to modify individual steps
- ✅ Reusable components

---

## 🗺️ StepMapper Enhancement

### Problem: Manual Step Cloning

**Original Approach:**
```typescript
const clonedSteps = currentSteps.map(step => ({
  stepId: step.stepId,
  huntId: step.huntId,
  huntVersion: newVersion,
  type: step.type,
  challenge: step.challenge,
  hint: step.hint,
  // ... 10+ fields manually mapped
  // Risk: Forget a field when IStep changes
}));
```

**Problems:**
- ❌ Manual field mapping
- ❌ Error-prone (miss fields)
- ❌ Not DRY
- ❌ No type safety

### ✅ Solution: Add to StepMapper

```typescript
// shared/mappers/step.mapper.ts

/**
 * Clone step document for new version
 * Preserves stepId but updates huntVersion
 * Used during publishing workflow
 *
 * @param sourceDoc - Original step document
 * @param targetVersion - New version number
 * @returns Partial IStep ready for Model.create()
 */
static toCloneDocument(
  sourceDoc: HydratedDocument<IStep>,
  targetVersion: number
): Partial<IStep> {
  return {
    stepId: sourceDoc.stepId,           // ← SAME stepId across versions
    huntId: sourceDoc.huntId,
    huntVersion: targetVersion,         // ← NEW version
    type: sourceDoc.type,
    challenge: sourceDoc.challenge,
    hint: sourceDoc.hint,
    requiredLocation: sourceDoc.requiredLocation,
    timeLimit: sourceDoc.timeLimit,
    maxAttempts: sourceDoc.maxAttempts,
    metadata: sourceDoc.metadata ? { ...sourceDoc.metadata } : {},
  };
}
```

**Benefits:**
- ✅ Centralized cloning logic
- ✅ Type-safe
- ✅ Explicit about what's cloned
- ✅ Reusable
- ✅ If IStep changes, TypeScript catches it

**Usage:**
```typescript
const clonedSteps = sourceSteps.map(step =>
  StepMapper.toCloneDocument(step, newVersion)
);
```

---

## 🚨 Error Handling Strategy

### Error Types

```typescript
// 1. NotFoundError (404)
throw new NotFoundError('Hunt not found');

// 2. ForbiddenError (403)
throw new ForbiddenError('You do not own this hunt');

// 3. ValidationError (400)
throw new ValidationError('Cannot publish hunt without steps', []);

// 4. ConflictError (409) - NEW
throw new ConflictError(
  'Hunt was modified during publishing. This can happen if:\n' +
  '- Another publish request is in progress\n' +
  '- Hunt was edited by another user\n' +
  'Please refresh and try again.'
);
```

### When Each Error Occurs

| Error | Trigger | HTTP Status | User Action |
|-------|---------|-------------|-------------|
| NotFoundError | Hunt doesn't exist | 404 | Check hunt ID |
| ForbiddenError | User not owner | 403 | Check permissions |
| ValidationError | Business rule violation | 400 | Fix input |
| ConflictError | Concurrent modification | 409 | Retry request |

### ConflictError Design

**Why 409 Conflict:**
- Semantic: Resource exists but can't process due to state conflict
- Not user's fault (unlike 400)
- Retryable (unlike 403)
- Standard for optimistic locking failures

**Error Message Design:**
```typescript
{
  "error": "ConflictError",
  "message": "Hunt was modified during publishing",
  "details": [
    "Another publish request may be in progress",
    "Hunt may have been edited by another user",
    "Please refresh and try again"
  ],
  "retryable": true
}
```

**Frontend Handling:**
```typescript
try {
  await publishHunt(huntId);
} catch (error) {
  if (error.status === 409) {
    // Show retry dialog
    if (confirm('Hunt was modified. Refresh and retry?')) {
      window.location.reload();
    }
  }
}
```

---

## 📝 Important Notes

### 1. Transaction Scope

**MongoDB Transactions:**
- ✅ All DB operations use `session`
- ✅ `withTransaction()` handles commit/rollback
- ✅ If any operation fails → entire transaction rolls back
- ✅ Session properly closed with `endSession()`

**Pattern:**
```typescript
const session = await mongoose.startSession();

await session.withTransaction(async () => {
  // ALL operations must use { session }
  await Model.create([data], { session });      // ✅
  await Model.findOne({ ... }).session(session); // ✅
  await Model.updateOne({ ... }, { ... }, { session }); // ✅
});

await session.endSession(); // ✅ Always clean up
```

### 2. Step ID Preservation

**Critical:** Steps keep **same stepId** across versions!

**Why:**
- Allows tracking "this is the same step" across versions
- Enables diffing versions
- Future: Analytics per step across versions

**Unique Key:** `(stepId, huntId, huntVersion)`
- Same stepId can exist in v1, v2, v3
- But (stepId=100, huntId=5, version=2) is unique

**Schema:**
```typescript
stepSchema.index({ stepId: 1, huntId: 1, huntVersion: 1 }, { unique: true });
```

### 3. stepOrder Cloning

**Must clone the array:**
```typescript
// ✅ CORRECT
stepOrder: [...draftVersion.stepOrder]

// ❌ WRONG (same reference)
stepOrder: draftVersion.stepOrder
```

**Why:** New version starts with same order, but can be modified independently.

### 4. No Undo (By Design)

**Once published → immutable**
- Can't unpublish
- Can't edit published version
- Can only create new version from it

**Why:**
- QR codes point to published versions
- Players may be mid-game
- History must be stable

**Future Feature:** View published versions (read-only)

### 5. MongoDB Replica Set Required

**Transactions require replica set:**
- ✅ Already configured in test environment
- ✅ Production deployment must use replica set or Atlas
- ❌ Standalone MongoDB doesn't support transactions

**Test Setup:**
```typescript
// Already done in tests/setup/testDatabase.ts
mongoServer = await MongoMemoryReplSet.create({
  replSet: { count: 1, storageEngine: 'wiredTiger' }
});
```

### 6. Performance Considerations

**Cloning 50+ steps:**
- `insertMany()` is efficient (single round-trip)
- Happens inside transaction (atomic)
- Expected time: < 100ms for 50 steps

**If performance becomes issue:**
- Batch cloning (chunk into groups of 100)
- Background job for large hunts
- Progress tracking

**For MVP:** Current approach is sufficient.

### 7. Testing Race Conditions

**How to test:**
```typescript
it('should handle concurrent publish attempts', async () => {
  // 1. Create hunt with steps
  // 2. Fire two publish requests simultaneously
  const [result1, result2] = await Promise.allSettled([
    publishHunt(huntId, userId),
    publishHunt(huntId, userId),
  ]);

  // 3. One should succeed, one should fail with ConflictError
  expect(result1.status === 'fulfilled' || result2.status === 'fulfilled').toBe(true);
  expect(result1.status === 'rejected' || result2.status === 'rejected').toBe(true);

  const failed = result1.status === 'rejected' ? result1 : result2;
  expect(failed.reason.name).toBe('ConflictError');
});
```

### 8. Frontend Integration

**Optimistic UI:**
```typescript
// Show "Publishing..." immediately
setIsPublishing(true);

try {
  await api.publishHunt(huntId);
  // Success: redirect to published hunt
  navigate(`/hunts/${huntId}/live`);
} catch (error) {
  if (error.status === 409) {
    // Conflict: show retry option
    showRetryDialog();
  } else {
    // Other error: show message
    showError(error.message);
  }
} finally {
  setIsPublishing(false);
}
```

---

## ✅ Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Architecture** | Features layer | Orchestrates multiple domains |
| **Locking Strategy** | Optimistic on `latestVersion` | Simple, precise, scalable |
| **Lock Location** | Hunt model only | Single source of truth |
| **updatedAt Lock** | Not used | Too aggressive, false positives |
| **Operation Order** | Two-phase (prepare → commit) | Safer, clearer |
| **Helper Functions** | Yes, three helpers | Readable, testable, reusable |
| **Step Cloning** | Via StepMapper | Type-safe, centralized |
| **Error for Conflicts** | ConflictError (409) | Semantic, retryable |
| **Transaction Scope** | All operations in one transaction | Atomic, rollback-safe |

---

## 🎯 What This Achieves

**Correctness:**
- ✅ No race conditions
- ✅ Atomic operations
- ✅ Data integrity guaranteed
- ✅ Clear error handling

**Performance:**
- ✅ No lock overhead
- ✅ Efficient bulk operations
- ✅ Fast conflict detection
- ✅ Scales horizontally

**Maintainability:**
- ✅ Readable code
- ✅ Testable components
- ✅ Clear separation of concerns
- ✅ Reusable helpers

**User Experience:**
- ✅ Fast response
- ✅ Clear error messages
- ✅ Retry on conflicts
- ✅ No silent failures

---

## 📚 References

**Related Documents:**
- `FIXES_REQUIRED.md` (lines 169-228) - Original requirements
- `versioning-architecture.md` - System design
- `features/README.md` - Features layer explanation
- `backend/patterns.md` - Code patterns

**Key Files:**
- `modules/hunts/hunt.service.ts` - HuntService (for verifyOwnership)
- `database/models/Step.ts` - Step model with helpers
- `shared/mappers/hunt.mapper.ts` - HuntMapper
- `shared/mappers/step.mapper.ts` - StepMapper (to be enhanced)

---

**Document Status:** ✅ COMPLETE - Ready for implementation
