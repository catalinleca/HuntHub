# Publishing Workflow & Versioning

**This is one of the most complex parts of HuntHub.** Understanding this flow is critical.

## Core Concepts

**Three Hunt States:**
1. **Draft** - Working copy, always editable, only one per hunt
2. **Review** - Pre-publish state, ready for final checks
3. **Published** - Immutable snapshot with version number

**Key Principles:**
- There is always exactly ONE draft version per hunt
- There can be MULTIPLE published versions per hunt
- Only ONE published version can be "Live" at a time
- Published versions are immutable (read-only)
- Editing a published version overwrites the current draft

## Publishing State Machine

```
        ┌──────────────┐
        │    DRAFT     │ ← Always exists, always editable
        └──────┬───────┘
               │ (User clicks "Ready for Review")
               ▼
        ┌──────────────┐
        │    REVIEW    │ ← Final checks before publish
        └──────┬───────┘
               │
               ├───(Make changes)───→ Back to DRAFT
               │
               │ (User clicks "Publish")
               ▼
        ┌──────────────┐
        │  PUBLISHED   │ ← Immutable snapshot
        │  (Version N) │
        └──────────────┘
               │
               ├───(Set as Live)───→ LiveHunt collection
               │
               └───(Edit)───→ Overwrites DRAFT
```

## Publishing Flow (Step by Step)

### 1. Create Hunt
```
User creates hunt → Status: DRAFT
- Hunt document created with status="draft"
- Steps created with reference to hunt._id
- User can edit freely
```

### 2. Move to Review
```
User clicks "Ready for Review"
→ Status changes: DRAFT → REVIEW
- Hunt status updated to "review"
- No new documents created
- Still editable, but any edit moves back to DRAFT
```

### 3. Publish Hunt
```
User clicks "Publish" from REVIEW state
→ Creates PUBLISHED version
```

**What happens:**
1. Clone the draft hunt document
   - New _id generated
   - Status set to "published"
   - Version number assigned (auto-increment)
2. Clone all steps
   - New _ids for each step
   - Reference new published hunt._id
3. Create PublishedHunt record
   - Links huntId (draft) to versionId (published clone)
   - Stores version name (user provided)
   - Stores version number
4. Draft remains as-is
   - Still status="draft"
   - Still editable
   - Untouched by publishing

### 4. Set Live Version
```
User selects which published version should be "Live"
→ Updates LiveHunt collection
```

**LiveHunt Collection:**
```javascript
{
  _id: "...",
  huntId: "AAA-111",        // The common hunt ID
  versionId: "AAA-333",     // Which published version is live
  publishedHuntId: "..."    // Reference to PublishedHunt record
}
```

**Constraint:** Only ONE live version per huntId (enforced by unique index)

## Database Collections

### Hunt Collection (stores both drafts and published)

**Draft Hunt:**
```javascript
{
  _id: "AAA-111",
  creatorId: "user-123",
  status: "draft",          // draft | review | published
  name: "Barcelona Hunt",
  description: "...",
  currentVersion: 1,        // Next version number to use
  stepOrder: ["111", "222"],
  startLocation: { lat: 41.3, lng: 2.1, radius: 50 },
  createdAt: "2025-02-05T...",
  updatedAt: "2025-02-05T..."
}
```

**Published Hunt (clone):**
```javascript
{
  _id: "AAA-222",           // NEW ID
  creatorId: "user-123",
  status: "published",
  name: "Barcelona Hunt",
  description: "...",
  currentVersion: 1,        // Version this represents
  stepOrder: ["333", "444"], // NEW step IDs
  startLocation: { lat: 41.3, lng: 2.1, radius: 50 },
  createdAt: "2025-02-05T...",
  updatedAt: "2025-02-05T..."
}
```

### Step Collection

**Draft Steps:**
```javascript
{
  _id: "111",
  huntId: "AAA-111",       // References draft hunt
  type: "clue",
  challenge: { title: "..." },
  ...
}
```

**Published Steps (clones):**
```javascript
{
  _id: "333",              // NEW ID
  huntId: "AAA-222",       // References published hunt
  type: "clue",
  challenge: { title: "..." },
  ...
}
```

### PublishedHunt Collection (metadata)

```javascript
{
  _id: "random-123",
  huntId: "AAA-111",       // The draft hunt ID (common identifier)
  versionId: "AAA-222",    // The published hunt clone ID
  versionName: "Alex Version", // User-provided name
  versionNumber: 1,        // Auto-incrementing
  publishedAt: "2025-02-05T...",
  publishedBy: "user-123"
}
```

### LiveHunt Collection (which version is active)

```javascript
{
  _id: "random-789",
  huntId: "AAA-111",       // The common hunt identifier
  versionId: "AAA-222",    // Which published version is live
  setLiveAt: "2025-02-05T...",
  setLiveBy: "user-123"
}
```

**Unique index on `huntId`** ensures only one live version per hunt.

## User Interactions

### View Published Versions

From Hunt Details page:
```
[Draft Version] ← Always visible, always editable
  └─ Hunt Editor (editable)

[Published Versions Dropdown]
  Version 2 - "Mike Version" (Live) ⭐
  Version 1 - "Alex Version"

Each published version has:
  [View] → Opens editor in read-only mode
  [Edit] → Loads this version into draft (⚠️ Warning shown)
  [Set as Live] → Updates LiveHunt collection
```

### Edit Published Version

User clicks "Edit" on published version:

**Warning shown:**
```
⚠️  You will lose your current unreleased changes

Current draft changes will be overwritten with:
"Mike Version" (Version 2) from 2025-02-05

Do you want to continue?
[Cancel] [Continue]
```

**If Continue:**
1. Load published hunt data
2. Overwrite draft hunt document
3. Clone published steps → overwrite draft steps
4. User can now edit (draft is now based on that version)

### Publish New Version

User publishes from draft:

**Prompt:**
```
Publish new version

Version name: [_____________]
             (e.g., "Final version", "Christmas special")

Current version number: 3

[Cancel] [Publish]
```

**Result:**
- New published hunt clone created
- New published steps created
- PublishedHunt record added
- Draft remains unchanged
- currentVersion incremented

## Data Flow Diagrams

### Publishing Process

```
┌─────────────┐
│  DRAFT HUNT │ (AAA-111)
│  + Steps    │ (111, 222)
└──────┬──────┘
       │
       │ User clicks "Publish"
       │
       ▼
┌──────────────────────────────────────────┐
│         Clone Operation                  │
│  1. Clone Hunt    → AAA-222              │
│  2. Clone Steps   → 333, 444             │
│  3. Create PublishedHunt record          │
└──────┬───────────────────────────────────┘
       │
       ├─────────────┬─────────────┐
       ▼             ▼             ▼
  ┌─────────┐  ┌──────────┐  ┌─────────────┐
  │ Hunt    │  │ Step     │  │ Published   │
  │ AAA-222 │  │ 333, 444 │  │ Hunt Record │
  │ (clone) │  │ (clones) │  │ (metadata)  │
  └─────────┘  └──────────┘  └─────────────┘
```

### Setting Live Version

```
┌────────────────────┐
│ Published Versions │
│  - v1 (AAA-222)    │
│  - v2 (AAA-333) ✓  │ ← User selects v2
│  - v3 (AAA-444)    │
└─────────┬──────────┘
          │
          │ User clicks "Set as Live" on v2
          ▼
┌─────────────────────┐
│  LiveHunt Table     │
│  huntId: AAA-111    │
│  versionId: AAA-333 │ ← Points to v2
└─────────────────────┘
          │
          │ Player app queries LiveHunt
          ▼
┌─────────────────────┐
│ Player Gets v2 Data │
│ Hunt AAA-333        │
│ Steps from AAA-333  │
└─────────────────────┘
```

## Open Questions / Decisions Needed

### 1. Steps: Embedded vs Separate Collection?

**Current:** Separate collection

**Alternative:** Embed steps in hunt document

**Pros of Separate:**
- Easier to query individual steps
- Steps can be large (won't hit document size limit)
- Existing code uses this pattern

**Cons of Separate:**
- More complex cloning on publish
- Need to manage step references

**Decision:** [TO BE DECIDED] - Leaning toward separate for now

### 2. Progress Tracking

**Question:** How to track user progress through hunts?

**Options:**
a) Progress collection (current schema)
b) Embedded in user document
c) Real-time only (no persistence)

**Needs:** [TO BE DEFINED]

### 3. Review State - Is it needed?

**Question:** Do we really need the REVIEW state?

**Simpler alternative:** Draft → Publish (skip review)

**Current thinking:** Keep REVIEW for deliberate publishing flow

**Decision:** [TO BE DECIDED]

## Implementation Complexity

**Easy parts:**
- ✅ Draft CRUD operations
- ✅ Status transitions (draft ↔ review)

**Medium complexity:**
- ⚠️ Cloning hunts + steps on publish
- ⚠️ Version number management
- ⚠️ QR code generation per version

**Hard parts:**
- 🔴 Editing published version (overwriting draft with warning)
- 🔴 Ensuring live version consistency
- 🔴 Managing step order across versions
- 🔴 Progress tracking across versions (if user plays v1, then v2 goes live)

## Testing Considerations

**Critical scenarios to test:**
1. Publish → Set Live → Player sees correct version
2. Publish v2 → Set v2 Live → Player switches from v1 to v2
3. Edit published version → Draft overwrites correctly
4. Multiple publishes → Version numbers increment
5. Delete draft → Published versions remain
6. Unique live version constraint (can't have 2 live versions)
