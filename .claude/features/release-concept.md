# Release Concept - Understanding Publish vs Release

**Last updated:** 2025-11-06

---

## 🎯 Core Concept

**HuntHub uses a two-step process for making hunts available to players:**

1. **Publish** - Create a version snapshot (permanent, immutable)
2. **Release** - Make a published version "live" for players (reversible, instant)

---

## 📊 Publish vs Release

### Publishing (Creating Versions)

**What it does:**
- Creates an immutable snapshot of the hunt (v1, v2, v3...)
- Marks current draft as "published" (frozen)
- Creates a new draft version for future edits
- Permanent record of hunt state at a point in time

**Example:**
```
Draft v1 → Publish → Published v1 (frozen) + Draft v2 (new)
```

**Can you undo?** No - published versions are permanent records
**Who can see?** Only the creator (not players yet)
**Purpose:** Version control, history tracking

---

### Releasing (Going Live)

**What it does:**
- Designates which published version players can discover and play
- Sets `liveVersion` field on the Hunt master record
- Reversible - can change which version is live at any time
- Instant - no data copying, just updating a pointer

**Example:**
```
Published v1 + Published v2 → Release v2 → Players see v2
```

**Can you undo?** Yes - instantly switch to any published version
**Who can see?** All players (hunt becomes discoverable)
**Purpose:** Controlled deployment to players

---

## 🎬 Complete Workflow Example

### Scenario: Barcelona Treasure Hunt

**Day 1 - Initial Creation:**
```
1. Create hunt (Draft v1)
   - Add 10 steps
   - Test internally

2. Publish v1
   Result: Published v1 (frozen) + Draft v2 (new)
   Status: Hunt exists but players can't see it yet

3. Release v1
   Result: liveVersion = 1
   Status: Hunt now discoverable, players can play v1
```

**Day 5 - Bug Found:**
```
Problem: Step 3 has wrong GPS coordinates

4. Edit Draft v2
   - Fix step 3 coordinates
   - Add 2 more steps

5. Publish v2
   Result: Published v2 (frozen) + Draft v3 (new)
   Status: v1 still live, players still playing v1

6. Release v2
   Result: liveVersion = 2
   Status: All new players see v2, instant switch
```

**Day 6 - Emergency Rollback:**
```
Problem: v2 has game-breaking bug in new steps

7. Release v1 (rollback)
   Result: liveVersion = 1
   Status: Back to v1, v2 still exists (can fix and re-release)
```

**Day 7 - Maintenance:**
```
8. Take Offline
   Result: liveVersion = null
   Status: Hunt not discoverable, can't start new games
   Purpose: Fix major issues, scheduled maintenance

9. Release v1 (bring back online)
   Result: liveVersion = 1
   Status: Hunt discoverable again
```

---

## 🔄 State Diagram

```
┌─────────────────┐
│   Draft v1      │  Starting state
│  (Editing...)   │
└────────┬────────┘
         │ PUBLISH
         ▼
┌─────────────────┐
│ Published v1    │  Frozen, not live yet
│   + Draft v2    │
└────────┬────────┘
         │ RELEASE
         ▼
┌─────────────────┐
│ Published v1    │  ← Players can play this
│ [LIVE]          │
│   + Draft v2    │  ← Creator can edit this
└────────┬────────┘
         │ PUBLISH v2
         ▼
┌─────────────────┐
│ Published v1    │  ← Still live
│ [LIVE]          │
│ Published v2    │  ← Exists, not live
│   + Draft v3    │
└────────┬────────┘
         │ RELEASE v2
         ▼
┌─────────────────┐
│ Published v1    │  ← Not live anymore
│ Published v2    │  ← Now live
│ [LIVE]          │
│   + Draft v3    │
└─────────────────┘
```

---

## 🤔 Why Separate Publish and Release?

### Without Separation (Simple Approach)
```
Publish = Immediate Live

Problems:
❌ Can't test published versions before going live
❌ Can't prepare next version while hunt is live
❌ Rollback requires re-publishing old version
❌ No staging environment
❌ Every publish disrupts live players
```

### With Separation (HuntHub Approach)
```
Publish → Review/Test → Release when ready

Benefits:
✅ Test published versions internally before launch
✅ Prepare next version while current is live
✅ Instant rollback to any published version
✅ Zero downtime version switching
✅ Publish doesn't affect live players
✅ A/B testing possible (future)
✅ Scheduled releases possible (future)
```

---

## 📋 Real-World Analogies

### Software Deployment
```
Publish = Build & Tag (v1.0.0, v1.1.0)
Release = Deploy to Production

Example:
- Build v1.0.0 → Test in staging
- Deploy v1.0.0 to production
- Build v1.1.0 → Test in staging
- Deploy v1.1.0 to production (v1.0.0 still exists)
- Rollback to v1.0.0 if issues
```

### Restaurant Menu
```
Publish = Print menu versions
Release = Put menu on tables

Example:
- Print "Summer Menu 2024" (v1)
- Put Summer Menu on tables (live)
- Print "Fall Menu 2024" (v2)
- Summer Menu still on tables (v1 still live)
- Replace with Fall Menu (switch to v2)
- Customer complaint? Switch back to Summer (rollback to v1)
```

### Netflix Show Releases
```
Publish = Episodes ready, quality checked
Release = Make available to viewers

Example:
- Episodes 1-8 published (ready)
- Release episodes 1-4 (viewers can watch)
- Release episodes 5-8 next week (controlled rollout)
- Episodes pulled for issue (take offline)
- Re-release after fix
```

---

## 🎮 Player Perspective

### What Players See

**Hunt Not Released (liveVersion = null):**
```
Browse Page: Hunt not visible
Search: Hunt doesn't appear
Direct Link: "Hunt not available"
```

**Hunt Released (liveVersion = 2):**
```
Browse Page: Hunt visible in discovery
Search: Hunt appears in results
Direct Link: Opens hunt (version 2)
QR Code: Starts hunt (version 2)
```

**Hunt Taken Offline:**
```
Mid-game players: Can continue current session
New players: "Hunt temporarily unavailable"
```

---

## 🔒 Security & Safety

### Concurrent Modifications

**Problem:** What if two people try to release different versions simultaneously?

**Solution: Optimistic Locking**
```typescript
// User A: Release v1
PUT /release { version: 1, currentLiveVersion: null }

// User B: Release v2 (milliseconds later)
PUT /release { version: 2, currentLiveVersion: null }

Result:
- User A: Success (v1 now live)
- User B: 409 Conflict - "Hunt was modified by another operation"
- User B must retry with currentLiveVersion: 1
```

**Key:** `currentLiveVersion` acts as a "lock" - must match current state to succeed.

---

### Delete Protection

**Problem:** What if someone deletes a hunt while it's live?

**Solution: Atomic Check**
```typescript
// Try to delete hunt with liveVersion = 2
DELETE /api/hunts/123

Result:
→ 409 Conflict: "Cannot delete hunt while it is live"

Workflow:
1. Take hunt offline first (liveVersion → null)
2. Then delete
```

---

## 💡 Design Decisions

### Why `liveVersion` is a Pointer (Not a Copy)

**Approach 1 (Not Used): Copy Live Hunt**
```
Hunt (draft) → Publish → Copy to LiveHunts collection

Problems:
❌ Data duplication
❌ Rollback requires re-copying
❌ Large hunts = slow copies
❌ More storage needed
```

**Approach 2 (HuntHub): Pointer to Published Version**
```
Hunt master → liveVersion = 2 → Points to HuntVersion v2

Benefits:
✅ No data duplication
✅ Instant version switching (just update pointer)
✅ No storage overhead
✅ All versions always available for rollback
```

---

### Why Separate Hunt + HuntVersion Tables

**Hunt Table (Master Record):**
```typescript
{
  huntId: 123,
  creatorId: "user-456",
  latestVersion: 3,      // Current draft
  liveVersion: 2,        // Currently live
  isDeleted: false
}
```
**Purpose:** Metadata, pointers, ownership

**HuntVersion Table (Content):**
```typescript
[
  { huntId: 123, version: 1, name: "...", isPublished: true },
  { huntId: 123, version: 2, name: "...", isPublished: true },
  { huntId: 123, version: 3, name: "...", isPublished: false }
]
```
**Purpose:** Actual hunt content, immutable history

**Benefits:**
- Clean separation of concerns
- Easy to query "all published versions"
- Easy to query "what's currently live"
- Hunt metadata doesn't bloat content records

---

## 🚀 Operations

### Common Operations

**1. First Time Going Live:**
```http
POST /api/hunts              → Create hunt
POST /api/hunts/:id/publish  → Publish v1
PUT /api/hunts/:id/release   → Release v1 (now discoverable)
```

**2. Update Live Hunt:**
```http
PUT /api/hunts/:id           → Edit draft
POST /api/hunts/:id/publish  → Publish v2
PUT /api/hunts/:id/release   → Release v2 (upgrade)
```

**3. Rollback:**
```http
PUT /api/hunts/:id/release
{ "version": 1, "currentLiveVersion": 2 }
```

**4. Maintenance:**
```http
DELETE /api/hunts/:id/release  → Take offline
[Fix issues in draft]
POST /api/hunts/:id/publish    → Publish new version
PUT /api/hunts/:id/release     → Bring back online
```

---

## 📊 Database State

### Example Hunt Lifecycle

**Hunt Master Record:**
```
Time T1: { huntId: 1, latestVersion: 1, liveVersion: null }
Time T2: { huntId: 1, latestVersion: 2, liveVersion: 1 }    ← Released v1
Time T3: { huntId: 1, latestVersion: 3, liveVersion: 2 }    ← Released v2
Time T4: { huntId: 1, latestVersion: 3, liveVersion: 1 }    ← Rolled back to v1
Time T5: { huntId: 1, latestVersion: 3, liveVersion: null } ← Taken offline
```

**HuntVersion Records:**
```
v1: { huntId: 1, version: 1, isPublished: true, name: "Barcelona v1" }
v2: { huntId: 1, version: 2, isPublished: true, name: "Barcelona v2" }
v3: { huntId: 1, version: 3, isPublished: false, name: "Barcelona v3" }
```

**All versions persist** - can always rollback to any published version.

---

## 🎯 Key Takeaways

1. **Publish = Create immutable version snapshot**
2. **Release = Make version discoverable to players**
3. **Separation enables zero-downtime updates and instant rollback**
4. **liveVersion is a pointer, not a copy (fast switching)**
5. **Optimistic locking prevents concurrent modification bugs**
6. **Can't delete live hunts (safety protection)**
7. **All published versions persist forever (rollback ready)**

---

## 📚 Related Docs

- `.claude/features/release-hunt-completed.md` - Full implementation details
- `.claude/publishing-workflow.md` - Publishing workflow explanation
- `.claude/versioning-architecture.md` - Hunt versioning deep dive
- `.claude/backend/current-state.md` - Current system state

---

**Last Updated:** 2025-11-06
**Status:** Implemented & Production Ready