# Release Hunt - Implementation Plan

**Last updated:** 2025-11-05

**Status:** Ready for implementation

---

## Executive Summary

**Feature:** Release Hunt (Set Live Version)

**Purpose:** Allow hunt creators to designate which published version of their hunt is currently "live" (active for players).

**Architecture:** Extends existing Hunt versioning system with atomic release/take-offline operations.

**Estimated Time:** 3-4 hours

---

## Context & Decisions

### Key Decisions Made

1. **activePlayers tracking**: YAGNI for MVP - don't implement
2. **Separate endpoint**: YES - PUT /api/publishing/hunts/:id/release
3. **isLive in DTO**: YES - computed boolean flag (version === liveVersion)
4. **No blocking on operations**: Architecture handles it - edits are always on draft
5. **Delete hunt protection**: Must check liveVersion !== null first
6. **Rollback capability**: Already supported (zero additional complexity)
7. **Version parameter**: In request body, optional (auto-detect latest published if not provided)
8. **Optimistic locking**: Required (currentLiveVersion in body)

### Final Terminology

- **Action**: "Release" (make version live)
- **Opposite action**: "Take offline" (clear live version)
- **DTO flag**: `isLive` (boolean, computed)
- **DB fields**: `liveVersion` (existing), `releasedAt`, `releasedBy`

---

## Current Architecture Analysis

### Existing Fields

**Hunt model (`src/database/models/Hunt.ts`):**
```typescript
{
  huntId: number,
  creatorId: ObjectId,
  latestVersion: number,          // Always draft
  liveVersion: number | null,     // ✅ Already exists!
  isDeleted: boolean,
  deletedAt?: Date,
  createdAt?: Date,
  updatedAt?: Date
}
```

**Hunt DTO (returned to API):**
```typescript
{
  huntId: number,
  creatorId: string,
  version: number,                // Current version being viewed
  latestVersion: number,          // Always draft
  liveVersion: number | null,     // ✅ Already exists!
  isPublished: boolean,           // Current version's publish status
  publishedAt?: string,
  publishedBy?: string,
  status: HuntStatus,
  // ... other fields
}
```

### Missing Fields (Need to Add)

**IHunt interface:**
```typescript
releasedAt?: Date;
releasedBy?: string;
```

**Hunt DTO:**
```typescript
isLive: boolean;        // Computed: version === liveVersion
releasedAt?: string;
releasedBy?: string;
```

### Existing Patterns to Follow

**From `publishing.service.ts` - publishHunt():**
```typescript
async publishHunt(huntId: number, userId: string): Promise<Hunt> {
  // 1. Verify ownership (fail fast)
  const huntDoc = await this.huntService.verifyOwnership(huntId, userId);

  // 2. Start transaction
  const session = await mongoose.startSession();

  try {
    return session.withTransaction(async () => {
      // 3. Validate using helper
      await VersionValidator.validateCanPublish(huntDoc, session);

      // 4. Clone steps using helper
      await StepCloner.cloneStepsToNewVersion(huntDoc, session);

      // 5. Update versions using helper
      await VersionPublisher.markVersionPublished(huntDoc, userId, session);

      // 6. Return merged DTO
      const [updatedHunt, draftVersion] = await Promise.all([
        HuntModel.findOne({ huntId }).session(session),
        HuntVersionModel.findByHuntIdAndVersion(huntId, huntDoc.latestVersion).session(session),
      ]);

      return HuntMapper.fromDocuments(updatedHunt!, draftVersion!);
    });
  } finally {
    await session.endSession();
  }
}
```

**Key pattern elements:**
- Verify ownership first
- Use transactions for atomicity
- Use helper modules for separation of concerns
- Return Hunt DTO via HuntMapper

---

## Implementation Steps

### Step 1: Update Database Schema

**File:** `src/database/types/Hunt.ts`

**Add to IHunt interface:**
```typescript
export interface IHunt {
  huntId: number;
  creatorId: mongoose.Types.ObjectId;
  latestVersion: number;
  liveVersion: number | null;
  isDeleted: boolean;
  deletedAt?: Date;
  releasedAt?: Date;      // ← ADD THIS
  releasedBy?: string;    // ← ADD THIS
  createdAt?: Date;
  updatedAt?: Date;
}
```

---

### Step 2: Update Mongoose Model

**File:** `src/database/models/Hunt.ts`

**Add fields to schema:**
```typescript
const huntSchema: Schema<IHunt> = new Schema<IHunt>(
  {
    huntId: { type: Number, required: false },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    latestVersion: { type: Number, required: true, default: 1 },
    liveVersion: { type: Number, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    releasedAt: Date,        // ← ADD THIS
    releasedBy: String,      // ← ADD THIS
  },
  { timestamps: true },
);

// Index already exists:
huntSchema.index({ liveVersion: 1 });
```

**Note:** No new index needed - liveVersion index already exists.

---

### Step 3: Update Hunt DTO Type

**File:** `packages/shared/src/types/Hunt.ts` (or wherever Hunt DTO is defined)

**Add fields:**
```typescript
export interface Hunt {
  huntId: number;
  creatorId: string;
  version: number;
  latestVersion: number;
  liveVersion: number | null;
  isLive: boolean;          // ← ADD THIS (computed)
  isPublished: boolean;
  publishedAt?: string;
  publishedBy?: string;
  releasedAt?: string;      // ← ADD THIS
  releasedBy?: string;      // ← ADD THIS
  status: HuntStatus;
  // ... other fields
}
```

---

### Step 4: Update HuntMapper

**File:** `src/shared/mappers/hunt.mapper.ts`

**Update fromDocuments method:**
```typescript
static fromDocuments(
  huntDoc: HydratedDocument<IHunt>,
  versionDoc: HydratedDocument<IHuntVersion>,
): Hunt {
  return {
    huntId: huntDoc.huntId,
    creatorId: huntDoc.creatorId.toString(),
    version: versionDoc.version,
    latestVersion: huntDoc.latestVersion,
    liveVersion: huntDoc.liveVersion,
    isLive: versionDoc.version === huntDoc.liveVersion,  // ← ADD THIS
    isPublished: versionDoc.isPublished,
    publishedAt: versionDoc.publishedAt?.toISOString(),
    publishedBy: versionDoc.publishedBy,
    releasedAt: huntDoc.releasedAt?.toISOString(),       // ← ADD THIS
    releasedBy: huntDoc.releasedBy,                       // ← ADD THIS
    status: versionDoc.isPublished ? HuntStatus.Published : HuntStatus.Draft,
    name: versionDoc.name,
    description: versionDoc.description,
    startLocation: versionDoc.startLocation,
    stepOrder: versionDoc.stepOrder,
    createdAt: huntDoc.createdAt?.toISOString(),
    updatedAt: versionDoc.updatedAt?.toISOString(),
  };
}
```

---

### Step 5: Create Helper Module (Optional)

**File:** `src/features/publishing/helpers/version-releaser.helper.ts`

**Purpose:** Encapsulate release logic (following VersionPublisher pattern)

```typescript
import { HydratedDocument } from 'mongoose';
import { ClientSession } from 'mongoose';
import { IHunt } from '@/database/types/Hunt';
import { IHuntVersion } from '@/database/types/HuntVersion';
import HuntModel from '@/database/models/Hunt';
import HuntVersionModel from '@/database/models/HuntVersion';
import { ConflictError, NotFoundError } from '@/shared/errors';

export class VersionReleaser {
  /**
   * Auto-detect latest published version
   */
  static async getLatestPublishedVersion(
    huntId: number,
    session?: ClientSession,
  ): Promise<number> {
    const latestPublished = await HuntVersionModel.findOne({
      huntId,
      isPublished: true,
    })
      .sort({ version: -1 })
      .limit(1)
      .session(session || null);

    if (!latestPublished) {
      throw new ConflictError(
        'No published versions available to release. Publish a version first.',
      );
    }

    return latestPublished.version;
  }

  /**
   * Validate version is published
   */
  static async validateVersionIsPublished(
    huntId: number,
    version: number,
    session?: ClientSession,
  ): Promise<void> {
    const versionDoc = await HuntVersionModel.findByHuntIdAndVersion(
      huntId,
      version,
    ).session(session || null);

    if (!versionDoc) {
      throw new NotFoundError(`Version ${version} not found`);
    }

    if (!versionDoc.isPublished) {
      throw new ConflictError(
        `Version ${version} is not published. Only published versions can be released.`,
      );
    }
  }

  /**
   * Release a version (set as live) with optimistic locking
   */
  static async releaseVersion(
    huntDoc: HydratedDocument<IHunt>,
    version: number,
    userId: string,
    currentLiveVersion: number | null,
    session: ClientSession,
  ): Promise<HydratedDocument<IHunt>> {
    // Optimistic locking: Compare-and-set pattern
    const updateResult = await HuntModel.findOneAndUpdate(
      {
        huntId: huntDoc.huntId,
        liveVersion: currentLiveVersion,  // Must match current state
      },
      {
        liveVersion: version,
        releasedAt: new Date(),
        releasedBy: userId,
      },
      {
        new: true,
        session,
      },
    );

    if (!updateResult) {
      throw new ConflictError(
        'Hunt was modified by another operation. Please retry with the current liveVersion.',
      );
    }

    return updateResult;
  }

  /**
   * Take hunt offline (clear live version) with optimistic locking
   */
  static async takeOffline(
    huntDoc: HydratedDocument<IHunt>,
    currentLiveVersion: number | null,
    session: ClientSession,
  ): Promise<HydratedDocument<IHunt>> {
    if (huntDoc.liveVersion === null) {
      throw new ConflictError('Hunt is not currently live');
    }

    // Optimistic locking: Compare-and-set pattern
    const updateResult = await HuntModel.findOneAndUpdate(
      {
        huntId: huntDoc.huntId,
        liveVersion: currentLiveVersion,  // Must match current state
      },
      {
        liveVersion: null,
        releasedAt: null,
        releasedBy: null,
      },
      {
        new: true,
        session,
      },
    );

    if (!updateResult) {
      throw new ConflictError(
        'Hunt was modified by another operation. Please retry with the current liveVersion.',
      );
    }

    return updateResult;
  }
}
```

---

### Step 6: Update PublishingService Interface

**File:** `src/features/publishing/publishing.service.ts`

**Add to IPublishingService interface:**
```typescript
export interface IPublishingService {
  publishHunt(huntId: number, userId: string): Promise<Hunt>;
  releaseHunt(
    huntId: number,
    userId: string,
    version?: number,
    currentLiveVersion?: number | null,
  ): Promise<Hunt>;
  takeOffline(
    huntId: number,
    userId: string,
    currentLiveVersion: number | null,
  ): Promise<Hunt>;
}
```

---

### Step 7: Implement Service Methods

**File:** `src/features/publishing/publishing.service.ts`

**Add releaseHunt method:**
```typescript
async releaseHunt(
  huntId: number,
  userId: string,
  version?: number,
  currentLiveVersion?: number | null,
): Promise<Hunt> {
  // 1. Verify ownership (fail fast)
  const huntDoc = await this.huntService.verifyOwnership(huntId, userId);

  // 2. Start transaction
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => {
      // 3. Auto-detect version if not provided
      const targetVersion =
        version ?? (await VersionReleaser.getLatestPublishedVersion(huntId, session));

      // 4. Validate version is published
      await VersionReleaser.validateVersionIsPublished(huntId, targetVersion, session);

      // 5. Release version with optimistic locking
      const updatedHunt = await VersionReleaser.releaseVersion(
        huntDoc,
        targetVersion,
        userId,
        currentLiveVersion ?? null,
        session,
      );

      // 6. Fetch version document and return merged DTO
      const versionDoc = await HuntVersionModel.findByHuntIdAndVersion(
        huntId,
        updatedHunt.latestVersion,
      ).session(session);

      return HuntMapper.fromDocuments(updatedHunt, versionDoc!);
    });
  } finally {
    await session.endSession();
  }
}
```

**Add takeOffline method:**
```typescript
async takeOffline(
  huntId: number,
  userId: string,
  currentLiveVersion: number | null,
): Promise<Hunt> {
  // 1. Verify ownership (fail fast)
  const huntDoc = await this.huntService.verifyOwnership(huntId, userId);

  // 2. Start transaction
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => {
      // 3. Take offline with optimistic locking
      const updatedHunt = await VersionReleaser.takeOffline(
        huntDoc,
        currentLiveVersion,
        session,
      );

      // 4. Fetch version document and return merged DTO
      const versionDoc = await HuntVersionModel.findByHuntIdAndVersion(
        huntId,
        updatedHunt.latestVersion,
      ).session(session);

      return HuntMapper.fromDocuments(updatedHunt, versionDoc!);
    });
  } finally {
    await session.endSession();
  }
}
```

---

### Step 8: Update PublishingController

**File:** `src/features/publishing/publishing.controller.ts`

**Add to IPublishingController interface:**
```typescript
export interface IPublishingController {
  publishHunt(req: Request, res: Response): Promise<Response>;
  releaseHunt(req: Request, res: Response): Promise<Response>;
  takeOffline(req: Request, res: Response): Promise<Response>;
}
```

**Implement releaseHunt:**
```typescript
async releaseHunt(req: Request, res: Response): Promise<Response> {
  const huntId = parseNumericId(req.params.id);

  if (isNaN(huntId)) {
    throw new ValidationError('Invalid hunt ID', []);
  }

  const { version, currentLiveVersion } = req.body;

  const result = await this.publishingService.releaseHunt(
    huntId,
    req.user.id,
    version,
    currentLiveVersion,
  );

  return res.status(200).json({
    success: true,
    message: version
      ? `Version ${version} is now live`
      : 'Latest published version is now live',
    hunt: result,
  });
}
```

**Implement takeOffline:**
```typescript
async takeOffline(req: Request, res: Response): Promise<Response> {
  const huntId = parseNumericId(req.params.id);

  if (isNaN(huntId)) {
    throw new ValidationError('Invalid hunt ID', []);
  }

  const { currentLiveVersion } = req.body;

  if (currentLiveVersion === undefined) {
    throw new ValidationError('currentLiveVersion is required for optimistic locking', []);
  }

  const result = await this.publishingService.takeOffline(
    huntId,
    req.user.id,
    currentLiveVersion,
  );

  return res.status(200).json({
    success: true,
    message: 'Hunt is now offline',
    hunt: result,
  });
}
```

---

### Step 9: Add Routes

**File:** `src/features/publishing/publishing.routes.ts`

**Add new routes:**
```typescript
import { Router } from 'express';
import { getContainer } from '@/shared/di/container';
import { TYPES } from '@/shared/types';
import { IPublishingController } from './publishing.controller';

const router = Router();
const container = getContainer();
const controller = container.get<IPublishingController>(TYPES.PublishingController);

// Existing route
router.post('/:id/publish', (req, res, next) => {
  controller.publishHunt(req, res).catch(next);
});

// NEW: Release hunt (set live)
router.put('/:id/release', (req, res, next) => {
  controller.releaseHunt(req, res).catch(next);
});

// NEW: Take offline (clear live)
router.delete('/:id/release', (req, res, next) => {
  controller.takeOffline(req, res).catch(next);
});

export default router;
```

---

### Step 10: Update HuntService - Delete Protection

**File:** `src/modules/hunts/hunt.service.ts`

**Update deleteHunt method:**
```typescript
async deleteHunt(id: number, userId: string): Promise<void> {
  const huntDoc = await this.verifyOwnership(id, userId);

  // ✅ ADD THIS CHECK
  if (huntDoc.liveVersion !== null) {
    throw new ConflictError(
      'Cannot delete hunt while it is live. Take the hunt offline first.',
    );
  }

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // Soft delete hunt
      await HuntModel.findOneAndUpdate(
        { huntId: id },
        { isDeleted: true, deletedAt: new Date() },
        { session },
      );

      // Cascade delete HuntVersions
      await HuntVersionModel.deleteMany({ huntId: id }, { session });

      // Cascade delete Steps
      await StepModel.deleteMany({ huntId: id }, { session });
    });
  } finally {
    await session.endSession();
  }
}
```

---

## API Specification

### Release Hunt (Set Live)

**Endpoint:** `PUT /api/publishing/hunts/:id/release`

**Request Body:**
```typescript
{
  version?: number;              // Optional: specific version to release
  currentLiveVersion?: number | null;  // Required: for optimistic locking
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Version 2 is now live",
  "hunt": {
    "huntId": 123,
    "version": 3,
    "latestVersion": 3,
    "liveVersion": 2,
    "isLive": false,
    "releasedAt": "2025-11-05T10:30:00.000Z",
    "releasedBy": "user-456"
  }
}
```

**Error Response (409 - Conflict):**
```json
{
  "message": "Hunt was modified by another operation. Please retry with the current liveVersion."
}
```

**Error Response (409 - No Published Versions):**
```json
{
  "message": "No published versions available to release. Publish a version first."
}
```

**Error Response (409 - Version Not Published):**
```json
{
  "message": "Version 5 is not published. Only published versions can be released."
}
```

---

### Take Offline

**Endpoint:** `DELETE /api/publishing/hunts/:id/release`

**Request Body:**
```typescript
{
  currentLiveVersion: number | null;  // Required: for optimistic locking
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Hunt is now offline",
  "hunt": {
    "huntId": 123,
    "liveVersion": null,
    "isLive": false,
    "releasedAt": null,
    "releasedBy": null
  }
}
```

**Error Response (409 - Not Live):**
```json
{
  "message": "Hunt is not currently live"
}
```

**Error Response (409 - Concurrent Modification):**
```json
{
  "message": "Hunt was modified by another operation. Please retry with the current liveVersion."
}
```

---

## Validation Logic Flows

### Flow 1: Release with Explicit Version

```
Request: PUT /api/publishing/hunts/123/release
Body: { version: 2, currentLiveVersion: null }

1. Verify ownership (huntId 123, userId from token)
2. Start transaction
3. Use provided version (2)
4. Validate version 2 is published ✅
5. Compare-and-set: liveVersion null → 2
6. Update releasedAt, releasedBy
7. Return Hunt DTO with isLive computed
```

**Result:**
- Hunt 123's liveVersion = 2
- Players see version 2 when playing
- Version 2's DTO has isLive = true
- Other versions have isLive = false

---

### Flow 2: Release Auto-Detect Latest Published

```
Request: PUT /api/publishing/hunts/123/release
Body: { currentLiveVersion: 1 }  // No version specified

1. Verify ownership
2. Start transaction
3. Auto-detect: Query HuntVersion.find({ huntId: 123, isPublished: true }).sort({ version: -1 })
   → Finds version 3 (latest published)
4. Validate version 3 is published ✅
5. Compare-and-set: liveVersion 1 → 3
6. Update releasedAt, releasedBy
7. Return Hunt DTO
```

**Result:**
- Hunt 123's liveVersion = 3 (automatically selected)
- Upgraded from version 1 to latest published (3)

---

### Flow 3: Rollback to Previous Version

```
Request: PUT /api/publishing/hunts/123/release
Body: { version: 1, currentLiveVersion: 3 }

1. Verify ownership
2. Start transaction
3. Use provided version (1)
4. Validate version 1 is published ✅
5. Compare-and-set: liveVersion 3 → 1
6. Update releasedAt, releasedBy
7. Return Hunt DTO
```

**Result:**
- Rolled back from version 3 to version 1
- Version 1 is now live
- No additional complexity - already supported by architecture

---

### Flow 4: Take Offline

```
Request: DELETE /api/publishing/hunts/123/release
Body: { currentLiveVersion: 2 }

1. Verify ownership
2. Start transaction
3. Check hunt.liveVersion !== null ✅
4. Compare-and-set: liveVersion 2 → null
5. Clear releasedAt, releasedBy
6. Return Hunt DTO
```

**Result:**
- Hunt 123 is no longer live
- Players cannot start new sessions
- All versions have isLive = false

---

### Flow 5: Optimistic Lock Failure

```
Request: PUT /api/publishing/hunts/123/release
Body: { version: 2, currentLiveVersion: 1 }

1. Verify ownership
2. Start transaction
3. Validate version 2 is published ✅
4. Compare-and-set: WHERE liveVersion = 1
   → Current liveVersion is 2 (changed by another request)
   → findOneAndUpdate returns null
5. Throw ConflictError: "Hunt was modified..."
```

**Client action:**
- Fetch latest hunt state
- Retry with currentLiveVersion: 2

---

## Edge Cases & Validation

### Case 1: Release Unpublished Version

**Request:**
```json
{ "version": 5, "currentLiveVersion": null }
```

**Validation:**
```typescript
const versionDoc = await HuntVersionModel.findByHuntIdAndVersion(huntId, 5);
if (!versionDoc.isPublished) {
  throw new ConflictError('Version 5 is not published...');
}
```

**Error:** 409 Conflict

---

### Case 2: No Published Versions Exist

**Request:**
```json
{ "currentLiveVersion": null }  // Auto-detect
```

**Validation:**
```typescript
const latestPublished = await HuntVersionModel.findOne({
  huntId,
  isPublished: true,
}).sort({ version: -1 });

if (!latestPublished) {
  throw new ConflictError('No published versions available...');
}
```

**Error:** 409 Conflict

---

### Case 3: Take Offline When Not Live

**Request:**
```json
DELETE /api/publishing/hunts/123/release
{ "currentLiveVersion": null }
```

**Validation:**
```typescript
if (huntDoc.liveVersion === null) {
  throw new ConflictError('Hunt is not currently live');
}
```

**Error:** 409 Conflict

---

### Case 4: Delete Live Hunt

**Request:**
```
DELETE /api/hunts/123
```

**Validation (in deleteHunt):**
```typescript
if (huntDoc.liveVersion !== null) {
  throw new ConflictError('Cannot delete hunt while it is live. Take the hunt offline first.');
}
```

**Error:** 409 Conflict

**User action:**
1. Take hunt offline first
2. Then delete

---

## Testing Checklist

### Unit Tests (Service Layer)

- [ ] Release with explicit version
- [ ] Release with auto-detect (latest published)
- [ ] Rollback to previous published version
- [ ] Take offline
- [ ] Optimistic lock failure (concurrent modification)
- [ ] Release unpublished version (should fail)
- [ ] Auto-detect when no published versions (should fail)
- [ ] Take offline when not live (should fail)
- [ ] Delete live hunt (should fail)

### Integration Tests (API)

- [ ] PUT /api/publishing/hunts/:id/release - success
- [ ] PUT /api/publishing/hunts/:id/release - auto-detect success
- [ ] PUT /api/publishing/hunts/:id/release - 409 concurrent modification
- [ ] PUT /api/publishing/hunts/:id/release - 409 no published versions
- [ ] PUT /api/publishing/hunts/:id/release - 404 version not found
- [ ] DELETE /api/publishing/hunts/:id/release - success
- [ ] DELETE /api/publishing/hunts/:id/release - 409 not live
- [ ] DELETE /api/hunts/:id - 409 hunt is live
- [ ] Hunt DTO includes isLive flag correctly
- [ ] Hunt DTO includes releasedAt and releasedBy

### Transaction Safety Tests

- [ ] Release operation is atomic (all or nothing)
- [ ] Take offline operation is atomic
- [ ] Concurrent release attempts handled correctly
- [ ] Database state consistent after failures

---

## Migration Considerations

**No migration script needed** - new fields have default values:

```typescript
releasedAt: Date,    // undefined by default
releasedBy: String,  // undefined by default
```

**Existing hunts:**
- `liveVersion` already exists (may be null)
- `releasedAt` will be undefined until first release
- `releasedBy` will be undefined until first release

**No data migration required.**

---

## Rollout Plan

### Phase 1: Database & Mapper (Low Risk)
1. Add releasedAt, releasedBy to IHunt interface
2. Add releasedAt, releasedBy to Hunt model
3. Update HuntMapper to include isLive, releasedAt, releasedBy
4. Deploy - **no breaking changes**

### Phase 2: Helper Module (Low Risk)
1. Create VersionReleaser helper
2. Add unit tests
3. No API changes - **no breaking changes**

### Phase 3: Service & Controller (Medium Risk)
1. Add releaseHunt and takeOffline to service
2. Add releaseHunt and takeOffline to controller
3. Add routes
4. Deploy - **new endpoints only, existing API unchanged**

### Phase 4: Delete Protection (Medium Risk)
1. Update deleteHunt to check liveVersion
2. Add integration tests
3. Deploy - **behavior change for delete**

---

## Production Checklist

**Before merging:**
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] TypeScript compilation successful
- [ ] ESLint passing
- [ ] Optimistic locking tested with concurrent requests
- [ ] Error messages are clear and actionable
- [ ] API documentation updated
- [ ] Postman/Insomnia collection updated

**After merging:**
- [ ] Monitor error rates
- [ ] Verify transaction logs
- [ ] Check database indexes are used (liveVersion)
- [ ] Validate optimistic locking catches race conditions

---

## Future Enhancements (Not MVP)

**Active Players Tracking:**
- Add `activePlayers: number` to Hunt DTO
- Track via PlaySession model (when implemented)
- Real-time updates via WebSocket (V1.1)

**Scheduled Releases:**
- Add `scheduledReleaseAt: Date` field
- Cron job to auto-release at specified time

**Release History:**
- Track all release events (audit log)
- Show release timeline in UI

**Soft Rollback:**
- Keep previous live version cached
- Instant rollback without transaction

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│ Client Request                                           │
│ PUT /api/publishing/hunts/123/release                   │
│ { version?: 2, currentLiveVersion: 1 }                  │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ PublishingController.releaseHunt()                      │
│ - Parse huntId from params                              │
│ - Extract version, currentLiveVersion from body         │
│ - Delegate to service                                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│ PublishingService.releaseHunt()                         │
│ 1. Verify ownership (fail fast)                         │
│ 2. Start transaction                                    │
│ 3. Auto-detect version if not provided                  │
│ 4. Validate version is published                        │
│ 5. Release with optimistic locking                      │
│ 6. Return Hunt DTO                                      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ├──────────────┬──────────────────┐
                       ▼              ▼                  ▼
              ┌─────────────┐ ┌─────────────┐  ┌─────────────┐
              │VerifyOwner  │ │VersionRel..│  │HuntMapper   │
              │(HuntService)│ │(Helper)     │  │(from...Docs)│
              └─────────────┘ └─────────────┘  └─────────────┘
                       │              │                  │
                       └──────────────┴──────────────────┘
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │ MongoDB Transaction   │
                          │ - Compare-and-set     │
                          │ - Update Hunt doc     │
                          └───────────────────────┘
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │ Response              │
                          │ { hunt: {...} }       │
                          └───────────────────────┘
```

---

## Summary

**What we're building:**
- Release hunt endpoint (PUT /release)
- Take offline endpoint (DELETE /release)
- Auto-detect latest published version
- Optimistic locking with currentLiveVersion
- isLive computed field in Hunt DTO
- Delete protection for live hunts
- Zero-complexity rollback support

**What we're NOT building (YAGNI):**
- activePlayers tracking
- Real-time updates
- Scheduled releases
- Release history audit log

**Estimated time:** 3-4 hours

**Risk level:** Low (follows existing patterns, no breaking changes)

**Ready to implement:** YES ✅

---

**Next steps:** Start with Phase 1 (database & mapper updates)
