# Hunt Release - Design & Architecture

**Last updated:** 2025-11-07
**Status:** ✅ Complete

---

## 🎯 What is Hunt Release?

**Release** means making a published hunt version **live** for players to discover and play.

**Critical Distinction:** Publishing ≠ Releasing

```
Publish:  Creates an immutable version snapshot (v1, v2, v3...)
Release:  Makes a version "live" for players (v2 → players see this)
```

**Why separate these operations?**

**Problem scenario without separation:**
- You publish v2 with a bug
- Players immediately see v2
- You can't quickly rollback
- Requires unpublishing/deleting v2 (loses data)

**Solution with separation:**
- Publish v2 (creates snapshot, not live yet)
- Test v2 internally
- Release v2 when ready (instant switch)
- If bug found → Release v1 again (instant rollback)
- v2 snapshot still exists, can fix and re-release

**Real-world analogy:**
- Publishing = Building a new version of your app
- Releasing = Deploying it to production

**Benefits:**
- ✅ **Zero downtime version switching** - Instant pointer update
- ✅ **Instant rollback** - Switch to any published version
- ✅ **Test before release** - Publish doesn't affect players
- ✅ **Multiple versions ready** - Publish v2, v3, v4, release when ready
- ✅ **Safe experimentation** - Publish experimental versions, release if good

---

## 🧠 Design Decisions & Rationale

### Decision 1: liveVersion as Pointer, Not Copy

**Choice:** Hunt has `liveVersion: number` field pointing to HuntVersion

**Alternative considered:** Copy published version to separate LiveHunt collection
```typescript
// WORSE ALTERNATIVE:
LiveHunt {
  huntId: 1001,
  version: 2,
  name: "Barcelona Adventure",      // Duplicated data
  description: "...",                // Duplicated data
  stepOrder: [...]                   // Duplicated data
}
```

**Why pointer is better:**

1. **No duplication:** Version data exists once in HuntVersion
2. **Instant switch:** Just update `liveVersion` field (1 database write)
3. **Storage efficient:** No copying entire hunt + steps
4. **Consistency:** Single source of truth for version data

**Trade-off:**
- ❌ Extra join to fetch live version data (mitigated with indexes)
- ✅ But we avoid data duplication and instant rollback

**Learning:** Pointers > Copies for versioned systems. Storage and consistency trump extra query.

---

### Decision 2: Optimistic Locking for Concurrent Operations

**Problem:** Multiple users/tabs might try to release different versions simultaneously

**Example race condition:**
```
Thread A: Release v1 { expects liveVersion = null }
Thread B: Release v2 { expects liveVersion = null }

Without protection:
- Both could succeed
- Undefined behavior (which version wins?)
- Last write wins (data loss)
```

**Solution: Compare-and-Set Pattern**

```typescript
// Client must send current state
PUT /api/publishing/hunts/123/release
{
  "version": 2,
  "currentLiveVersion": null  // What client thinks is current
}

// Server performs atomic update
await HuntModel.findOneAndUpdate(
  {
    huntId: 123,
    liveVersion: null,          // Compare: Must match expectation
  },
  {
    liveVersion: 2,             // Set: New value
    releasedAt: new Date(),
    releasedBy: userId,
  }
);

// Returns null if liveVersion doesn't match → ConflictError
```

**If Thread B arrives after A:**
```
A: UPDATE WHERE liveVersion = null SET liveVersion = 1 → Success
B: UPDATE WHERE liveVersion = null SET liveVersion = 2 → Fails (liveVersion is 1, not null)
B gets: 409 Conflict "Hunt was modified by another operation"
```

**Benefits:**
- ✅ **Atomic operation** - Database ensures one writer wins
- ✅ **No locks needed** - No blocking, better performance
- ✅ **Clear error** - Client knows to refresh and retry
- ✅ **Prevents lost updates** - Cannot accidentally overwrite

**Learning:** Optimistic locking (compare-and-set) is superior to pessimistic locks for high-concurrency operations. Client must include expected state.

---

### Decision 3: Lightweight Response Types

**Choice:** Return specialized `ReleaseResult` instead of full Hunt DTO

```typescript
// GOOD: Lightweight, focused
interface ReleaseResult {
  huntId: number;
  liveVersion: number;
  previousLiveVersion: number | null;
  releasedAt: string;
  releasedBy: string;
}

// AVOID: Heavy, unnecessary data
return fullHuntDTO;  // Includes name, description, steps, etc.
```

**Why lightweight responses:**

1. **Faster serialization:** Less data to JSON.stringify
2. **Smaller payloads:** Better mobile performance
3. **Clear contract:** API returns exactly what changed
4. **No over-fetching:** Client gets what they need

**When to return full DTO:**
- GET endpoints (user wants full data)
- Create operations (user expects created object)

**When to return lightweight:**
- PUT/PATCH operations (user knows what they sent)
- Atomic operations (just confirmation needed)

**Learning:** Design response types per operation, not one-size-fits-all. Smaller payloads = better performance.

---

### Decision 4: Auto-detect Latest Published Version

**Choice:** Version parameter is optional, auto-detect if not provided

```typescript
// Explicit version
PUT /release { version: 2, currentLiveVersion: null }

// Auto-detect (uses latest published)
PUT /release { currentLiveVersion: null }
→ Finds latest published version, releases it
```

**Why auto-detect:**

1. **Better UX:** "Make latest version live" is common case
2. **Less error-prone:** User doesn't need to know version number
3. **Still supports explicit:** Can rollback with `version: 1`

**Implementation:**
```typescript
const targetVersion = version ??
  await HuntVersionModel.findLatestPublished(huntId, session);

if (!targetVersion) {
  throw new ConflictError('No published versions available to release');
}
```

**Learning:** Provide sensible defaults for common use cases. Explicit overrides for power users.

---

### Decision 5: Delete Protection for Live Hunts

**Problem:** User might accidentally delete hunt while players are playing

**Solution:** Atomic delete check

```typescript
async deleteHunt(huntId, userId) {
  await HuntModel.findOneAndUpdate(
    {
      huntId,
      creatorId: userId,
      liveVersion: null,    // ← Must NOT be live
      isDeleted: false,
    },
    {
      isDeleted: true,
      deletedAt: new Date(),
    }
  );

  if (!result) {
    throw new ConflictError(
      'Cannot delete hunt while it is live. Take the hunt offline first.'
    );
  }
}
```

**Benefits:**
- ✅ **Prevents accidental deletion** of active hunts
- ✅ **Clear error message** - User knows to take offline first
- ✅ **Atomic check** - Race-condition safe
- ✅ **Recoverable** - Take offline → Delete

**Workflow:**
1. User: "Delete hunt" → Error: "Hunt is live"
2. User: "Take offline" → Success
3. User: "Delete hunt" → Success

**Learning:** Protect critical operations with atomic checks. Clear error messages guide users.

---

## 🔒 Race Conditions Prevented

### Race #1: Concurrent Release Operations

**Scenario:** Two users release different versions simultaneously

**Protection:** Optimistic locking with `currentLiveVersion` parameter
```
User A: PUT /release { version: 1, currentLiveVersion: null }
User B: PUT /release { version: 2, currentLiveVersion: null }

Timeline:
1. A: UPDATE WHERE liveVersion = null → Success (liveVersion = 1)
2. B: UPDATE WHERE liveVersion = null → Fails (liveVersion is now 1, not null)
3. B gets 409 Conflict → Refreshes → Retries with currentLiveVersion = 1
```

**Result:** One succeeds, other retries with correct state. ✅

---

### Race #2: Delete While Releasing

**Scenario:** User deletes hunt while another releases it

**Protection:** Atomic delete check for `liveVersion = null`
```
Thread A: releaseHunt() → Sets liveVersion = 2
Thread B: deleteHunt() → Checks liveVersion = null → Fails

Result: Delete blocked if hunt is live. ✅
```

---

### Race #3: Release During Publish

**Scenario:** User publishes v1 while another releases v1

**Protection:** Transaction isolation

```
Thread A: publishHunt(v1) → Mark v1 as published (in transaction)
Thread B: releaseHunt(v1) → Check if v1 is published (in transaction)

Timeline:
1. A starts transaction → Not committed yet
2. B checks if v1 published → Not found (A's transaction not visible)
3. B fails: "Version not published"
4. A commits → v1 now published
5. B retries → v1 found → Success

Result: Sequential execution, both operations succeed. ✅
```

---

### Race #4: Concurrent Take Offline + Release

**Scenario:** One user takes offline, another releases

**Protection:** Both use optimistic locking
```
Thread A: takeOffline() { currentLiveVersion: 2 }
Thread B: releaseHunt() { currentLiveVersion: 2 }

Result: Whoever commits first wins, other gets 409 Conflict. ✅
```

**Learning:** Optimistic locking solves ALL concurrent modification problems. No custom logic needed per race condition.

---

## 📊 Data Model

### Hunt Model Fields

```typescript
interface IHunt {
  huntId: number;
  creatorId: ObjectId;

  latestVersion: number;        // Always draft (editable)
  liveVersion: number | null;   // Pointer to live version

  releasedAt?: Date;            // When last released
  releasedBy?: string;          // Who released it

  isDeleted: boolean;
  deletedAt?: Date;
}
```

**State transitions:**
```
liveVersion: null → Not released / taken offline
liveVersion: 1    → Version 1 is live
liveVersion: 2    → Version 2 is live (upgraded)
liveVersion: 1    → Rolled back to version 1
```

**Hunt DTO (API response):**
```typescript
interface Hunt {
  huntId: number;
  version: number;              // Current version being viewed
  latestVersion: number;        // Draft version number
  liveVersion: number | null;   // Which version is live

  isLive: boolean;              // Computed: version === liveVersion
  releasedAt?: string;
  releasedBy?: string;
}
```

**Computed field logic:**
```typescript
// In HuntMapper
isLive: versionDoc.version === huntDoc.liveVersion
```

**Why computed vs stored:**
- ✅ Always accurate (cannot get out of sync)
- ✅ No redundant storage
- ✅ Simple to understand (derives from source of truth)

---

## 🎨 Architecture Patterns

### Pattern 1: Helper Module for Business Logic

**ReleaseManager helper:**
```typescript
export class ReleaseManager {
  static async releaseVersion(
    huntId: number,
    version: number,
    userId: string,
    currentLiveVersion: number | null,
    session: ClientSession,
  ): Promise<HydratedDocument<IHunt>> {
    // Encapsulates release logic with optimistic locking
  }

  static async takeOffline(
    huntId: number,
    currentLiveVersion: number,
    session: ClientSession,
  ): Promise<HydratedDocument<IHunt>> {
    // Encapsulates take-offline logic
  }
}
```

**Why helper modules:**
- ✅ **Single Responsibility** - Each helper does one thing
- ✅ **Testable** - Can unit test helpers independently
- ✅ **Reusable** - Service methods can compose helpers
- ✅ **Discoverable** - Clear module names (ReleaseManager, VersionPublisher)

**Pattern matches:**
- `VersionValidator` - Validates business rules
- `VersionPublisher` - Publishes versions
- `StepCloner` - Clones steps
- `ReleaseManager` - Releases/takes offline

**Learning:** Extract business logic into focused helper modules. Services orchestrate, helpers execute.

---

### Pattern 2: Transaction Wrapper for Atomicity

```typescript
const session = await mongoose.startSession();

try {
  await session.withTransaction(async () => {
    // All operations here are atomic
    // If any fails, all rollback
  });
} finally {
  await session.endSession();
}
```

**Why transactions:**
- ✅ **All-or-nothing** - Cannot have partial state
- ✅ **Isolation** - Concurrent operations don't interfere
- ✅ **Consistency** - Database always in valid state
- ✅ **Automatic rollback** - Error = rollback everything

**When to use:**
- Multi-step operations (release + update releasedAt + update releasedBy)
- Operations with validation (check then update)
- Concurrent modification risk (optimistic locking)

**Learning:** Always use transactions for multi-step critical operations. Worth the overhead for data integrity.

---

### Pattern 3: Fail-Fast with verifyOwnership()

```typescript
async releaseHunt(huntId, userId) {
  // Verify ownership BEFORE starting transaction
  const huntDoc = await this.huntService.verifyOwnership(huntId, userId);

  // Now start expensive transaction
  const session = await mongoose.startSession();
  // ...
}
```

**Why fail-fast:**
- ✅ **Performance** - Don't start transaction if will fail anyway
- ✅ **Better errors** - Clear 403 Forbidden vs transaction error
- ✅ **Resource efficiency** - Don't lock resources for unauthorized users

**Learning:** Validate cheap checks before expensive operations. Fail fast with clear errors.

---

## 🔄 Complete Workflow

### First Release
```
1. Creator publishes v1 (POST /api/publishing/hunts/123/publish)
   → Hunt: latestVersion = 2 (new draft), liveVersion = null
   → HuntVersion: v1 isPublished = true

2. Creator releases v1 (PUT /api/publishing/hunts/123/release)
   Body: { currentLiveVersion: null }
   → Hunt: liveVersion = 1, releasedAt = now, releasedBy = userId

3. Players discover hunt
   → GET /api/hunts?liveOnly=true returns hunt
   → GET /api/hunts/123 returns { version: 1, isLive: true }
```

### Version Upgrade
```
1. Creator edits draft v2, publishes v2
   → Hunt: latestVersion = 3, liveVersion = 1 (still)
   → HuntVersion: v2 isPublished = true

2. Creator releases v2 (PUT /release)
   Body: { version: 2, currentLiveVersion: 1 }
   → Hunt: liveVersion = 2 (instant switch)
   → Players now see v2 (zero downtime)
```

### Rollback
```
1. Creator finds bug in v2, rollbacks to v1
   PUT /release
   Body: { version: 1, currentLiveVersion: 2 }
   → Hunt: liveVersion = 1 (instant rollback)
   → Players see v1 again (bug avoided)
```

### Take Offline
```
1. Creator takes hunt offline
   DELETE /release
   Body: { currentLiveVersion: 1 }
   → Hunt: liveVersion = null, releasedAt = null
   → Players cannot discover hunt
```

---

## 🎓 Lessons Learned

### What Worked Extremely Well

1. **Optimistic Locking Pattern**
   - Solved ALL race conditions with one pattern
   - No custom logic per scenario
   - Database handles atomicity
   - **Reusable:** Works for any concurrent modification problem

2. **Pointer Architecture (liveVersion field)**
   - Instant version switching
   - Zero data duplication
   - Rollback is trivial
   - **Reusable:** Works for any versioned resource (documents, configs, etc.)

3. **Lightweight Response Types**
   - Faster API responses
   - Clear contracts
   - Better mobile performance
   - **Reusable:** Any atomic operation should return minimal data

4. **Helper Module Pattern**
   - Clean separation of concerns
   - Easy to test
   - Easy to extend
   - **Reusable:** Any complex business logic

5. **Fail-Fast Validation**
   - Better performance
   - Clearer errors
   - Resource efficient
   - **Reusable:** Always validate cheap checks first

### What Could Be Better

1. **Active Player Tracking**
   - **Current:** Can release while players are playing
   - **Improvement:** Track active players, warn before release
   - **Trade-off:** Added complexity for edge case (acceptable for MVP)

2. **Release History / Audit Log**
   - **Current:** Only know current liveVersion, releasedAt
   - **Improvement:** Track all release events (who released what when)
   - **Use case:** "Who released v2 that broke production?"

3. **Scheduled Releases**
   - **Current:** Instant release only
   - **Improvement:** Schedule release for specific time (cron job)
   - **Use case:** "Release at midnight when traffic is low"

4. **A/B Testing**
   - **Current:** Single live version
   - **Improvement:** Split traffic 50/50 between v1 and v2
   - **Use case:** Test new version with subset of players

### Anti-Patterns Avoided

1. ❌ **Copying entire version on release** - Would waste storage and prevent instant rollback
2. ❌ **Pessimistic locking** - Would block concurrent operations, worse performance
3. ❌ **No delete protection** - Would allow deleting live hunts (catastrophic)
4. ❌ **Heavy response DTOs** - Would slow down API for no reason
5. ❌ **No optimistic locking** - Would allow race conditions and lost updates

---

## 🎯 When to Use This Pattern

**Use "release" pattern when:**
- ✅ Need to publish without affecting live users
- ✅ Need instant rollback capability
- ✅ Multiple versions might exist simultaneously
- ✅ Testing before going live is critical
- ✅ Zero downtime version switching is required

**Examples:**
- Content management (blog posts, documentation)
- Configuration management (feature flags, settings)
- Software deployment (staging → production)
- API versioning (v1, v2, v3)

**Don't use when:**
- ❌ Simple CRUD (no versioning needed)
- ❌ Immediate publish is always acceptable
- ❌ Rollback not needed
- ❌ Single version only

---

## 📝 Summary

**Hunt Release enables:**
- Zero downtime version switching
- Instant rollback to any published version
- Safe experimentation (publish without affecting players)
- Production-grade concurrent operation handling

**Key architectural decisions:**
1. Pointer architecture (liveVersion) for instant switching
2. Optimistic locking for concurrent safety
3. Lightweight response types for performance
4. Helper modules for clean separation
5. Fail-fast validation for better errors

**What makes this production-grade:**
- Transaction-safe atomic operations
- Race condition prevention with optimistic locking
- Delete protection for live hunts
- Clear error messages guide users
- Extensible for future enhancements

**Reusable patterns:**
- Optimistic locking (compare-and-set)
- Pointer vs copy for versioned resources
- Lightweight response types
- Helper modules for business logic
- Fail-fast validation

**This pattern generalizes to any versioned, published resource where instant rollback and zero downtime are critical.**

---

**Last updated:** 2025-11-07
**Status:** ✅ Complete and tested
**API Endpoints:** PUT /api/publishing/hunts/:id/release, DELETE /api/publishing/hunts/:id/release
