# Numeric ID Strategy - Design & Rationale

**Last updated:** 2025-11-07
**Status:** ✅ Implemented for Hunt and Step models

---

## 🎯 What Are Numeric IDs?

**Numeric IDs** are sequential integer identifiers exposed in the API instead of database-generated ObjectIds.

**The Pattern: Dual ID System**

```typescript
// MongoDB document (what database stores)
{
  _id: ObjectId("507f1f77bcf86cd799439011"),  // Internal - NEVER exposed
  huntId: 1332,                                // External - API uses this
  name: "Barcelona Adventure"
}

// API response (what client sees)
{
  "huntId": 1332,      // ✅ Human-readable
  "name": "Barcelona Adventure"
}
```

**Two IDs per document:**
- **Internal (`_id`)**: MongoDB ObjectId - database internals only
- **External (`huntId`)**: Sequential integer - API layer, user-facing

---

## 🧠 Why Numeric IDs? The Decision Process

### The Problem We're Solving

**Current HuntHub problem (before numeric IDs):**
```json
// API response exposes MongoDB ObjectIds
{
  "id": "507f1f77bcf86cd799439011",
  "stepId": "507f191e810c19729de860ea",
  "name": "Barcelona Adventure"
}
```

**Problems with exposing ObjectIds:**

1. **Security leak:** ObjectIds contain timestamp (first 4 bytes)
   - `507f1f77` → Unix timestamp → reveals creation time
   - Attackers can enumerate: `507f1f77...` → `507f1f78...` → `507f1f79...`
   - Reveals database implementation (everyone knows you use MongoDB)

2. **User experience:** Not human-readable
   - User: "Check out hunt 507f1f77bcf86cd799439011" ❌
   - User: "Check out hunt 1332" ✅

3. **Long URLs and QR codes:**
   - `/api/hunts/507f1f77bcf86cd799439011` (38 characters)
   - `/api/hunts/1332` (14 characters)
   - QR codes are simpler with shorter URLs

4. **Migration lock-in:**
   - Tied to MongoDB format forever
   - Can't switch databases without breaking URLs

---

### The Alternatives We Considered

#### Option A: Keep MongoDB ObjectIds (Current)

**Pros:**
- ✅ No extra work (auto-generated)
- ✅ Guaranteed unique across collection
- ✅ Built-in timestamp

**Cons:**
- ❌ Security: timestamp leakage
- ❌ UX: Not human-readable
- ❌ Long IDs (24 characters)
- ❌ Database lock-in

**Verdict:** ❌ Not production-ready for user-facing IDs

---

#### Option B: UUIDs (v4 random)

```typescript
{
  huntId: "550e8400-e29b-41d4-a716-446655440000"  // UUID v4
}
```

**Pros:**
- ✅ No collision risk
- ✅ Can generate client-side
- ✅ Database-agnostic
- ✅ No security leak (random)

**Cons:**
- ❌ Not human-readable
- ❌ Long (36 characters)
- ❌ Not memorable
- ❌ Poor UX for verbally sharing

**Verdict:** ❌ Good for internal IDs, not for user-facing

---

#### Option C: Numeric Sequential IDs ✅ (Chosen)

```typescript
{
  huntId: 1332  // Sequential integer
}
```

**Pros:**
- ✅ Human-readable: "Hunt 1332"
- ✅ Short: 4-6 characters typical
- ✅ Memorable and shareable
- ✅ Short URLs: `/api/hunts/1332`
- ✅ Simple QR codes
- ✅ Production standard (GitHub, Twitter, Stripe)

**Cons:**
- ⚠️ Requires counter system (extra complexity)
- ⚠️ Enumeration risk (mitigated with authorization)
- ⚠️ Not globally unique (only unique per entity type)

**Verdict:** ✅ Best for user-facing IDs

---

### Why Enumeration is NOT a Security Risk

**Common concern:** "Numeric IDs let attackers enumerate: /hunts/1, /hunts/2, /hunts/3..."

**Reality:** This is safe with proper authorization.

**How HuntHub handles this:**
```typescript
async getHuntById(huntId: number, userId: string): Promise<Hunt> {
  const hunt = await HuntModel.findOne({ huntId });

  if (!hunt) {
    throw new NotFoundError();  // Hunt doesn't exist
  }

  // Authorization check
  if (hunt.creatorId !== userId && !hasSharedAccess(hunt, userId)) {
    throw new NotFoundError();  // Same error - don't reveal existence
  }

  return hunt;
}
```

**Security principle:** Never reveal if resource exists without authorization
- User tries `/hunts/1332` → 404 "Not found"
- Could mean: doesn't exist OR no permission
- Attacker learns nothing

**Production examples using sequential IDs:**
- **GitHub**: Issues #1, #2, #3... (billions of public repos)
- **Twitter**: Tweet IDs are sequential snowflakes
- **Stripe**: Customer IDs `cus_1`, `cus_2`, `cus_3...`
- **Instagram**: Post IDs are 64-bit integers

**They all rely on:** Authorization, not ID obscurity.

**Learning:** Security through obscurity (hiding IDs) is NOT security. Authorization is security.

---

## 🏗️ Counter Pattern: How Sequential IDs Work

### MongoDB Has No Auto-Increment

**Problem:** Unlike PostgreSQL, MongoDB has no built-in auto-increment

**Solution:** Counter collection pattern (MongoDB best practice)

### Counter Model

```typescript
// counters collection
{
  _id: ObjectId("..."),
  name: "hunt",      // Which entity (hunt, step, asset)
  seq: 1332          // Current counter value
}
```

**Atomic increment operation:**
```typescript
const counter = await CounterModel.findOneAndUpdate(
  { name: "hunt" },
  { $inc: { seq: 1 } },  // Atomic: increment by 1
  { new: true, upsert: true }
);

const huntId = counter.seq;  // 1333 (next available)
```

**Why this is safe:**

1. **Atomic operation:**
   - MongoDB guarantees `$inc` is atomic
   - No race conditions even with concurrent requests
   - Two simultaneous creates get different IDs

2. **Unique guarantee:**
   - Counter cannot duplicate or skip in normal operation
   - Each increment returns different value

3. **Acceptable gaps:**
   - If document creation fails AFTER incrementing, gap occurs
   - Example: Counter = 1333, document insert fails, next ID = 1334
   - Gap at 1333 (hunt 1333 never created)
   - **This is acceptable** - gaps don't matter for user-facing IDs

**Pre-save hook pattern:**
```typescript
huntSchema.pre('save', async function(next) {
  if (!this.huntId) {
    this.huntId = await Counter.getNextSequence('hunt');
  }
  next();
});
```

**Benefits:**
- ✅ Automatic - developers don't manually assign IDs
- ✅ Happens in model layer (separation of concerns)
- ✅ Consistent pattern across all models

**Learning:** Counter pattern is MongoDB's answer to auto-increment. Atomic operations prevent race conditions.

---

## 📊 Scope Decision: Which Models Get Numeric IDs?

**Critical question:** Do ALL models need numeric IDs?

**Answer:** No! Only user-facing entities.

### ✅ Models WITH Numeric IDs (2 models)

#### Hunt - `huntId: number`

**Why:**
- ✅ In URLs: `/api/hunts/1332`
- ✅ QR codes: `hunthub.com/play/1332`
- ✅ User sharing: "Try hunt 1332"
- ✅ Dashboard: "Hunt #1332"

**External-facing:** Users see and share hunt IDs

---

#### Step - `stepId: number`

**Why:**
- ✅ In URLs: `/api/hunts/1332/steps/13344`
- ✅ Tree view: Display step numbers
- ✅ Hunt editor: "Edit step 13344"
- ✅ Debugging: "Step 13344 has bug"

**External-facing:** Creators see step IDs in editor

---

### ❌ Models WITHOUT Numeric IDs (5 models)

#### User - Uses `firebaseUid: string`

```typescript
{
  _id: ObjectId("..."),        // Internal MongoDB ID
  firebaseUid: "xyz789abc",    // ✅ External ID (Firebase)
  email: "user@example.com"
}
```

**Why NOT:**
- Already have external ID (Firebase UID)
- Adding numeric ID provides no value
- Firebase UID is stable, unique, secure

**Learning:** Don't add IDs for the sake of consistency. Use existing external IDs.

---

#### Asset - Uses `assetId: number` (UPDATED)

**Initially considered:** Keep ObjectId for assets

**Why changed to numeric:**
- ✅ URL consistency: `/api/assets/789` matches `/api/hunts/1332`
- ✅ API responses cleaner: All IDs are numbers
- ✅ Small cost (Counter overhead negligible)

**Revised decision:** Assets are user-facing (in API responses), so numeric IDs make sense.

---

#### Progress, LiveHunt, PublishedHunt - Use ObjectId

```typescript
// Progress
{
  _id: ObjectId("..."),     // Internal ID
  huntId: 1332,             // References Hunt.huntId
  stepId: 13344,            // References Step.stepId
  playerId: "firebase-uid"
}
```

**Why NOT:**
- Internal tracking only
- Never exposed in URLs
- Not user-facing
- References use numeric IDs of Hunt/Step

**Learning:** Internal models (tracking, joins) don't need numeric IDs.

---

## 🎨 Design Patterns

### Pattern 1: Counter Helper Function

```typescript
export class Counter {
  static async getNextSequence(name: string): Promise<number> {
    const counter = await CounterModel.findOneAndUpdate(
      { name },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (!counter) {
      throw new Error(`Failed to generate ${name} ID`);
    }

    return counter.seq;
  }
}
```

**Why helper function:**
- ✅ Centralized logic
- ✅ Easy to call from pre-save hooks
- ✅ Error handling in one place
- ✅ Testable

**Usage:**
```typescript
const huntId = await Counter.getNextSequence('hunt');
const stepId = await Counter.getNextSequence('step');
```

---

### Pattern 2: Pre-save Hook for Auto-Generation

```typescript
huntSchema.pre('save', async function(next) {
  if (!this.huntId) {
    this.huntId = await Counter.getNextSequence('hunt');
  }
  next();
});
```

**Why pre-save hook:**
- ✅ Automatic - developers can't forget
- ✅ Consistent - always happens
- ✅ Model-layer concern (not service)

**Learning:** Use pre-save hooks for automatic ID generation. Keeps services clean.

---

### Pattern 3: References Use Numeric IDs

```typescript
// Hunt document
{
  huntId: 1332,
  stepOrder: [13344, 13345, 13346]  // ✅ Numeric step IDs
}

// Step document
{
  stepId: 13344,
  huntId: 1332,         // ✅ References Hunt by numeric ID
  huntVersion: 1
}
```

**Why:**
- ✅ Consistency - all references are numeric
- ✅ No ObjectId → Number conversions
- ✅ Cleaner queries

**Alternative (worse):**
```typescript
{
  stepOrder: [ObjectId("..."), ObjectId("...")]  // ❌ Mixed ID types
}
```

**Learning:** Once you choose numeric IDs, use them everywhere for that entity.

---

## 🔄 Migration Strategy

### No Data Migration Needed!

**HuntHub advantage:** Project started fresh
- No existing hunts to migrate
- No existing steps to migrate
- Clean slate implementation

**If migrating existing data:**
```typescript
// Script to add numeric IDs to existing documents
async function migrateHunts() {
  const hunts = await HuntModel.find({ huntId: { $exists: false } });

  for (const hunt of hunts) {
    hunt.huntId = await Counter.getNextSequence('hunt');
    await hunt.save();
  }
}
```

**Learning:** Starting fresh is easiest. If migrating, batch update with counter.

---

## 🎓 Lessons Learned

### What Worked Well

1. **Dual ID System**
   - Internal ObjectId for database
   - External numeric ID for API
   - Clean separation of concerns
   - **Reusable:** Any MongoDB project can use this pattern

2. **Counter Pattern**
   - Atomic operations prevent race conditions
   - Simple helper function
   - Works at scale
   - **Reusable:** Standard MongoDB pattern

3. **Selective Application**
   - Only user-facing models get numeric IDs
   - Internal models keep ObjectIds
   - Asset decision updated based on API usage
   - **Learning:** Don't over-engineer. Apply patterns where they add value.

4. **Pre-save Hooks**
   - Automatic ID generation
   - Developers can't forget
   - Model-layer concern
   - **Reusable:** Works for any auto-generated field

### What We'd Do Differently

1. **Start with Numeric IDs from Day 1**
   - **Current:** Migrated after initial implementation
   - **Better:** Design with numeric IDs from start
   - **Impact:** Avoided some mapper rewrites

2. **Document Counter Starting Values**
   - **Current:** Counters start at 1
   - **Better:** Could start at 1000 (looks more production-ready)
   - **Example:** GitHub starts issue numbers at 1, but PRs might start higher

3. **Consider Composite IDs for Assets**
   - **Current:** Global numeric ID for assets
   - **Alternative:** `userId-1, userId-2` (scoped per user)
   - **Trade-off:** More complex, probably YAGNI

### Anti-Patterns Avoided

1. ❌ **Exposing ObjectIds in API** - Security and UX issues
2. ❌ **Using UUIDs for user-facing IDs** - Poor readability
3. ❌ **Manual ID assignment** - Error-prone, use pre-save hooks
4. ❌ **Adding numeric IDs to all models** - Over-engineering
5. ❌ **Security through obscurity** - Use authorization, not random IDs

---

## 🎯 When to Use This Pattern

**Use numeric IDs when:**
- ✅ User-facing resources (hunts, posts, issues)
- ✅ Need human-readable IDs
- ✅ URLs must be short
- ✅ QR codes or verbal sharing
- ✅ Production examples exist (GitHub, Twitter)

**Use UUIDs when:**
- ✅ Internal resources (sessions, tokens)
- ✅ Distributed systems (no central counter)
- ✅ Client-side generation needed
- ✅ Collision risk unacceptable

**Use ObjectIds when:**
- ✅ Internal MongoDB operations
- ✅ Not exposed externally
- ✅ Simplicity preferred
- ✅ Built-in timestamp needed

**Use existing external IDs when:**
- ✅ Firebase UIDs for users
- ✅ OAuth provider IDs
- ✅ Stripe customer IDs

---

## 📝 Summary

**Numeric IDs solve:**
- Security: No timestamp leakage
- UX: Human-readable, memorable
- URLs: Short, shareable
- QR codes: Simpler
- Database-agnostic: Not tied to MongoDB

**Key decisions:**
1. Dual ID system (internal ObjectId + external numeric)
2. Counter pattern for sequential IDs
3. Selective application (Hunt, Step, Asset only)
4. Pre-save hooks for automatic generation
5. Authorization prevents enumeration attacks

**What makes this production-grade:**
- Atomic counter operations (race-condition safe)
- Separation of concerns (model layer)
- Consistent pattern across entities
- Follows industry standards (GitHub, Twitter, Stripe)

**Reusable patterns:**
- Counter collection with `getNextSequence()`
- Pre-save hooks for auto-generation
- Dual ID system for MongoDB projects
- Selective ID strategy (not one-size-fits-all)

**This pattern is essential for any MongoDB project with user-facing resources.**

---

**Last updated:** 2025-11-07
**Status:** ✅ Implemented for Hunt, Step, and Asset models
**Models:** Hunt (huntId), Step (stepId), Asset (assetId)
**Counter system:** Atomic increment with upsert
