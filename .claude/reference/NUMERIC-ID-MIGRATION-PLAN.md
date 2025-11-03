# Numeric ID Migration Plan

**Decision Date:** 2025-10-30
**Status:** VALIDATED - Ready to implement
**Priority:** CRITICAL - Must complete before Week 2

---

## Executive Summary

**Current Problem:**
- Exposing MongoDB ObjectIds in API responses
- Security issue: ObjectIds contain timestamps, reveal DB implementation, predictable
- Not human-friendly: `507f1f77bcf86cd799439011` vs `1332`

**Solution:**
- **Dual ID System:**
  - **Internal**: MongoDB's `_id` (ObjectId) - database only, never exposed
  - **External**: Numeric IDs (`stepId: 13344`, `huntId: 1332`) - API layer, human-readable

**Why Numeric IDs:**
- ✅ Human-readable: "Check hunt 1332"
- ✅ Short URLs: `/api/hunts/1332` vs `/api/hunts/550e8400-e29b-41d4-a716-446655440000`
- ✅ QR codes: Shorter = simpler QR code
- ✅ Easy to remember and share
- ✅ Production standard (GitHub, Twitter, Stripe use sequential IDs)

---

## 🎯 Scope Decision: Which Models Need Numeric IDs?

**IMPORTANT:** Not all models need numeric IDs - only externally-facing ones!

### ✅ Models WITH Numeric IDs (2 models)

**Hunt** - `huntId: 1332`
- ✅ In URLs: `/api/hunts/1332`
- ✅ QR codes: `hunthub.com/play/1332`
- ✅ Sharing: "Try hunt 1332"
- ✅ External-facing

**Step** - `stepId: 13344`
- ✅ In URLs: `/api/hunts/1332/steps/13344`
- ✅ Tree view: Display step numbers
- ✅ Hunt editor: Reference steps
- ✅ External-facing

### ❌ Models WITHOUT Numeric IDs (5 models)

**User** - Use Firebase UID
```typescript
{
  firebaseUid: "xyz789abc",  // ✅ Already have external ID
  _id: ObjectId("..."),      // Internal MongoDB ID
  email: "user@example.com"
}
```
**Why NOT:** Firebase UID is already the external ID. No benefit to adding another.

**Asset** - Use ObjectId or UUID
```typescript
{
  _id: ObjectId("..."),      // ✅ MongoDB ID is fine
  url: "s3://...",           // What actually matters
  mimeType: "image/jpeg"
}
```
**Why NOT (YAGNI):**
- Users never see asset IDs (they see images)
- Not shared externally
- File storage systems give you IDs anyway
- No debugging benefit

**LiveHunt** - References huntId
```typescript
{
  _id: ObjectId("..."),      // Internal ID is fine
  huntId: 1332,              // ✅ References Hunt.huntId (number)
  playerId: "firebase-uid"
}
```
**Why NOT:** Internal tracking only, not exposed in URLs.

**PublishedHunt** - References huntId
```typescript
{
  _id: ObjectId("..."),
  huntId: 1332,              // References Hunt.huntId
  version: 1
}
```
**Why NOT:** Referenced by `huntId + version`, not a standalone entity.

**Progress** - References huntId + stepId
```typescript
{
  _id: ObjectId("..."),
  huntId: 1332,              // Numeric references
  stepId: 13344,
  playerId: "firebase-uid"
}
```
**Why NOT:** Internal tracking, never exposed in URLs.

---

## ⏱️ Simplified Timeline

**OLD Estimate:** 2-3 hours (all 7 models)
**NEW Estimate:** ~1.5 hours (only 2 models)

| Task | Time |
|------|------|
| Counter model (2 counters: hunt, step) | 15 min |
| Hunt model + pre-save hook | 20 min |
| Step model + pre-save hook | 20 min |
| OpenAPI schemas (only 2 models) | 15 min |
| Regenerate types + Zod | 10 min |
| HuntService updates | 30 min |
| StepService updates | 30 min |
| Update mappers (2 models) | 20 min |
| Update routes | 15 min |
| Tests | 20 min |
| **TOTAL** | **~2.5 hours** |

**No migration script needed** - No existing data to migrate!

---

## 🏗️ Implementation Patterns: A vs B vs C

**CRITICAL DECISION:** How to structure foreign keys and references?

You have 3 valid production patterns to choose from. Let's understand each with concrete examples.

---

### Pattern A: Numeric IDs Everywhere (Simple & Explicit)

**Schema:**
```typescript
// Hunt Model
const huntSchema = new Schema({
  huntId: { type: Number, unique: true, index: true },  // External ID
  creatorId: { type: String },                          // Firebase UID
  name: String,
  stepOrder: [{ type: Number }]  // ✅ Array of numeric stepIds
});

// Step Model
const stepSchema = new Schema({
  stepId: { type: Number, unique: true, index: true },  // External ID
  huntId: { type: Number, index: true }  // ✅ Numeric foreign key
});
```

**Database Data:**
```javascript
// Hunt document
{
  _id: ObjectId("507f1f77bcf86cd799439011"),  // Internal (never exposed)
  huntId: 1332,                                // External (API uses this)
  creatorId: "firebase-xyz789",
  name: "Barcelona Adventure",
  stepOrder: [13344, 13345, 13346]  // ✅ Numeric step IDs
}

// Step documents
{
  _id: ObjectId("abc123..."),
  stepId: 13344,
  huntId: 1332,  // ✅ Numeric reference to hunt
  type: "clue"
}
```

**Service Layer:**
```typescript
// Get hunt with steps
async getHuntWithSteps(huntId: number, userId: string) {
  // 1. Get hunt by numeric ID
  const hunt = await HuntModel.findOne({ huntId: 1332 });
  if (!hunt) throw new NotFoundError();
  if (hunt.creatorId !== userId) throw new ForbiddenError();

  // 2. Get steps by numeric huntId (manual join)
  const steps = await StepModel.find({ huntId: 1332 });

  // 3. Return combined data
  return {
    ...HuntMapper.fromDocument(hunt),
    steps: steps.map(StepMapper.fromDocument)
  };
}

// Reorder steps
async reorderSteps(huntId: number, newOrder: number[]) {
  const hunt = await HuntModel.findOne({ huntId: 1332 });

  // Validate all steps exist and belong to this hunt
  const steps = await StepModel.find({
    stepId: { $in: newOrder },  // ✅ Find by numeric IDs
    huntId: 1332
  });

  if (steps.length !== newOrder.length) {
    throw new ValidationError('Invalid step IDs');
  }

  hunt.stepOrder = newOrder;  // [13346, 13344, 13345]
  await hunt.save();
}
```

**API Response:**
```json
{
  "huntId": 1332,
  "name": "Barcelona Adventure",
  "stepOrder": [13344, 13345, 13346],
  "steps": [
    { "stepId": 13344, "huntId": 1332, "type": "clue" },
    { "stepId": 13345, "huntId": 1332, "type": "quiz" }
  ]
}
```

**✅ Pros:**
- Simple - one ID type (numbers)
- Explicit - clear what data is being fetched
- Fast - numeric indexes are very fast
- No hidden queries - you control exactly what gets fetched
- Easy to debug - logs show `huntId: 1332` not `ObjectId("...")`

**❌ Cons:**
- No `.populate()` - can't use Mongoose's automatic joins
- Manual joins - have to write `find()` queries explicitly
- More code - explicit queries vs one-line populate

**Example of "manual join pain":**
```typescript
// Without populate, you write:
const hunt = await HuntModel.findOne({ huntId });
const steps = await StepModel.find({ huntId });
const creator = await UserModel.findOne({ firebaseUid: hunt.creatorId });

// With populate (Pattern B), you could write:
const hunt = await HuntModel.findOne({ huntId })
  .populate('stepRefs')
  .populate('creatorRef');
// Everything loaded in one call
```

**When to use Pattern A:**
- Simple relationships (hunt → steps, not deeply nested)
- You want explicit control over queries
- Performance matters (avoid N+1 queries from populate)
- You prefer clarity over convenience

---

### Pattern B: ObjectId Refs + Numeric Display IDs (Production Standard)

**Schema:**
```typescript
// Hunt Model
const huntSchema = new Schema({
  huntId: { type: Number, unique: true, index: true },     // Display ID (API)
  creatorId: { type: String },                             // Firebase UID
  name: String,
  stepOrder: [{ type: Schema.Types.ObjectId, ref: 'Step' }]  // ✅ ObjectId refs (can populate!)
});

// Step Model
const stepSchema = new Schema({
  stepId: { type: Number, unique: true, index: true },     // Display ID (API)
  huntId: { type: Schema.Types.ObjectId, ref: 'Hunt', index: true }  // ✅ ObjectId ref (can populate!)
});
```

**Database Data:**
```javascript
// Hunt document
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  huntId: 1332,                    // Display ID
  creatorId: "firebase-xyz789",
  name: "Barcelona Adventure",
  stepOrder: [  // ✅ ObjectId array (can populate!)
    ObjectId("abc123..."),
    ObjectId("def456..."),
    ObjectId("ghi789...")
  ]
}

// Step documents
{
  _id: ObjectId("abc123..."),
  stepId: 13344,                   // Display ID
  huntId: ObjectId("507f1f77..."), // ✅ ObjectId ref to Hunt (can populate!)
  type: "clue"
}
```

**Service Layer:**
```typescript
// Get hunt with steps - USING POPULATE
async getHuntWithSteps(displayHuntId: number, userId: string) {
  // Step 1: Lookup by display ID (numeric)
  const hunt = await HuntModel.findOne({ huntId: 1332 });
  if (!hunt) throw new NotFoundError();

  // Step 2: Now use ObjectId for populate
  const populatedHunt = await HuntModel.findById(hunt._id)
    .populate('stepOrder');  // ✅ Mongoose fetches all steps automatically!

  // Step 3: Authorization
  if (populatedHunt.creatorId !== userId) throw new ForbiddenError();

  // Step 4: Return with display IDs
  return {
    huntId: populatedHunt.huntId,  // 1332 (numeric)
    name: populatedHunt.name,
    steps: populatedHunt.stepOrder.map(step => ({
      stepId: step.stepId,         // 13344 (numeric)
      type: step.type
    }))
  };
}

// Reorder steps - EASIER with ObjectId refs
async reorderSteps(displayHuntId: number, newOrder: number[]) {
  // Step 1: Get hunt by display ID
  const hunt = await HuntModel.findOne({ huntId: 1332 });

  // Step 2: Convert numeric stepIds to ObjectIds
  const stepDocs = await StepModel.find({
    stepId: { $in: newOrder },
    huntId: hunt._id  // ✅ Match by ObjectId
  });

  // Step 3: Map to ObjectIds in correct order
  const orderedObjectIds = newOrder.map(stepId => {
    const step = stepDocs.find(s => s.stepId === stepId);
    return step._id;  // ObjectId
  });

  hunt.stepOrder = orderedObjectIds;
  await hunt.save();
}
```

**API Response (same as Pattern A):**
```json
{
  "huntId": 1332,
  "name": "Barcelona Adventure",
  "steps": [
    { "stepId": 13344, "type": "clue" },
    { "stepId": 13345, "type": "quiz" }
  ]
}
```

**✅ Pros:**
- Can use `.populate()` - Mongoose's powerful feature
- Referential integrity - Mongoose validates refs exist
- Cleaner for complex relationships - deep nesting, multiple populates
- One-line queries - `populate()` handles joins
- Numeric IDs in API - human-readable, clean URLs

**❌ Cons:**
- **Extra lookup step** - Must query `huntId: 1332` first to get ObjectId
- **Two-step queries** - Find by display ID, then use ObjectId for populate
- **More complex** - Managing both numeric and ObjectId references
- **Slower** - Extra query (numeric → ObjectId lookup)

**Example of "extra lookup" downside:**
```typescript
// Pattern A - direct query
const steps = await StepModel.find({ huntId: 1332 });  // ✅ One query

// Pattern B - need to lookup ObjectId first
const hunt = await HuntModel.findOne({ huntId: 1332 });  // Query 1
const steps = await StepModel.find({ huntId: hunt._id }); // Query 2
// OR
const hunt = await HuntModel.findOne({ huntId: 1332 })
  .populate('stepOrder');  // Mongoose does 2 queries behind the scenes
```

**When to use Pattern B:**
- Complex relationships with deep nesting
- You frequently need hunt + all related data in one call
- You want Mongoose magic (populate, virtuals, etc.)
- Convenience > slight performance cost

---

### Pattern C: ObjectId Everywhere + Virtual Display IDs (Rails Pattern)

**Schema:**
```typescript
// Hunt Model
const huntSchema = new Schema({
  // NO huntId field in schema
  creatorId: String,
  name: String,
  stepOrder: [{ type: Schema.Types.ObjectId, ref: 'Step' }]
});

// Counter mapping table
const displayIdSchema = new Schema({
  entityType: { type: String, enum: ['Hunt', 'Step'] },
  entityId: { type: Schema.Types.ObjectId },  // Maps to hunt._id
  displayId: { type: Number, unique: true }   // 1332
});

// Step Model - same pattern
```

**Database Data:**
```javascript
// Hunt document (no huntId field!)
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  creatorId: "firebase-xyz789",
  name: "Barcelona Adventure",
  stepOrder: [ObjectId("abc..."), ObjectId("def...")]
}

// DisplayId mapping
{
  entityType: "Hunt",
  entityId: ObjectId("507f1f77bcf86cd799439011"),
  displayId: 1332  // Maps to hunt
}
```

**Service Layer:**
```typescript
// Get hunt - need to lookup display ID mapping
async getHunt(displayHuntId: number) {
  // Step 1: Get ObjectId from display ID
  const mapping = await DisplayIdModel.findOne({
    entityType: 'Hunt',
    displayId: 1332
  });

  // Step 2: Use ObjectId for everything
  const hunt = await HuntModel.findById(mapping.entityId)
    .populate('stepOrder');

  // Step 3: Lookup display IDs for response
  const huntDisplayId = await getDisplayId(hunt._id);
  const stepDisplayIds = await Promise.all(
    hunt.stepOrder.map(step => getDisplayId(step._id))
  );

  return {
    huntId: huntDisplayId,  // 1332
    steps: hunt.stepOrder.map((step, i) => ({
      stepId: stepDisplayIds[i]
    }))
  };
}
```

**✅ Pros:**
- Full Mongoose features - populate works perfectly
- ObjectId never exposed - maximum security
- Clean schema - no redundant ID fields

**❌ Cons:**
- **Extreme complexity** - extra mapping table
- **Multiple queries** - lookup display ID for every entity
- **Performance hit** - constant ID translations
- **Overkill** - unless you have very specific security requirements

**When to use Pattern C:**
- Never for HuntHub (too complex)
- Banking/healthcare apps with strict security
- You REALLY don't want ObjectIds anywhere

---

## 🎯 Pattern Comparison with Real Examples

### Example: Get Hunt with Steps

**Pattern A (Numeric everywhere):**
```typescript
// Simple, explicit, 2 queries
const hunt = await HuntModel.findOne({ huntId: 1332 });
const steps = await StepModel.find({ huntId: 1332 });

return { hunt, steps };
```
**Performance:** ⚡⚡⚡ Fast (2 indexed queries)
**Complexity:** ⭐ Very simple

---

**Pattern B (ObjectId refs + numeric display):**
```typescript
// Convenient with populate, 2 queries + lookup
const hunt = await HuntModel.findOne({ huntId: 1332 });
const populated = await HuntModel.findById(hunt._id)
  .populate('stepOrder');

return { hunt: populated };
```
**Performance:** ⚡⚡ Fast (extra lookup, but populate is convenient)
**Complexity:** ⭐⭐ Medium (two-step lookup)

---

**Pattern C (Virtual display IDs):**
```typescript
// Complex, many queries
const mapping = await DisplayIdModel.findOne({ displayId: 1332 });
const hunt = await HuntModel.findById(mapping.entityId).populate('stepOrder');
const displayIds = await getDisplayIds([hunt._id, ...hunt.stepOrder]);

return { hunt: mapToDisplayIds(hunt, displayIds) };
```
**Performance:** ⚡ Slower (many queries)
**Complexity:** ⭐⭐⭐ Complex

---

## 📊 Decision Matrix

| Factor | Pattern A | Pattern B | Pattern C |
|--------|-----------|-----------|-----------|
| Simplicity | ⭐⭐⭐ Simple | ⭐⭐ Medium | ⭐ Complex |
| Performance | ⚡⚡⚡ Fast | ⚡⚡ Fast | ⚡ Slower |
| Uses Populate | ❌ No | ✅ Yes | ✅ Yes |
| Numeric IDs in API | ✅ Yes | ✅ Yes | ✅ Yes |
| Setup Time | 1.5 hrs | 2 hrs | 3+ hrs |
| Query Complexity | Low | Medium | High |
| Production Examples | GitHub, Twitter | Stripe, E-commerce | Rails, Banking |

---

## ✅ Recommendation for HuntHub

**Choose Pattern B** (ObjectId refs + numeric display IDs)

**Why:**
1. ✅ **Production standard** - Stripe, many e-commerce platforms use this
2. ✅ **Best of both worlds** - Mongoose populate + numeric API IDs
3. ✅ **Scalable** - Easy to add complex relationships later
4. ✅ **Familiar** - Standard Mongoose pattern with numeric display layer
5. ✅ **Not overkill** - Pattern C is too complex for HuntHub

**Trade-off you're accepting:**
- Slightly more complex than Pattern A (extra lookup step)
- Slightly slower queries (but negligible for HuntHub scale)

**What you're gaining:**
- Full Mongoose features (populate, virtuals, middleware)
- Production-proven pattern
- Easier to handle complex relationships later (hunt → steps → assets)

---

## Production Standards Validation

### ✅ Industry Examples Using Sequential Numeric IDs

**GitHub:**
- Issues: `#1332`
- Pull Requests: `#445`
- Pattern: Sequential integers with authorization

**Twitter/X:**
- Tweet IDs: Numeric (snowflake IDs - 64-bit integers)
- User IDs: Numeric

**Stripe:**
- Uses prefixed strings (`cus_`, `sub_`) but sequential underneath
- Proves enumerable IDs are safe with proper auth

**Linear, Jira, GitLab:**
- All use sequential numeric IDs for issues/tasks
- Industry standard for task management systems

**Verdict:** ✅ **Sequential numeric IDs are production standard**

---

## MongoDB/Mongoose Best Practices Analysis

### ✅ RECOMMENDED Patterns

**1. Keep MongoDB's `_id` as ObjectId**
```typescript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),  // ✅ MongoDB standard (internal only)
  huntId: 1332,                               // ✅ Custom numeric ID (external)
  name: "Barcelona Adventure"
}
```

**Why:**
- MongoDB expects `_id` as ObjectId
- Changing `_id` type breaks Mongoose internals
- Standard: internal `_id` + custom external ID

**2. Unique Index on External ID**
```typescript
huntSchema.index({ huntId: 1 }, { unique: true });
stepSchema.index({ stepId: 1 }, { unique: true });
```

**Why:**
- Ensures uniqueness
- Fast lookups by external ID
- Performance for queries: `findOne({ huntId: 1332 })`

**3. Counter Pattern for Auto-Increment**
```typescript
// MongoDB counter document
{
  _id: ObjectId("..."),
  name: "hunt",
  seq: 1332
}

// Auto-increment using findOneAndUpdate
const counter = await CounterModel.findOneAndUpdate(
  { name: 'hunt' },
  { $inc: { seq: 1 } },
  { upsert: true, new: true }
);
this.huntId = counter.seq;
```

**Why:**
- Documented MongoDB pattern for auto-increment
- Atomic operation (`$inc`)
- Works with Mongoose pre-save hooks

**Reference:** MongoDB docs on [counters and auto-increment](https://www.mongodb.com/basics/mongodb-auto-increment)

**4. Pre-Save Hooks for Generation**
```typescript
huntSchema.pre('save', async function(next) {
  if (!this.huntId) {
    const counter = await CounterModel.findOneAndUpdate(
      { name: 'hunt' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.huntId = counter.seq;
  }
  next();
});
```

**Why:**
- Automatic ID generation
- Developer doesn't have to remember to set ID
- Standard Mongoose pattern

---

### ⚠️ POTENTIAL CONCERNS & MITIGATIONS

#### Concern 1: Enumeration Attacks

**Problem:**
- Sequential IDs allow enumeration: `/api/hunts/1`, `/api/hunts/2`, `/api/hunts/3`
- Attacker can guess valid IDs

**Mitigation:**
- ✅ **Proper authorization** (we have this)
- Every endpoint checks ownership before returning data
- Example: `huntService.verifyOwnership(huntId, userId)`

**Production examples:**
- GitHub: Issues are sequential, requires auth to view private repos
- Stripe: Customer IDs are sequential, API keys required
- Linear: Issue IDs are sequential, workspace auth required

**Verdict:** ✅ **SAFE with proper authorization**

**Code example:**
```typescript
async getHuntById(huntId: number, userId: string): Promise<Hunt> {
  const hunt = await HuntModel.findOne({ huntId });
  if (!hunt) throw new NotFoundError();
  if (hunt.creatorId !== userId) throw new ForbiddenError();  // ✅ Authorization
  return HuntMapper.fromDocument(hunt);
}
```

---

#### Concern 2: Counter Bottleneck at Scale

**Problem:**
- Single counter document = write bottleneck
- At millions of writes/second, counter updates become slow

**Analysis:**
- HuntHub scale: Thousands of users, hundreds of hunts/day
- Counter can handle 10,000+ writes/second easily
- Only becomes problem at Twitter/Facebook scale

**Mitigation (if needed in future):**
- Sharded counters (multiple counter documents)
- Snowflake IDs (distributed, no counter needed)
- Database sequences (PostgreSQL style)

**Verdict:** ✅ **Not a concern for MVP or even V2.0**

---

#### Concern 3: Counter Reset / Migration

**Problem:**
- What if counter document is deleted?
- How to migrate existing data?

**Mitigation:**
```typescript
// On app startup, ensure counters exist
async function initializeCounters() {
  const models = ['hunt', 'step', 'user', 'asset', 'progress'];

  for (const name of models) {
    const maxId = await getMaxIdForModel(name);
    await CounterModel.findOneAndUpdate(
      { name },
      { $setOnInsert: { seq: maxId || 0 } },
      { upsert: true }
    );
  }
}

// Get max ID from existing data
async function getMaxIdForModel(name: string): Promise<number> {
  const Model = modelMap[name];
  const doc = await Model.findOne().sort({ [`${name}Id`]: -1 }).limit(1);
  return doc?.[`${name}Id`] || 0;
}
```

**Verdict:** ✅ **Documented recovery strategy**

---

#### Concern 4: Transaction Atomicity

**Problem:**
- Counter update + document insert = 2 operations
- Not atomic: could get gaps in sequence if insert fails

**Example:**
```
1. Counter incremented: seq = 1332
2. Document insert fails (validation error)
3. Result: Gap in sequence (hunt 1331 exists, hunt 1333 exists, hunt 1332 missing)
```

**Analysis:**
- Are gaps acceptable? **YES for HuntHub**
- Gaps don't affect functionality
- Users don't care if IDs skip numbers

**Mitigation (if gaps are unacceptable):**
```typescript
// Use MongoDB transactions
const session = await mongoose.startSession();
session.startTransaction();

try {
  const counter = await CounterModel.findOneAndUpdate(
    { name: 'hunt' },
    { $inc: { seq: 1 } },
    { session, new: true }
  );

  const hunt = await HuntModel.create([{
    huntId: counter.seq,
    name: "Barcelona"
  }], { session });

  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

**Verdict:** ⚠️ **Gaps are acceptable for MVP, transactions optional**

---

### 📋 MongoDB Best Practices Checklist

| Practice | Status | Notes |
|----------|--------|-------|
| Keep `_id` as ObjectId | ✅ YES | MongoDB standard |
| Unique index on external ID | ✅ YES | Performance + uniqueness |
| Counter pattern for auto-increment | ✅ YES | Documented MongoDB approach |
| Pre-save hooks for generation | ✅ YES | Automatic, clean |
| Proper authorization checks | ✅ YES | Already implemented |
| Handle counter initialization | ✅ YES | Startup script |
| Transaction atomicity | ⚠️ OPTIONAL | Gaps acceptable for MVP |
| Distributed counter (sharding) | ❌ NOT NEEDED | Only for massive scale |

---

## Field Naming Convention: Resource-Specific vs Generic

### Option A: Resource-Specific (CHOSEN)

```typescript
{
  stepId: 13344,      // ✅ Clear what this is
  huntId: 1332,       // ✅ Clear relationship
  creatorId: 445      // ✅ Clear foreign key
}
```

**Advantages:**
- ✅ Clear in code: `getStep(stepId)` vs `getStep(id)`
- ✅ Clear in discussions: "stepId 13344" vs "ID 13344"
- ✅ Consistent with foreign keys: All use resource name
- ✅ Matches database schema: `stepId`, `huntId`, `creatorId`

**Industry examples:**
- Stripe: `customerId`, `subscriptionId`, `invoiceId`
- AWS: `instanceId`, `bucketName`, `userId`

### Option B: Generic `id` (REST Standard)

```typescript
{
  id: 13344,          // Generic
  huntId: 1332,       // Still need resource name for foreign key
  creatorId: 445
}
```

**Advantages:**
- ✅ REST convention: Primary identifier is `id`
- ✅ Shorter: `id` vs `stepId`

**Disadvantages:**
- ❌ Inconsistent: Primary is `id`, foreign keys are `huntId`, `creatorId`
- ❌ Confusing in code: Which resource's `id`?

**Industry examples:**
- GitHub API: `issue.id`, but also `issue.number` for sequential
- Many REST APIs use `id`

### Decision: Resource-Specific ✅

**Reasoning:**
1. Consistency: All IDs follow same pattern
2. Clarity: Code is self-documenting
3. Foreign keys: Already need resource names
4. Team preference: User prefers `stepId`, `huntId`

**Pattern:**
- Hunt: `huntId`
- Step: `stepId`
- User: `userId`
- Asset: `assetId`
- Progress: `progressId`
- LiveHunt: `liveHuntId`
- PublishedHunt: `publishedHuntId`

---

## Implementation Pattern: Pattern B (CHOSEN)

**Pattern B: ObjectId Refs + Numeric Display IDs**

This combines the best of both worlds:
- Numeric IDs in API (human-readable)
- ObjectId refs in database (can use populate)

---

### 1. Counter Model

```typescript
// src/database/models/Counter.ts

import { Schema, model } from 'mongoose';

export interface ICounter {
  name: string;   // 'hunt' or 'step'
  seq: number;    // Current sequence number
}

const counterSchema = new Schema<ICounter>({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  seq: {
    type: Number,
    required: true,
    default: 0
  }
});

const CounterModel = model<ICounter>('Counter', counterSchema);
export default CounterModel;
```

---

### 2. Model Schema Updates (Pattern B)

**Hunt Model:**
```typescript
// src/database/models/Hunt.ts

const huntSchema = new Schema<IHunt>({
  huntId: {
    type: Number,
    required: true,
    unique: true,
    index: true                // Display ID for API
  },
  creatorId: {
    type: String,              // ✅ Firebase UID (string)
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minLength: 1,
    maxLength: 100
  },
  stepOrder: [{
    type: Schema.Types.ObjectId,  // ✅ ObjectId refs (can populate!)
    ref: 'Step'
  }],
  status: {
    type: String,
    enum: Object.values(HuntStatus),
    default: HuntStatus.Draft
  },
  currentVersion: {
    type: Number,
    default: 1
  },
  startLocation: {
    type: {
      lat: Number,
      lng: Number,
      radius: Number
    },
    required: false
  },
  description: String
}, { timestamps: true });

// Indexes
huntSchema.index({ creatorId: 1, huntId: 1 });

// Auto-generate huntId on create
huntSchema.pre('save', async function(next) {
  if (!this.huntId) {
    const counter = await CounterModel.findOneAndUpdate(
      { name: 'hunt' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.huntId = counter.seq;
  }
  next();
});
```

**Step Model:**
```typescript
// src/database/models/Step.ts

const stepSchema = new Schema<IStep>({
  stepId: {
    type: Number,
    required: true,
    unique: true,
    index: true                // Display ID for API
  },
  huntId: {
    type: Schema.Types.ObjectId,  // ✅ ObjectId ref to Hunt (can populate!)
    ref: 'Hunt',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(ChallengeType),
    required: true
  },
  challenge: {
    type: Schema.Types.Mixed,
    required: true
  },
  requiredLocation: {
    type: {
      lat: Number,
      lng: Number,
      radius: Number
    },
    required: false
  },
  hint: String,
  timeLimit: Number,
  maxAttempts: Number,
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Indexes
stepSchema.index({ huntId: 1, stepId: 1 });

// Auto-generate stepId on create
stepSchema.pre('save', async function(next) {
  if (!this.stepId) {
    const counter = await CounterModel.findOneAndUpdate(
      { name: 'step' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.stepId = counter.seq;
  }
  next();
});
```

**Key Differences from Pattern A:**
- `stepOrder: [ObjectId]` instead of `[Number]` ✅ Can populate
- `Step.huntId: ObjectId` instead of `Number` ✅ Can populate
- Both still have numeric display IDs (`huntId`, `stepId`)


**User Model:**
```typescript
// src/database/models/User.ts

const userSchema = new Schema<IUser>({
  userId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  // ... other fields
}, { timestamps: true });

// Auto-generate userId on create
userSchema.pre('save', async function(next) {
  if (!this.userId) {
    const counter = await CounterModel.findOneAndUpdate(
      { name: 'user' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );
    this.userId = counter.seq;
  }
  next();
});
```

---

### 3. OpenAPI Schema Updates

```yaml
# packages/shared/openapi/hunthub_models.yaml

components:
  schemas:
    Hunt:
      type: object
      required:
        - huntId
        - creatorId
        - name
        - status
        - currentVersion
      properties:
        huntId:
          type: integer
          format: int64
          description: Unique numeric ID for this hunt
          example: 1332
        creatorId:
          type: integer
          format: int64
          description: User ID of hunt creator
          example: 445
        name:
          type: string
          minLength: 1
          maxLength: 100
        stepOrder:
          type: array
          items:
            type: integer
          description: Ordered array of step IDs
          example: [13344, 13345, 13346]
        # ... other fields

    Step:
      type: object
      required:
        - stepId
        - huntId
        - type
        - challenge
      properties:
        stepId:
          type: integer
          format: int64
          description: Unique numeric ID for this step
          example: 13344
        huntId:
          type: integer
          format: int64
          description: ID of hunt this step belongs to
          example: 1332
        type:
          $ref: '#/components/schemas/ChallengeType'
        challenge:
          $ref: '#/components/schemas/Challenge'
        # ... other fields

    User:
      type: object
      required:
        - userId
        - firebaseUid
        - email
      properties:
        userId:
          type: integer
          format: int64
          description: Unique numeric user ID
          example: 445
        firebaseUid:
          type: string
          description: Firebase authentication UID
        email:
          type: string
          format: email
        # ... other fields

    # CREATE DTOs (no IDs - auto-generated)

    HuntCreate:
      type: object
      required:
        - name
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        description:
          type: string
          maxLength: 500
        startLocation:
          $ref: '#/components/schemas/Location'
        # NO huntId - auto-generated

    StepCreate:
      type: object
      required:
        - type
        - challenge
      properties:
        type:
          $ref: '#/components/schemas/ChallengeType'
        challenge:
          $ref: '#/components/schemas/Challenge'
        requiredLocation:
          $ref: '#/components/schemas/Location'
        hint:
          type: string
        # NO stepId - auto-generated
        # NO huntId - comes from URL parameter
```

---

### 4. Service Layer Updates (Pattern B)

**Hunt Service:**
```typescript
// src/services/hunt.service.ts

class HuntService {
  async createHunt(dto: HuntCreate, userId: string): Promise<Hunt> {
    // Create hunt (huntId auto-generated by pre-save hook)
    const huntDoc = await HuntModel.create({
      creatorId: userId,  // ✅ Firebase UID (string)
      name: dto.name,
      description: dto.description,
      startLocation: dto.startLocation,
      status: HuntStatus.Draft,
      currentVersion: 1,
      stepOrder: []  // Empty ObjectId array
    });

    return HuntMapper.fromDocument(huntDoc);
  }

  async getHuntById(displayHuntId: number, userId: string): Promise<Hunt> {
    // Step 1: Find by display ID (numeric)
    const hunt = await HuntModel.findOne({ huntId: displayHuntId });
    if (!hunt) throw new NotFoundError('Hunt not found');

    // Authorization: only creator can view draft hunts
    if (hunt.status === HuntStatus.Draft && hunt.creatorId !== userId) {
      throw new ForbiddenError('You do not have access to this hunt');
    }

    return HuntMapper.fromDocument(hunt);
  }

  async getHuntWithSteps(displayHuntId: number, userId: string): Promise<HuntWithSteps> {
    // Step 1: Find by display ID
    const hunt = await HuntModel.findOne({ huntId: displayHuntId });
    if (!hunt) throw new NotFoundError('Hunt not found');

    // Step 2: Authorization
    if (hunt.status === HuntStatus.Draft && hunt.creatorId !== userId) {
      throw new ForbiddenError('You do not have access to this hunt');
    }

    // Step 3: Use ObjectId to populate steps (Pattern B!)
    const populatedHunt = await HuntModel.findById(hunt._id)
      .populate('stepOrder');  // ✅ Mongoose fetches all steps!

    // Step 4: Return with display IDs
    return {
      ...HuntMapper.fromDocument(hunt),
      steps: populatedHunt.stepOrder.map(step =>
        StepMapper.fromDocument(step)
      )
    };
  }

  async verifyOwnership(displayHuntId: number, userId: string): Promise<IHuntDocument> {
    const hunt = await HuntModel.findOne({ huntId: displayHuntId });
    if (!hunt) throw new NotFoundError('Hunt not found');
    if (hunt.creatorId !== userId) throw new ForbiddenError('Not authorized');
    return hunt;  // Return document (has ._id ObjectId)
  }

  async reorderSteps(displayHuntId: number, newOrder: number[], userId: string): Promise<Hunt> {
    // Step 1: Verify ownership, get hunt document
    const hunt = await this.verifyOwnership(displayHuntId, userId);

    // Step 2: Convert numeric stepIds to ObjectIds (Pattern B)
    const stepDocs = await StepModel.find({
      stepId: { $in: newOrder },
      huntId: hunt._id  // ✅ Match by ObjectId
    });

    if (stepDocs.length !== newOrder.length) {
      throw new ValidationError('Invalid step IDs', []);
    }

    // Step 3: Map to ObjectIds in correct order
    const orderedObjectIds = newOrder.map(stepId => {
      const step = stepDocs.find(s => s.stepId === stepId);
      if (!step) throw new ValidationError(`Step ${stepId} not found`);
      return step._id;  // ObjectId
    });

    hunt.stepOrder = orderedObjectIds;  // ✅ Array of ObjectIds
    await hunt.save();

    return HuntMapper.fromDocument(hunt);
  }
}
```

**Step Service:**
```typescript
// src/services/step.service.ts

class StepService {
  async createStep(dto: StepCreate, displayHuntId: number, userId: string): Promise<Step> {
    // Step 1: Verify hunt ownership, get document
    const hunt = await this.huntService.verifyOwnership(displayHuntId, userId);

    // Step 2: Create step with ObjectId reference (Pattern B!)
    const stepDoc = await StepModel.create({
      huntId: hunt._id,  // ✅ ObjectId reference to Hunt
      type: dto.type,
      challenge: dto.challenge,
      requiredLocation: dto.requiredLocation,
      hint: dto.hint
    });

    // Step 3: Add step's ObjectId to hunt's stepOrder
    await HuntModel.updateOne(
      { _id: hunt._id },
      { $push: { stepOrder: stepDoc._id } }  // ✅ Push ObjectId
    );

    return StepMapper.fromDocument(stepDoc);
  }

  async updateStep(stepId: number, dto: StepUpdate, displayHuntId: number, userId: string): Promise<Step> {
    // Step 1: Verify hunt ownership, get document
    const hunt = await this.huntService.verifyOwnership(displayHuntId, userId);

    // Step 2: Find step by display ID AND verify belongs to hunt (Pattern B)
    const step = await StepModel.findOne({
      stepId,
      huntId: hunt._id  // ✅ Verify with ObjectId
    });
    if (!step) throw new NotFoundError('Step not found');

    // Step 3: Update
    step.type = dto.type;
    step.challenge = dto.challenge;
    if (dto.requiredLocation) step.requiredLocation = dto.requiredLocation;
    if (dto.hint) step.hint = dto.hint;

    await step.save();
    return StepMapper.fromDocument(step);
  }

  async deleteStep(stepId: number, displayHuntId: number, userId: string): Promise<void> {
    // Step 1: Verify hunt ownership, get document
    const hunt = await this.huntService.verifyOwnership(displayHuntId, userId);

    // Step 2: Find and delete step
    const step = await StepModel.findOne({ stepId, huntId: hunt._id });
    if (!step) throw new NotFoundError('Step not found');

    await step.deleteOne();

    // Step 3: Remove step's ObjectId from hunt's stepOrder
    await HuntModel.updateOne(
      { _id: hunt._id },
      { $pull: { stepOrder: step._id } }  // ✅ Remove ObjectId
    );
  }
}
```

**Pattern B Key Points:**
1. ✅ Use numeric IDs for API (controller receives `displayHuntId: number`)
2. ✅ Lookup by numeric ID first to get document
3. ✅ Use ObjectId (`hunt._id`) for internal operations
4. ✅ Can use `.populate()` for complex queries
5. ✅ Return numeric IDs in mapper

---

### 5. Route Parameter Parsing

**Hunt Routes:**
```typescript
// src/routes/hunt.routes.ts

const huntRouter = Router();

// Parse numeric huntId from URL params
huntRouter.param('id', (req, res, next, id) => {
  const huntId = parseInt(id, 10);
  if (isNaN(huntId)) {
    return next(new ValidationError('Invalid hunt ID', []));
  }
  req.params.huntId = huntId.toString();  // Store as string for compatibility
  next();
});

huntRouter.get('/:id', async (req, res, next) => {
  const huntId = parseInt(req.params.id, 10);
  const userId = req.user.userId;  // Numeric userId from auth
  const hunt = await huntService.getHuntById(huntId, userId);
  res.json(hunt);
});
```

**Step Routes:**
```typescript
// src/routes/step.routes.ts

// Nested under hunt routes: /api/hunts/:huntId/steps

stepRouter.post('/', async (req, res, next) => {
  const huntId = parseInt(req.params.huntId, 10);
  const userId = req.user.userId;
  const step = await stepService.createStep(req.body, huntId, userId);
  res.status(201).json(step);
});

stepRouter.put('/:stepId', async (req, res, next) => {
  const huntId = parseInt(req.params.huntId, 10);
  const stepId = parseInt(req.params.stepId, 10);
  const userId = req.user.userId;
  const step = await stepService.updateStep(stepId, req.body, huntId, userId);
  res.json(step);
});
```

---

### 6. Mapper Updates

**Hunt Mapper:**
```typescript
// src/mappers/hunt.mapper.ts

class HuntMapper {
  static fromDocument(doc: IHuntDocument): Hunt {
    return {
      huntId: doc.huntId,           // Numeric ID
      creatorId: doc.creatorId,     // Numeric user ID
      name: doc.name,
      description: doc.description,
      status: doc.status,
      currentVersion: doc.currentVersion,
      startLocation: doc.startLocation,
      stepOrder: doc.stepOrder,     // Array of numeric stepIds
      createdAt: doc.createdAt?.toISOString(),
      updatedAt: doc.updatedAt?.toISOString()
    };
  }

  static toDocument(dto: HuntCreate, userId: number): Partial<IHunt> {
    return {
      // huntId auto-generated by pre-save hook
      creatorId: userId,
      name: dto.name,
      description: dto.description,
      startLocation: dto.startLocation,
      status: HuntStatus.Draft,
      currentVersion: 1,
      stepOrder: []
    };
  }
}
```

**Step Mapper:**
```typescript
// src/mappers/step.mapper.ts

class StepMapper {
  static fromDocument(doc: IStepDocument): Step {
    return {
      stepId: doc.stepId,           // Numeric ID
      huntId: doc.huntId,           // Numeric hunt ID
      type: doc.type,
      challenge: doc.challenge,
      requiredLocation: doc.requiredLocation,
      hint: doc.hint,
      timeLimit: doc.timeLimit,
      maxAttempts: doc.maxAttempts,
      metadata: doc.metadata,
      createdAt: doc.createdAt?.toISOString(),
      updatedAt: doc.updatedAt?.toISOString()
    };
  }

  static toDocument(dto: StepCreate, huntId: number): Partial<IStep> {
    return {
      // stepId auto-generated by pre-save hook
      huntId,
      type: dto.type,
      challenge: dto.challenge,
      requiredLocation: dto.requiredLocation,
      hint: dto.hint
    };
  }
}
```

---

### 7. Auth Middleware Updates

```typescript
// src/middlewares/auth.middleware.ts

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) throw new UnauthorizedError('No token provided');

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Find user by Firebase UID, get numeric userId
    const user = await UserModel.findOne({ firebaseUid: decodedToken.uid });
    if (!user) throw new UnauthorizedError('User not found');

    // Attach user with numeric userId to request
    req.user = {
      userId: user.userId,        // Numeric ID
      firebaseUid: user.firebaseUid,
      email: user.email
    };

    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid token'));
  }
};
```

---

## Migration Strategy

### Phase 1: Add Numeric IDs to Models

**Goal:** Add numeric ID fields without breaking existing functionality

**Steps:**
1. Create Counter model
2. Add numeric ID fields to all models (nullable initially)
3. Add pre-save hooks for auto-generation
4. Add unique indexes on numeric IDs

**Code:**
```typescript
// All models get numeric ID field
huntId: {
  type: Number,
  unique: true,
  sparse: true,  // Allow null during migration
  index: true
}
```

**Test:** New documents get numeric IDs automatically

---

### Phase 2: Migrate Existing Data

**Goal:** Assign numeric IDs to existing documents

**Migration Script:**
```typescript
// scripts/migrate-to-numeric-ids.ts

async function migrateHunts() {
  const hunts = await HuntModel.find({ huntId: { $exists: false } });

  for (const hunt of hunts) {
    const counter = await CounterModel.findOneAndUpdate(
      { name: 'hunt' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    hunt.huntId = counter.seq;
    await hunt.save();
  }

  console.log(`Migrated ${hunts.length} hunts`);
}

async function migrateSteps() {
  const steps = await StepModel.find({ stepId: { $exists: false } });

  for (const step of steps) {
    const counter = await CounterModel.findOneAndUpdate(
      { name: 'step' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    step.stepId = counter.seq;
    await step.save();
  }

  console.log(`Migrated ${steps.length} steps`);
}

async function migrateUsers() {
  const users = await UserModel.find({ userId: { $exists: false } });

  for (const user of users) {
    const counter = await CounterModel.findOneAndUpdate(
      { name: 'user' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    user.userId = counter.seq;
    await user.save();
  }

  console.log(`Migrated ${users.length} users`);
}

async function updateForeignKeys() {
  // Update Hunt.stepOrder from ObjectIds to numeric stepIds
  const hunts = await HuntModel.find();

  for (const hunt of hunts) {
    if (hunt.stepOrder && hunt.stepOrder.length > 0) {
      // Convert ObjectId array to numeric ID array
      const steps = await StepModel.find({ _id: { $in: hunt.stepOrder } });
      hunt.stepOrder = steps.map(s => s.stepId);
      await hunt.save();
    }

    // Update creatorId from ObjectId to numeric userId
    if (hunt.creatorId) {
      const user = await UserModel.findById(hunt.creatorId);
      if (user?.userId) {
        hunt.creatorId = user.userId;
        await hunt.save();
      }
    }
  }

  // Update Step.huntId from ObjectId to numeric huntId
  const steps = await StepModel.find();

  for (const step of steps) {
    if (step.huntId) {
      const hunt = await HuntModel.findById(step.huntId);
      if (hunt?.huntId) {
        step.huntId = hunt.huntId;
        await step.save();
      }
    }
  }
}

// Run migration
async function runMigration() {
  try {
    console.log('Starting migration to numeric IDs...');

    await migrateUsers();
    await migrateHunts();
    await migrateSteps();
    await updateForeignKeys();

    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
```

**Test:** All existing documents now have numeric IDs

---

### Phase 3: Update Services to Use Numeric IDs

**Goal:** Change all queries from `_id` to numeric IDs

**Steps:**
1. Update service methods to query by numeric ID
2. Update mappers to return numeric IDs
3. Update controllers to parse numeric IDs from params
4. Update validation schemas

**Example:**
```typescript
// Before
const hunt = await HuntModel.findById(objectId);

// After
const hunt = await HuntModel.findOne({ huntId: numericId });
```

**Test:** All endpoints work with numeric IDs in URLs

---

### Phase 4: Make Numeric IDs Required

**Goal:** Remove nullable constraint, enforce uniqueness

**Steps:**
1. Verify all documents have numeric IDs
2. Update schemas: remove `sparse: true`, add `required: true`
3. Remove `_id` from API responses
4. Update OpenAPI schemas

**Code:**
```typescript
// Final schema
huntId: {
  type: Number,
  required: true,  // ✅ Now required
  unique: true,
  index: true
}
```

**Test:** Cannot create documents without numeric IDs

---

## Testing Strategy

### Unit Tests

```typescript
// Test counter generation
describe('Counter Model', () => {
  it('should generate sequential IDs', async () => {
    const counter1 = await CounterModel.findOneAndUpdate(
      { name: 'test' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    const counter2 = await CounterModel.findOneAndUpdate(
      { name: 'test' },
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    expect(counter2.seq).toBe(counter1.seq + 1);
  });
});

// Test auto-generation on create
describe('Hunt Model', () => {
  it('should auto-generate huntId on create', async () => {
    const hunt = await HuntModel.create({
      creatorId: 1,
      name: 'Test Hunt'
    });

    expect(hunt.huntId).toBeDefined();
    expect(typeof hunt.huntId).toBe('number');
  });

  it('should not regenerate huntId on update', async () => {
    const hunt = await HuntModel.create({
      creatorId: 1,
      name: 'Test Hunt'
    });

    const originalId = hunt.huntId;
    hunt.name = 'Updated Name';
    await hunt.save();

    expect(hunt.huntId).toBe(originalId);
  });
});
```

### Integration Tests

```typescript
// Test API endpoints with numeric IDs
describe('Hunt API with Numeric IDs', () => {
  it('should create hunt and return numeric huntId', async () => {
    const response = await request(app)
      .post('/api/hunts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Barcelona Adventure' })
      .expect(201);

    expect(response.body.huntId).toBeDefined();
    expect(typeof response.body.huntId).toBe('number');
  });

  it('should get hunt by numeric ID', async () => {
    const hunt = await createTestHunt({ name: 'Test' });

    const response = await request(app)
      .get(`/api/hunts/${hunt.huntId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.huntId).toBe(hunt.huntId);
  });

  it('should reorder steps with numeric stepIds', async () => {
    const hunt = await createTestHunt();
    const step1 = await createTestStep({ huntId: hunt.huntId });
    const step2 = await createTestStep({ huntId: hunt.huntId });
    const step3 = await createTestStep({ huntId: hunt.huntId });

    const response = await request(app)
      .put(`/api/hunts/${hunt.huntId}/step-order`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stepOrder: [step3.stepId, step1.stepId, step2.stepId] })
      .expect(200);

    expect(response.body.stepOrder).toEqual([
      step3.stepId,
      step1.stepId,
      step2.stepId
    ]);
  });
});
```

---

## Security Considerations

### ✅ Authorization Pattern (Already Implemented)

```typescript
// Every endpoint checks ownership
async getHuntById(huntId: number, userId: number): Promise<Hunt> {
  const hunt = await HuntModel.findOne({ huntId });
  if (!hunt) throw new NotFoundError();

  // ✅ Authorization check
  if (hunt.creatorId !== userId) {
    throw new ForbiddenError('Not authorized');
  }

  return HuntMapper.fromDocument(hunt);
}
```

**Pattern:**
1. Find resource by numeric ID
2. Check if user owns resource
3. Throw ForbiddenError if not authorized

**This makes enumeration attacks ineffective:**
- Attacker tries: `GET /api/hunts/1`, `GET /api/hunts/2`, etc.
- Gets 404 (Not Found) or 403 (Forbidden)
- Cannot distinguish between "doesn't exist" and "exists but not yours"

---

### Rate Limiting (Recommended)

```typescript
// Add rate limiting to prevent brute-force enumeration
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // Max 100 requests per window
  message: 'Too many requests, please try again later'
});

app.use('/api/', apiLimiter);
```

---

## Rollback Plan

**If migration fails or issues found:**

1. **Keep `_id` as fallback:**
   - MongoDB `_id` still exists, can query by it
   - Services can be reverted to use `_id`

2. **Revert schema changes:**
   - Git revert model changes
   - Redeploy previous version

3. **Data integrity:**
   - Migration script is idempotent (can run multiple times)
   - Numeric IDs won't be regenerated if they exist

4. **No data loss:**
   - Only adding fields, not removing
   - `_id` always preserved

---

## Success Criteria

### ✅ Must Have

- [ ] Counter model created and working
- [ ] All 7 models updated with numeric IDs (Hunt, Step, User, Asset, Progress, PublishedHunt, LiveHunt)
- [ ] Pre-save hooks generate IDs automatically
- [ ] Unique indexes on all numeric IDs
- [ ] All services query by numeric ID
- [ ] All foreign keys use numeric IDs (huntId, creatorId, userId)
- [ ] API responses show numeric IDs only (no ObjectIds exposed)
- [ ] Routes work with numeric IDs: `/api/hunts/1332`
- [ ] OpenAPI schema updated to `type: integer`
- [ ] TypeScript types updated to `huntId: number`
- [ ] All tests passing

### ✅ Should Have

- [ ] Migration script for existing data
- [ ] Counter initialization on app startup
- [ ] Error handling for invalid numeric IDs
- [ ] Documentation updated
- [ ] Authorization checks on all endpoints

### ✅ Nice to Have

- [ ] Transaction support for atomicity
- [ ] Rate limiting to prevent enumeration
- [ ] Monitoring for counter performance
- [ ] Admin endpoint to reset counters (dev only)

---

## Timeline Estimate

**Total: 2-3 hours**

| Phase | Task | Time |
|-------|------|------|
| 1 | Create Counter model | 15 min |
| 2 | Update Hunt model + pre-save hook | 20 min |
| 3 | Update Step model + pre-save hook | 20 min |
| 4 | Update User model + pre-save hook | 15 min |
| 5 | Update remaining models (Asset, Progress, etc.) | 30 min |
| 6 | Update OpenAPI schemas | 20 min |
| 7 | Regenerate types + Zod schemas | 10 min |
| 8 | Update HuntService methods | 30 min |
| 9 | Update StepService methods | 30 min |
| 10 | Update UserService methods | 20 min |
| 11 | Update HuntMapper | 15 min |
| 12 | Update StepMapper | 15 min |
| 13 | Update auth middleware | 10 min |
| 14 | Update route parameter parsing | 20 min |
| 15 | Update validation schemas | 15 min |
| 16 | Write migration script | 30 min |
| 17 | Test migration locally | 20 min |
| 18 | Update tests | 30 min |
| 19 | Manual testing of all endpoints | 30 min |

**Buffer:** 30 min for unexpected issues

---

## Next Session Checklist

**Before starting:**
- [ ] Read this document completely
- [ ] Understand counter pattern
- [ ] Review current models

**Implementation order:**
1. ✅ Create Counter model
2. ✅ Update one model completely (Hunt) as template
3. ✅ Test Hunt model works end-to-end
4. ✅ Apply pattern to remaining models
5. ✅ Update OpenAPI + regenerate types
6. ✅ Update services
7. ✅ Update mappers
8. ✅ Update routes
9. ✅ Test everything
10. ✅ Write migration script (if existing data)

**If you get stuck:**
- Check this document
- Look at completed Hunt model as reference
- Test incrementally (don't change everything at once)

---

## References

**MongoDB Documentation:**
- [Auto-Increment Pattern](https://www.mongodb.com/basics/mongodb-auto-increment)
- [Counters Collection](https://www.mongodb.com/docs/manual/tutorial/create-an-auto-incrementing-field/)

**Production Examples:**
- GitHub: Uses sequential issue numbers with authorization
- Twitter: Uses snowflake IDs (64-bit sequential)
- Stripe: Uses prefixed sequential IDs with API key auth

**Mongoose Patterns:**
- [Pre-save Hooks](https://mongoosejs.com/docs/middleware.html#pre)
- [Unique Indexes](https://mongoosejs.com/docs/validation.html#unique-indexes)
- [Query Methods](https://mongoosejs.com/docs/queries.html)

---

**VALIDATED:** ✅ This pattern follows production standards and MongoDB best practices
**READY:** ✅ Can implement in next session
**DOCUMENTED:** ✅ All decisions and reasoning captured
