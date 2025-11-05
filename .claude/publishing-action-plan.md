# Publishing Workflow - Implementation Action Plan

**Date:** 2025-11-04
**Status:** Ready for Implementation
**Estimated Time:** 4-5 hours
**Prerequisites:** All 69 tests passing, Hunt versioning complete

---

## 📋 Pre-Implementation Checklist

Before starting, verify:

- [ ] MongoDB replica set configured (already done in tests)
- [ ] All existing tests passing (69/69)
- [ ] Hunt versioning system complete (Phase 1 & 2)
- [ ] Read `publishing-implementation-analysis.md` (understand decisions)
- [ ] Working directory: `/Users/catalinleca/leca/HuntHub/apps/backend/api`

---

## 🎯 Implementation Phases

**Total: 7 phases, ~4-5 hours**

```
Phase 1: Project Structure (15 min)
Phase 2: StepMapper Enhancement (15 min)
Phase 3: Helper Functions (60 min)
Phase 4: Publishing Service (45 min)
Phase 5: Controller & Routes (30 min)
Phase 6: Error Handling (15 min)
Phase 7: Integration Tests (90 min)
```

---

## Phase 1: Create Project Structure (15 min)

### Step 1.1: Create Features Directory

**Command:**
```bash
cd /Users/catalinleca/leca/HuntHub/apps/backend/api
mkdir -p src/features/publishing/helpers
```

**Verify:**
```bash
ls -la src/features/publishing/
# Should show: helpers/
```

### Step 1.2: Create Type Definitions

**File:** `src/features/publishing/types.ts`

```typescript
/**
 * Publishing feature types
 */

export interface PublishResult {
  success: boolean;
  publishedVersion: number;
  newDraftVersion: number;
}

export interface CloneStepsOptions {
  huntId: number;
  sourceVersion: number;
  targetVersion: number;
}
```

**Checklist:**
- [ ] Directory created
- [ ] types.ts created
- [ ] Types compile without errors

---

## Phase 2: Enhance StepMapper (15 min)

### Step 2.1: Add Clone Method to StepMapper

**File:** `src/shared/mappers/step.mapper.ts`

**Location:** After `fromDocuments()` method (line 69)

**Code to Add:**
```typescript
  /**
   * Clone step document for new version
   * Preserves stepId but updates huntVersion
   * Used during publishing workflow
   *
   * @param sourceDoc - Original step document to clone
   * @param targetVersion - New version number
   * @returns Partial IStep ready for Model.create()
   */
  static toCloneDocument(
    sourceDoc: HydratedDocument<IStep>,
    targetVersion: number,
  ): Partial<IStep> {
    return {
      stepId: sourceDoc.stepId, // ← SAME stepId across versions
      huntId: sourceDoc.huntId,
      huntVersion: targetVersion, // ← NEW version
      type: sourceDoc.type,
      challenge: sourceDoc.challenge, // Mongoose handles deep copy
      hint: sourceDoc.hint,
      requiredLocation: sourceDoc.requiredLocation,
      timeLimit: sourceDoc.timeLimit,
      maxAttempts: sourceDoc.maxAttempts,
      metadata: sourceDoc.metadata ? { ...sourceDoc.metadata } : {},
    };
  }
```

**Checklist:**
- [ ] Method added to StepMapper
- [ ] Imports correct (HydratedDocument, IStep)
- [ ] TypeScript compiles
- [ ] Method appears in StepMapper exports

**Verify:**
```bash
npm run type-check
# Should have no errors in step.mapper.ts
```

---

## Phase 3: Implement Helper Functions (60 min)

### Step 3.1: Version Validator Helper (20 min)

**File:** `src/features/publishing/helpers/version-validator.helper.ts`

```typescript
import { ClientSession } from 'mongoose';
import HuntVersionModel from '@/database/models/HuntVersion';
import StepModel from '@/database/models/Step';
import { ValidationError } from '@/shared/errors';

/**
 * VersionValidatorHelper - Business rule validation for publishing
 *
 * Validates that a hunt version can be published:
 * - Version exists and is draft (not already published)
 * - Hunt has at least one step
 * - stepOrder is not empty
 */
export class VersionValidatorHelper {
  /**
   * Validate that a hunt version can be published
   *
   * @param huntId - Hunt ID
   * @param version - Version number to validate
   * @param session - MongoDB session for transaction
   * @throws ValidationError if validation fails
   */
  static async validateCanPublish(
    huntId: number,
    version: number,
    session: ClientSession,
  ): Promise<void> {
    // 1. Check version exists and is draft
    const versionDoc = await HuntVersionModel.findOne({
      huntId,
      version,
      isPublished: false, // Must be draft
    }).session(session);

    if (!versionDoc) {
      throw new ValidationError(
        'Cannot publish: Version not found or already published',
        [],
      );
    }

    // 2. Check hunt has steps
    const hasSteps = await StepModel.hasSteps(huntId, version);
    if (!hasSteps) {
      throw new ValidationError('Cannot publish hunt without steps', []);
    }

    // 3. Check stepOrder is not empty
    if (versionDoc.stepOrder.length === 0) {
      throw new ValidationError(
        'Cannot publish hunt with empty step order. Please add and order your steps.',
        [],
      );
    }
  }
}
```

**Checklist:**
- [ ] File created
- [ ] Imports correct
- [ ] Method signature matches plan
- [ ] All validations implemented
- [ ] Clear error messages
- [ ] TypeScript compiles

**Test Manually (Optional):**
```typescript
// In a test file, try:
await VersionValidatorHelper.validateCanPublish(1, 1, session);
```

---

### Step 3.2: Step Cloner Helper (20 min)

**File:** `src/features/publishing/helpers/step-cloner.helper.ts`

```typescript
import { ClientSession } from 'mongoose';
import StepModel from '@/database/models/Step';
import { StepMapper } from '@/shared/mappers';

/**
 * StepClonerHelper - Handles step cloning during publishing
 *
 * Clones all steps from source version to target version.
 * Preserves stepId but updates huntVersion.
 */
export class StepClonerHelper {
  /**
   * Clone all steps from source version to target version
   *
   * @param huntId - Hunt ID
   * @param sourceVersion - Version to clone from
   * @param targetVersion - Version to clone to
   * @param session - MongoDB session for transaction
   */
  static async cloneSteps(
    huntId: number,
    sourceVersion: number,
    targetVersion: number,
    session: ClientSession,
  ): Promise<void> {
    // 1. Fetch all steps from source version
    const sourceSteps = await StepModel.findByHuntVersion(huntId, sourceVersion);

    // 2. If no steps, nothing to clone (but validation should catch this)
    if (sourceSteps.length === 0) {
      return;
    }

    // 3. Map steps to cloned documents using StepMapper
    const clonedStepsData = sourceSteps.map((step) =>
      StepMapper.toCloneDocument(step, targetVersion),
    );

    // 4. Bulk insert cloned steps
    await StepModel.insertMany(clonedStepsData, { session });
  }
}
```

**Checklist:**
- [ ] File created
- [ ] Imports correct
- [ ] Uses StepMapper.toCloneDocument()
- [ ] Handles empty step array
- [ ] Uses insertMany for efficiency
- [ ] Session passed to insertMany
- [ ] TypeScript compiles

---

### Step 3.3: Version Publisher Helper (20 min)

**File:** `src/features/publishing/helpers/version-publisher.helper.ts`

```typescript
import { ClientSession, HydratedDocument, Types } from 'mongoose';
import HuntModel from '@/database/models/Hunt';
import HuntVersionModel from '@/database/models/HuntVersion';
import { IHunt } from '@/database/types/Hunt';
import { ConflictError } from '@/shared/errors';

/**
 * VersionPublisherHelper - Handles state transitions during publishing
 *
 * Responsible for:
 * - Marking version as published (isPublished flag + metadata)
 * - Updating Hunt pointers (liveVersion, latestVersion) with optimistic locking
 *
 * IMPORTANT: Uses DUAL-LOCK strategy for defense in depth:
 * - PRIMARY LOCK: updatedAt timestamp (catches concurrent edits)
 * - BACKUP LOCK: latestVersion integer (catches edge cases)
 */
export class VersionPublisherHelper {
  /**
   * Mark a HuntVersion as published with optimistic locking
   *
   * Sets isPublished=true, publishedAt, publishedBy
   *
   * LOCK: Uses updatedAt for optimistic concurrency control
   * - Protects against Publish vs Publish conflicts
   * - Protects against Edit vs Publish conflicts (updatedAt changes on edit)
   *
   * @param huntId - Hunt ID
   * @param version - Version to mark published
   * @param userId - User performing publish
   * @param expectedUpdatedAt - Expected updatedAt for optimistic lock
   * @param session - MongoDB session for transaction
   * @throws ConflictError if updatedAt doesn't match (concurrent modification)
   */
  static async markVersionPublished(
    huntId: number,
    version: number,
    userId: string,
    expectedUpdatedAt: Date,
    session: ClientSession,
  ): Promise<void> {
    // ┌──────────────────────────────────────────────────────────────┐
    // │ APPROACH 2: Publish (DUAL LOCK - Defense in Depth)          │
    // ├──────────────────────────────────────────────────────────────┤
    // │ LOCK 1 (Primary): updatedAt timestamp                       │
    // │ LOCK 2 (Backup): latestVersion integer (in updateHuntPointers) │
    // └──────────────────────────────────────────────────────────────┘
    const result = await HuntVersionModel.updateOne(
      {
        huntId,
        version,
        updatedAt: expectedUpdatedAt, // ← PRIMARY LOCK: Optimistic concurrency
        isPublished: false, // ← Validation (not a lock)
      },
      {
        isPublished: true,
        publishedAt: new Date(),
        publishedBy: new Types.ObjectId(userId),
      },
      { session },
    );

    if (result.matchedCount === 0) {
      throw new ConflictError(
        'Hunt version was modified during publishing. This can happen if:\n' +
          '- Another publish request is in progress\n' +
          '- Hunt was edited by another user\n' +
          '- Version was already published\n' +
          'Please refresh and try again.',
      );
    }
  }

  /**
   * Update Hunt version pointers with optimistic locking
   *
   * Updates liveVersion and latestVersion atomically.
   * Uses optimistic lock on latestVersion to prevent race conditions.
   *
   * LOCK: Uses latestVersion for optimistic concurrency control (BACKUP LOCK)
   * - This is the SECOND lock in our dual-lock strategy
   * - Catches edge cases where updatedAt might fail:
   *   * Database replication lag
   *   * Clock skew / time-based bugs
   *   * Mongoose bugs (hook doesn't fire)
   *   * Manual database modifications
   *
   * @param huntId - Hunt ID
   * @param currentVersion - Expected current latestVersion (for lock)
   * @param newVersion - New latestVersion to set
   * @param session - MongoDB session for transaction
   * @returns Updated Hunt document
   * @throws ConflictError if optimistic lock fails (concurrent modification)
   */
  static async updateHuntPointers(
    huntId: number,
    currentVersion: number,
    newVersion: number,
    session: ClientSession,
  ): Promise<HydratedDocument<IHunt>> {
    // ┌──────────────────────────────────────────────────────────────┐
    // │ BACKUP LOCK: latestVersion integer                          │
    // │ - Catches concurrent publishes if updatedAt fails            │
    // │ - Integer comparison is always reliable                     │
    // │ - Defense in depth: "belt and suspenders"                   │
    // └──────────────────────────────────────────────────────────────┘
    const updatedHunt = await HuntModel.findOneAndUpdate(
      {
        huntId,
        latestVersion: currentVersion, // ← BACKUP LOCK: Integer check
      },
      {
        liveVersion: currentVersion, // Published version becomes live
        latestVersion: newVersion, // New draft version
      },
      { new: true, session },
    ).exec();

    if (!updatedHunt) {
      throw new ConflictError(
        'Hunt was modified during publishing. This can happen if:\n' +
          '- Another publish request is in progress\n' +
          '- Hunt was edited by another user\n' +
          'Please refresh and try again.',
      );
    }

    return updatedHunt;
  }
}
```

**Checklist:**
- [ ] File created
- [ ] Both methods implemented
- [ ] Optimistic lock in updateHuntPointers
- [ ] ConflictError with clear message
- [ ] publishedBy uses ObjectId
- [ ] TypeScript compiles

---

## Phase 4: Implement Publishing Service (45 min)

### Step 4.1: Create Publishing Service

**File:** `src/features/publishing/publishing.service.ts`

```typescript
import { injectable, inject } from 'inversify';
import mongoose, { ClientSession, HydratedDocument } from 'mongoose';
import { Hunt } from '@hunthub/shared';
import HuntVersionModel from '@/database/models/HuntVersion';
import { IHunt } from '@/database/types/Hunt';
import { IHuntVersion } from '@/database/types/HuntVersion';
import { HuntMapper } from '@/shared/mappers';
import { IHuntService } from '@/modules/hunts/hunt.service';
import { TYPES } from '@/config/types';
import { VersionValidatorHelper } from './helpers/version-validator.helper';
import { StepClonerHelper } from './helpers/step-cloner.helper';
import { VersionPublisherHelper } from './helpers/version-publisher.helper';

export interface IPublishingService {
  publishHunt(huntId: number, userId: string): Promise<Hunt>;
}

/**
 * PublishingService - Orchestrates hunt publishing workflow
 *
 * Responsibilities:
 * - Coordinates publishing across Hunt, HuntVersion, and Step models
 * - Ensures atomic operations via transactions
 * - Handles concurrent publishing attempts with optimistic locking
 *
 * Publishing Workflow:
 * 1. Verify ownership (fail fast)
 * 2. Start transaction
 * 3. PHASE 1 (PREPARE): Validate, clone steps, create new draft
 * 4. PHASE 2 (COMMIT): Mark published, update pointers
 * 5. Return merged DTO
 */
@injectable()
export class PublishingService implements IPublishingService {
  constructor(
    @inject(TYPES.HuntService) private huntService: IHuntService,
  ) {}

  /**
   * Publish a hunt
   *
   * Creates a published snapshot of the current draft version and
   * prepares a new draft version for future edits.
   *
   * @param huntId - Hunt ID to publish
   * @param userId - User requesting publish (must be owner)
   * @returns Hunt DTO (merged Hunt + new draft HuntVersion)
   * @throws NotFoundError if hunt doesn't exist
   * @throws ForbiddenError if user doesn't own hunt
   * @throws ValidationError if business rules fail (no steps, already published)
   * @throws ConflictError if concurrent modification detected
   */
  async publishHunt(huntId: number, userId: string): Promise<Hunt> {
    // ────────────────────────────────────────────────────────────────
    // FAIL FAST: Verify ownership before starting transaction
    // ────────────────────────────────────────────────────────────────
    const huntDoc = await this.huntService.verifyOwnership(huntId, userId);

    // ────────────────────────────────────────────────────────────────
    // START TRANSACTION: All operations must be atomic
    // ────────────────────────────────────────────────────────────────
    const session = await mongoose.startSession();
    let result: Hunt;

    try {
      await session.withTransaction(async () => {
        const currentVersion = huntDoc.latestVersion;
        const newVersion = currentVersion + 1;

        // ────────────────────────────────────────────────────────────
        // PHASE 1: PREPARE (can fail safely, no state changed yet)
        // ────────────────────────────────────────────────────────────

        // Step 1: Validate business rules
        await VersionValidatorHelper.validateCanPublish(
          huntId,
          currentVersion,
          session,
        );

        // Step 2: Read current version document (used for cloning + locking)
        // ┌──────────────────────────────────────────────────────────┐
        // │ DUAL-LOCK SETUP: Capture updatedAt for PRIMARY LOCK      │
        // │ - Read once, use for both cloning and locking            │
        // │ - Ensures we only publish if version wasn't modified     │
        // └──────────────────────────────────────────────────────────┘
        const currentVersionDoc = await HuntVersionModel.findOne({
          huntId,
          version: currentVersion,
        }).session(session);

        if (!currentVersionDoc) {
          throw new Error('Current version not found');
        }

        const versionUpdatedAt = currentVersionDoc.updatedAt;

        // Step 3: Clone steps to new version (heavy operation first)
        await StepClonerHelper.cloneSteps(
          huntId,
          currentVersion,
          newVersion,
          session,
        );

        // Step 4: Create new draft HuntVersion (reuses currentVersionDoc)
        const newVersionDoc = await this.createNewDraftVersion(
          currentVersionDoc, // Pass doc instead of re-reading
          huntDoc.huntId,
          newVersion,
          session,
        );

        // ────────────────────────────────────────────────────────────
        // PHASE 2: COMMIT (state changes, should not fail)
        // ────────────────────────────────────────────────────────────

        // Step 5: Mark old version as published (PRIMARY LOCK)
        await VersionPublisherHelper.markVersionPublished(
          huntId,
          currentVersion,
          userId,
          versionUpdatedAt, // ← PRIMARY LOCK: updatedAt timestamp
          session,
        );

        // Step 6: Update Hunt pointers with optimistic lock (BACKUP LOCK)
        const updatedHunt = await VersionPublisherHelper.updateHuntPointers(
          huntId,
          currentVersion, // ← BACKUP LOCK: latestVersion integer
          newVersion,
          session,
        );

        // Step 7: Return merged DTO
        result = HuntMapper.fromDocuments(updatedHunt, newVersionDoc);
      });
    } finally {
      // Always clean up session
      await session.endSession();
    }

    return result!;
  }

  /**
   * Create new draft HuntVersion by cloning current version
   *
   * @private
   * @param currentVersionDoc - Current HuntVersion document to clone
   * @param huntId - Hunt ID
   * @param newVersion - New draft version number
   * @param session - MongoDB session
   * @returns New HuntVersion document
   */
  private async createNewDraftVersion(
    currentVersionDoc: HydratedDocument<IHuntVersion>,
    huntId: number,
    newVersion: number,
    session: ClientSession,
  ): Promise<HydratedDocument<IHuntVersion>> {
    // Clone version data (doc already passed in, no need to re-read)
    const newVersionData: Partial<IHuntVersion> = {
      huntId, // Use parameter instead of huntDoc.huntId
      version: newVersion,
      name: currentVersionDoc.name,
      description: currentVersionDoc.description,
      startLocation: currentVersionDoc.startLocation,
      stepOrder: [...currentVersionDoc.stepOrder], // Clone array
      isPublished: false,
    };

    // Create new version
    const [createdVersion] = await HuntVersionModel.create(
      [newVersionData],
      { session },
    );

    return createdVersion;
  }
}
```

**Checklist:**
- [ ] File created
- [ ] Interface defined (IPublishingService)
- [ ] Service implements interface
- [ ] @injectable decorator
- [ ] HuntService injected
- [ ] Main publishHunt method implemented
- [ ] Two-phase approach clear
- [ ] Private helper method for version creation
- [ ] Transaction management correct
- [ ] Session cleanup in finally block
- [ ] Comprehensive JSDoc comments
- [ ] TypeScript compiles

---

### Step 4.2: Register Service in DI Container

**File:** `src/config/types.ts`

**Add to TYPES object:**
```typescript
export const TYPES = {
  // ... existing types ...
  PublishingService: Symbol.for('PublishingService'),
};
```

**File:** `src/config/inversify.ts`

**Add import:**
```typescript
import { PublishingService, IPublishingService } from '@/features/publishing/publishing.service';
```

**Add binding (after other service bindings):**
```typescript
// Publishing feature
container.bind<IPublishingService>(TYPES.PublishingService).to(PublishingService);
```

**Checklist:**
- [ ] Symbol added to TYPES
- [ ] Import added to inversify.ts
- [ ] Binding registered
- [ ] Container compiles

---

### 📝 Note: Hunt Update Protection (Optional Enhancement)

**Context:** We've implemented dual-lock for publishing (updatedAt + latestVersion). For hunt edits, we should also add single-lock protection.

**Current State:**
- `HuntService.updateHunt()` updates HuntVersion without optimistic locking
- Vulnerable to Edit vs Edit conflicts (two users editing simultaneously)

**Recommended Enhancement (separate from publishing implementation):**

```typescript
// In HuntService.updateHunt()
async updateHunt(
  huntId: number,
  updates: HuntUpdate,
  userId: string,
  expectedUpdatedAt?: Date, // ← Optional lock parameter
): Promise<Hunt> {
  const huntDoc = await this.verifyOwnership(huntId, userId);

  const session = await mongoose.startSession();
  let result: Hunt;

  await session.withTransaction(async () => {
    // Build query with optional lock
    const query: any = {
      huntId,
      version: huntDoc.latestVersion,
      isPublished: false,
    };

    if (expectedUpdatedAt) {
      // ┌──────────────────────────────────────────────────────────┐
      // │ APPROACH 1: Edit (SINGLE LOCK on updatedAt)             │
      // │ - Protects Edit vs Edit conflicts                       │
      // │ - isPublished: false blocks Edit vs Publish conflicts   │
      // └──────────────────────────────────────────────────────────┘
      query.updatedAt = expectedUpdatedAt;
    }

    const updatedVersion = await HuntVersionModel.findOneAndUpdate(
      query,
      { ...updates },
      { new: true, session },
    ).exec();

    if (!updatedVersion) {
      if (expectedUpdatedAt) {
        throw new ConflictError(
          'Hunt was modified by another user. Please refresh and try again.',
        );
      }
      throw new NotFoundError('Hunt version not found');
    }

    result = HuntMapper.fromDocuments(huntDoc, updatedVersion);
  });

  await session.endSession();
  return result!;
}
```

**Why Optional?**
- Publishing is high-risk (permanent, can't be undone) → MUST have lock
- Editing is low-risk (reversible, can fix mistakes) → Lock is NICE to have

**When to Implement:**
- After publishing works (Phase 3 complete)
- When building frontend editor (user needs to pass updatedAt)
- Not required for MVP, but production-recommended

**Frontend Integration:**
```typescript
// Frontend sends expectedUpdatedAt when updating
const response = await api.put(`/hunts/${id}`, {
  name: 'New Name',
  expectedUpdatedAt: currentHunt.updatedAt, // ← Lock parameter
});

// If 409 Conflict, show: "Hunt was updated by another user. Refresh to get latest."
```

**See:** `publishing-implementation-analysis.md` for detailed explanation of APPROACH 1 (Edit).

---

## Phase 5: Controller & Routes (30 min)

### Step 5.1: Create Publishing Controller

**File:** `src/features/publishing/publishing.controller.ts`

```typescript
import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { IPublishingService } from './publishing.service';
import { TYPES } from '@/config/types';
import { ValidationError } from '@/shared/errors';

export interface IPublishingController {
  publishHunt(req: Request, res: Response): Promise<Response>;
}

/**
 * PublishingController - HTTP handlers for publishing workflow
 */
@injectable()
export class PublishingController implements IPublishingController {
  constructor(
    @inject(TYPES.PublishingService)
    private publishingService: IPublishingService,
  ) {}

  /**
   * POST /api/hunts/:id/publish
   *
   * Publish a hunt (mark current draft as published, create new draft)
   *
   * @param req - Express request with huntId in params
   * @param res - Express response
   * @returns 200 with published hunt DTO
   */
  async publishHunt(req: Request, res: Response): Promise<Response> {
    const huntId = parseInt(req.params.id, 10);

    if (isNaN(huntId)) {
      throw new ValidationError('Invalid hunt ID', []);
    }

    const publishedHunt = await this.publishingService.publishHunt(
      huntId,
      req.user.id,
    );

    return res.status(200).json(publishedHunt);
  }
}
```

**Checklist:**
- [ ] File created
- [ ] Interface defined
- [ ] Controller implements interface
- [ ] @injectable decorator
- [ ] PublishingService injected
- [ ] huntId parsed and validated
- [ ] Returns 200 on success
- [ ] TypeScript compiles

---

### Step 5.2: Register Controller in DI

**File:** `src/config/types.ts`

**Add:**
```typescript
PublishingController: Symbol.for('PublishingController'),
```

**File:** `src/config/inversify.ts`

**Add import:**
```typescript
import {
  PublishingController,
  IPublishingController,
} from '@/features/publishing/publishing.controller';
```

**Add binding:**
```typescript
container.bind<IPublishingController>(TYPES.PublishingController).to(PublishingController);
```

**Checklist:**
- [ ] Symbol added
- [ ] Import added
- [ ] Binding registered

---

### Step 5.3: Create Publishing Routes

**File:** `src/features/publishing/publishing.routes.ts`

```typescript
import { Router } from 'express';
import { IPublishingController } from './publishing.controller';
import { getContainer } from '@/config/inversify';
import { TYPES } from '@/config/types';
import { authMiddleware } from '@/middlewares/auth.middleware';
import { asyncHandler } from '@/utils/asyncHandler';

const router = Router();
const container = getContainer();
const controller = container.get<IPublishingController>(
  TYPES.PublishingController,
);

/**
 * POST /api/hunts/:id/publish
 * Publish a hunt (create published snapshot + new draft)
 *
 * Auth: Required (must be hunt owner)
 * Body: None
 * Params: id (huntId)
 * Returns: 200 with Hunt DTO (merged Hunt + new draft HuntVersion)
 */
router.post(
  '/:id/publish',
  authMiddleware,
  asyncHandler(controller.publishHunt.bind(controller)),
);

export default router;
```

**Checklist:**
- [ ] File created
- [ ] Controller retrieved from DI
- [ ] authMiddleware applied
- [ ] asyncHandler wraps controller
- [ ] Route matches spec (:id/publish)
- [ ] TypeScript compiles

---

### Step 5.4: Mount Publishing Routes

**File:** `src/routes/index.ts`

**Add import:**
```typescript
import publishingRoutes from '@/features/publishing/publishing.routes';
```

**Mount route (add after hunt routes):**
```typescript
app.use('/api/hunts', publishingRoutes);
```

**Note:** This mounts `/api/hunts/:id/publish` correctly.

**Checklist:**
- [ ] Import added
- [ ] Route mounted
- [ ] Server starts without errors

---

## Phase 6: Error Handling (15 min)

### Step 6.1: Add ConflictError Class

**File:** `src/shared/errors/ConflictError.ts`

```typescript
import { AppError } from './AppError';

/**
 * ConflictError - 409 Conflict
 *
 * Used when request cannot be processed due to conflicting state.
 * Common scenarios:
 * - Optimistic locking failure (concurrent modification)
 * - Resource exists but in wrong state
 *
 * Unlike 400 (client error), 409 indicates the request was valid
 * but conflicts with current resource state. Retrying may succeed.
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict detected') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}
```

**Checklist:**
- [ ] File created
- [ ] Extends AppError
- [ ] Status code 409
- [ ] Clear JSDoc

---

### Step 6.2: Export ConflictError

**File:** `src/shared/errors/index.ts`

**Add:**
```typescript
export { ConflictError } from './ConflictError';
```

**Checklist:**
- [ ] Export added
- [ ] Import works: `import { ConflictError } from '@/shared/errors'`

---

### Step 6.3: Verify Error Middleware Handles 409

**File:** `src/middlewares/error.middleware.ts`

**Check that error middleware extracts statusCode:**
```typescript
const statusCode = err.statusCode || 500;
return res.status(statusCode).json({ ... });
```

**Checklist:**
- [ ] Error middleware uses err.statusCode
- [ ] 409 will be returned correctly

---

## Phase 7: Integration Tests (90 min)

### Step 7.1: Create Test File

**File:** `tests/integration/publishing/publishHunt.test.ts`

**Create directory:**
```bash
mkdir -p tests/integration/publishing
```

### Step 7.2: Basic Test Structure

```typescript
import request from 'supertest';
import { Express } from 'express';
import mongoose from 'mongoose';
import { createTestApp } from '../../setup/testServer';
import { createTestUser } from '../../setup/factories/user.factory';
import {
  createTestHunt,
  createTestHuntWithVersion,
} from '../../setup/factories/hunt.factory';
import { createTestStep } from '../../setup/factories/step.factory';
import HuntModel from '@/database/models/Hunt';
import HuntVersionModel from '@/database/models/HuntVersion';
import StepModel from '@/database/models/Step';
import { IUser } from '@/database/types/User';
import { HuntStatus } from '@hunthub/shared';

describe('POST /api/hunts/:id/publish - Publish Hunt', () => {
  let app: Express;
  let testUser: IUser;
  let authToken: string;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    testUser = await createTestUser();
    authToken = `Bearer test-token-${testUser.firebaseUid}`;
  });

  describe('Success Cases', () => {
    it('should publish v1 and create v2 draft', async () => {
      // 1. Create hunt with 3 steps
      const hunt = await createTestHunt(testUser.id);
      const step1 = await createTestStep(hunt.huntId, 1);
      const step2 = await createTestStep(hunt.huntId, 1);
      const step3 = await createTestStep(hunt.huntId, 1);

      // Update stepOrder
      await HuntVersionModel.updateOne(
        { huntId: hunt.huntId, version: 1 },
        { stepOrder: [step1.stepId, step2.stepId, step3.stepId] },
      );

      // 2. Publish
      const response = await request(app)
        .post(`/api/hunts/${hunt.huntId}/publish`)
        .set('Authorization', authToken)
        .expect(200);

      // 3. Verify response
      expect(response.body).toMatchObject({
        huntId: hunt.huntId,
        status: HuntStatus.Draft, // Returns new draft (v2)
      });

      // 4. Verify v1 is published
      const v1 = await HuntVersionModel.findOne({
        huntId: hunt.huntId,
        version: 1,
      });
      expect(v1?.isPublished).toBe(true);
      expect(v1?.publishedAt).toBeDefined();
      expect(v1?.publishedBy).toBeDefined();

      // 5. Verify v2 created (draft)
      const v2 = await HuntVersionModel.findOne({
        huntId: hunt.huntId,
        version: 2,
      });
      expect(v2).toBeDefined();
      expect(v2?.isPublished).toBe(false);
      expect(v2?.stepOrder).toEqual([step1.stepId, step2.stepId, step3.stepId]);

      // 6. Verify Hunt pointers updated
      const huntDoc = await HuntModel.findOne({ huntId: hunt.huntId });
      expect(huntDoc?.liveVersion).toBe(1);
      expect(huntDoc?.latestVersion).toBe(2);

      // 7. Verify steps cloned to v2
      const v2Steps = await StepModel.find({
        huntId: hunt.huntId,
        huntVersion: 2,
      });
      expect(v2Steps).toHaveLength(3);
      expect(v2Steps.map((s) => s.stepId).sort()).toEqual(
        [step1.stepId, step2.stepId, step3.stepId].sort(),
      );
    });

    it('should preserve step data when cloning', async () => {
      // Create hunt with complex step
      const hunt = await createTestHunt(testUser.id);
      const step = await createTestStep(hunt.huntId, 1, {
        type: 'quiz',
        challenge: {
          quiz: {
            title: 'Test Question',
            type: 'choice',
            target: { id: '1', text: 'Correct' },
            distractors: [{ id: '2', text: 'Wrong' }],
          },
        },
        hint: 'Test hint',
        timeLimit: 300,
        maxAttempts: 3,
      });

      await HuntVersionModel.updateOne(
        { huntId: hunt.huntId, version: 1 },
        { stepOrder: [step.stepId] },
      );

      // Publish
      await request(app)
        .post(`/api/hunts/${hunt.huntId}/publish`)
        .set('Authorization', authToken)
        .expect(200);

      // Verify v2 step has identical data
      const v2Step = await StepModel.findOne({
        huntId: hunt.huntId,
        huntVersion: 2,
        stepId: step.stepId,
      });

      expect(v2Step).toBeDefined();
      expect(v2Step?.challenge).toEqual(step.challenge);
      expect(v2Step?.hint).toBe(step.hint);
      expect(v2Step?.timeLimit).toBe(step.timeLimit);
      expect(v2Step?.maxAttempts).toBe(step.maxAttempts);
    });
  });

  describe('Error Cases', () => {
    it('should return 404 when hunt does not exist', async () => {
      await request(app)
        .post('/api/hunts/99999/publish')
        .set('Authorization', authToken)
        .expect(404);
    });

    it('should return 403 when user is not owner', async () => {
      const hunt = await createTestHunt(testUser.id);
      const otherUser = await createTestUser();
      const otherToken = `Bearer test-token-${otherUser.firebaseUid}`;

      await request(app)
        .post(`/api/hunts/${hunt.huntId}/publish`)
        .set('Authorization', otherToken)
        .expect(403);
    });

    it('should return 400 when hunt has no steps', async () => {
      const hunt = await createTestHunt(testUser.id);

      const response = await request(app)
        .post(`/api/hunts/${hunt.huntId}/publish`)
        .set('Authorization', authToken)
        .expect(400);

      expect(response.body.message).toContain('without steps');
    });

    it('should return 400 when stepOrder is empty', async () => {
      const hunt = await createTestHunt(testUser.id);
      await createTestStep(hunt.huntId, 1); // Step exists but not in stepOrder

      const response = await request(app)
        .post(`/api/hunts/${hunt.huntId}/publish`)
        .set('Authorization', authToken)
        .expect(400);

      expect(response.body.message).toContain('empty step order');
    });

    it('should return 400 when version already published', async () => {
      const hunt = await createTestHunt(testUser.id);
      const step = await createTestStep(hunt.huntId, 1);

      await HuntVersionModel.updateOne(
        { huntId: hunt.huntId, version: 1 },
        { stepOrder: [step.stepId] },
      );

      // Publish once
      await request(app)
        .post(`/api/hunts/${hunt.huntId}/publish`)
        .set('Authorization', authToken)
        .expect(200);

      // Try to publish v1 again (should fail)
      await HuntVersionModel.updateOne(
        { huntId: hunt.huntId, version: 1 },
        { isPublished: false }, // Reset for test
      );

      await HuntModel.updateOne(
        { huntId: hunt.huntId },
        { latestVersion: 1 }, // Reset pointer
      );

      const response = await request(app)
        .post(`/api/hunts/${hunt.huntId}/publish`)
        .set('Authorization', authToken)
        .expect(400);

      expect(response.body.message).toContain('already published');
    });

    it('should handle concurrent publish attempts', async () => {
      const hunt = await createTestHunt(testUser.id);
      const step = await createTestStep(hunt.huntId, 1);

      await HuntVersionModel.updateOne(
        { huntId: hunt.huntId, version: 1 },
        { stepOrder: [step.stepId] },
      );

      // Fire two publish requests simultaneously
      const [result1, result2] = await Promise.allSettled([
        request(app)
          .post(`/api/hunts/${hunt.huntId}/publish`)
          .set('Authorization', authToken),
        request(app)
          .post(`/api/hunts/${hunt.huntId}/publish`)
          .set('Authorization', authToken),
      ]);

      // One should succeed (200), one should fail (409)
      const results = [
        result1.status === 'fulfilled' ? result1.value.status : null,
        result2.status === 'fulfilled' ? result2.value.status : null,
      ];

      expect(results).toContain(200); // One succeeds
      expect(results).toContain(409); // One conflicts

      // Verify only one v2 created
      const v2Count = await HuntVersionModel.countDocuments({
        huntId: hunt.huntId,
        version: 2,
      });
      expect(v2Count).toBe(1);
    });
  });

  describe('Full Workflow', () => {
    it('should support full publish-edit-publish cycle', async () => {
      // 1. Create hunt + 3 steps
      const hunt = await createTestHunt(testUser.id);
      const step1 = await createTestStep(hunt.huntId, 1);
      const step2 = await createTestStep(hunt.huntId, 1);
      const step3 = await createTestStep(hunt.huntId, 1);

      await HuntVersionModel.updateOne(
        { huntId: hunt.huntId, version: 1 },
        { stepOrder: [step1.stepId, step2.stepId, step3.stepId] },
      );

      // 2. Publish v1
      await request(app)
        .post(`/api/hunts/${hunt.huntId}/publish`)
        .set('Authorization', authToken)
        .expect(200);

      // 3. Edit v2 (change name)
      await request(app)
        .put(`/api/hunts/${hunt.huntId}`)
        .set('Authorization', authToken)
        .send({ name: 'Updated Hunt Name' })
        .expect(200);

      // 4. Add new step to v2
      const step4 = await createTestStep(hunt.huntId, 2);
      await HuntVersionModel.updateOne(
        { huntId: hunt.huntId, version: 2 },
        { $push: { stepOrder: step4.stepId } },
      );

      // 5. Publish v2
      await request(app)
        .post(`/api/hunts/${hunt.huntId}/publish`)
        .set('Authorization', authToken)
        .expect(200);

      // 6. Verify v1 unchanged (3 steps)
      const v1Steps = await StepModel.countDocuments({
        huntId: hunt.huntId,
        huntVersion: 1,
      });
      expect(v1Steps).toBe(3);

      // 7. Verify v2 has 4 steps
      const v2Steps = await StepModel.countDocuments({
        huntId: hunt.huntId,
        huntVersion: 2,
      });
      expect(v2Steps).toBe(4);

      // 8. Verify v3 created as new draft
      const v3 = await HuntVersionModel.findOne({
        huntId: hunt.huntId,
        version: 3,
      });
      expect(v3).toBeDefined();
      expect(v3?.isPublished).toBe(false);

      // 9. Verify Hunt pointers
      const huntDoc = await HuntModel.findOne({ huntId: hunt.huntId });
      expect(huntDoc?.liveVersion).toBe(2);
      expect(huntDoc?.latestVersion).toBe(3);
    });
  });
});
```

**Checklist:**
- [ ] Test file created
- [ ] All test cases implemented
- [ ] Tests use proper setup/teardown
- [ ] Mocking correct (auth, database)
- [ ] Assertions comprehensive
- [ ] Race condition test included

---

### Step 7.3: Run Tests

**Command:**
```bash
npm test -- publishHunt.test.ts
```

**Expected:**
- All tests pass
- No transaction errors
- Race condition test works

**Checklist:**
- [ ] All tests pass
- [ ] No flaky tests
- [ ] Coverage adequate

---

## 🎯 Final Verification Checklist

### Code Quality

- [ ] All TypeScript compiles without errors
- [ ] ESLint passes (no warnings)
- [ ] All imports resolve correctly
- [ ] No console.log statements left in code

### Functionality

- [ ] Publish endpoint works (manual test with Postman/curl)
- [ ] Validation errors return correct status codes
- [ ] Concurrent publishing blocked by optimistic lock
- [ ] Steps cloned correctly
- [ ] Hunt pointers updated atomically

### Testing

- [ ] All new tests pass
- [ ] All existing tests still pass (69 + new tests)
- [ ] Race condition test works reliably
- [ ] Test coverage adequate (helpers, service, controller)

### Documentation

- [ ] JSDoc comments complete
- [ ] Error messages clear and helpful
- [ ] README updated (if needed)
- [ ] FIXES_REQUIRED.md updated (Phase 3 complete)

---

## 📊 Post-Implementation

### Update Documentation

**File:** `apps/backend/api/FIXES_REQUIRED.md`

Mark Phase 3 complete:
```markdown
### ✅ Phase 3 Complete (2025-11-04)
- ✅ publishHunt() method implemented
- ✅ Optimistic locking on latestVersion
- ✅ Two-phase operation order
- ✅ Helper functions for readability
- ✅ All tests passing (XX/XX including publishing tests)
```

### Commit Message

```
feat: Implement hunt publishing workflow (Phase 3)

WHAT:
- Add publishing feature with orchestration service
- Implement optimistic locking to prevent race conditions
- Clone steps across versions atomically

WHERE:
- features/publishing/ - New feature layer
- shared/mappers/step.mapper.ts - Add toCloneDocument()
- shared/errors/ - Add ConflictError (409)

HOW:
- Two-phase approach: prepare first, commit last
- Helper functions: validator, cloner, publisher
- Transaction-safe with MongoDB sessions
- Optimistic lock on Hunt.latestVersion

TESTS:
- XX integration tests covering success, errors, race conditions
- Full publish-edit-publish cycle tested
- Concurrent publishing blocked correctly

CLOSES: Phase 3 of versioning implementation
```

---

## 🚀 Next Steps (Phase 4)

**After this is complete:**
1. ✅ Publishing workflow working
2. 🔜 Add more publishing tests (edge cases)
3. 🔜 Frontend integration (publish button)
4. 🔜 QR code generation for published hunts
5. 🔜 Player API (play published hunts)

**See:** `ROADMAP.md` for complete timeline

---

**Action Plan Status:** ✅ READY FOR IMPLEMENTATION
**Estimated Time:** 4-5 hours
**Dependencies:** All Phase 1 & 2 complete (verified)
