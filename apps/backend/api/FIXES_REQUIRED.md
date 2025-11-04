# Versioning System - Fixes Required

**Date:** 2025-01-04
**Status:** Action Plan Ready

## Summary of Findings

### ✅ What Works Well
- Architecture is SOLID (Hunt + HuntVersion separation)
- Service boundaries are clean
- Mappers handle all transformations
- Type safety is maintained

### ❌ Critical Issues Found
1. **Publishing workflow NOT implemented** (40% missing)
2. **Cascade delete incomplete** (orphans HuntVersions)
3. **huntVersion validation missing** (security issue)
4. **No transaction safety** (data integrity risk)
5. **All tests broken** (use old schema)

---

## Phase 1: Fix Tests (NOW)

### 1.1 Update huntCrud.test.ts
**Lines to fix:**
- Line 57: Remove `currentVersion: 1` assertion (doesn't exist in DTO)
- Line 90-92: Update stepOrder check to query HuntVersion instead of Hunt
- Line 249-252: Update stepOrder verification
- Line 287-296: Fix step creation to include huntVersion
- Line 323-339: Fix step creation to include huntVersion

**Test fixes:**
```typescript
// BEFORE (WRONG):
expect(response.body).toMatchObject({
  currentVersion: 1,  // ❌ Field doesn't exist
});

const updatedHunt = await HuntModel.findOne({ huntId });
expect(updatedHunt?.stepOrder).toContain(stepId);  // ❌ stepOrder on HuntVersion

// AFTER (CORRECT):
// Don't check internal fields that aren't exposed in DTO

const huntVersion = await HuntVersionModel.findOne({ huntId, version: 1 });
expect(huntVersion?.stepOrder).toContain(stepId);  // ✅ Correct
```

### 1.2 Update stepCrud.test.ts
**Lines to fix:**
- Line 78-92: Update stepOrder verification to use HuntVersion
- Line 248-253: Update stepOrder setup to use HuntVersion
- Line 262-271: Update stepOrder verification to use HuntVersion

**Test fixes:**
```typescript
// BEFORE (WRONG):
const updatedHunt = await HuntModel.findOne({ huntId });
expect(updatedHunt?.stepOrder).toContain(stepId);

await HuntModel.findOneAndUpdate(
  { huntId: testHunt.huntId },
  { $push: { stepOrder: testStep.stepId } },
);

// AFTER (CORRECT):
const huntVersion = await HuntVersionModel.findOne({ huntId, version: 1 });
expect(huntVersion?.stepOrder).toContain(stepId);

await HuntVersionModel.findOneAndUpdate(
  { huntId: testHunt.huntId, version: 1 },
  { $push: { stepOrder: testStep.stepId } },
);
```

### 1.3 Expected Results
- ✅ All existing CRUD tests pass
- ✅ Tests use correct schema (Hunt + HuntVersion)
- ✅ Tests validate proper data flow
- ⏸️ Publishing tests NOT written yet (Phase 3)

---

## Phase 2: Data Integrity Fixes (AFTER TESTS PASS)

### 2.1 Fix Cascade Delete
**File:** `hunt.service.ts:118-127`

**Current (WRONG):**
```typescript
async deleteHunt(huntId: number, userId: string): Promise<void> {
  await StepModel.deleteMany({ huntId: huntId });
  await existingHunt.deleteOne();
  // ❌ Missing: Delete HuntVersions
}
```

**Fix:**
```typescript
async deleteHunt(huntId: number, userId: string): Promise<void> {
  // Delete ALL HuntVersions for this hunt
  await HuntVersionModel.deleteMany({ huntId });

  // Delete ALL steps across all versions
  await StepModel.deleteMany({ huntId });

  // Delete Hunt master
  await existingHunt.deleteOne();
}
```

### 2.2 Add huntVersion Validation to reorderSteps
**File:** `hunt.service.ts:131-159`

**Current (WRONG):**
```typescript
const stepsCount = await StepModel.countDocuments({
  stepId: { $in: stepOrder },
  huntId: huntId,
  // ❌ Missing: huntVersion check
});
```

**Fix:**
```typescript
const stepsCount = await StepModel.countDocuments({
  stepId: { $in: stepOrder },
  huntId: huntId,
  huntVersion: huntDoc.latestVersion,  // ✅ Validate version
});
```

### 2.3 Add Transaction Safety to createHunt
**File:** `hunt.service.ts:40-51`

**Current (RISKY):**
```typescript
const createdHunt = await HuntModel.create(huntData);
const createdVersion = await HuntVersionModel.create(versionData);
// ❌ Not atomic - if second fails, first already committed
```

**Fix:**
```typescript
const session = await mongoose.startSession();
let hunt: Hunt;

await session.withTransaction(async () => {
  const [createdHunt] = await HuntModel.create([huntData], { session });
  const [createdVersion] = await HuntVersionModel.create([versionData], { session });
  hunt = HuntMapper.fromDocuments(createdHunt, createdVersion);
});

return hunt!;
```

---

## Phase 3: Implement Publishing (AFTER BREAK)

### 3.1 Implement publishHunt() Method
**File:** `hunt.service.ts`

**Requirements:**
1. Verify ownership
2. Mark current HuntVersion as published (set isPublished=true, publishedAt, publishedBy)
3. Clone ALL steps from latestVersion → latestVersion+1
4. Create new draft HuntVersion (latestVersion+1)
5. Update Hunt.liveVersion to latestVersion
6. Update Hunt.latestVersion to latestVersion+1
7. Use transaction for atomicity

**Signature:**
```typescript
async publishHunt(huntId: number, userId: string): Promise<Hunt>
```

**Algorithm:**
```
START TRANSACTION:
  1. Get Hunt master (verify ownership)
  2. Get current draft HuntVersion (latestVersion)
  3. Verify version is draft (isPublished=false)
  4. Mark version as published:
     - isPublished = true
     - publishedAt = now
     - publishedBy = userId
  5. Get all steps for latestVersion
  6. Clone all steps → latestVersion+1
  7. Create new HuntVersion (latestVersion+1, empty stepOrder, isPublished=false)
  8. Update Hunt:
     - liveVersion = latestVersion
     - latestVersion = latestVersion+1
COMMIT TRANSACTION

Return merged Hunt DTO (Hunt + new draft HuntVersion)
```

### 3.2 Add Controller Endpoint
**File:** `hunt.controller.ts`

```typescript
async publishHunt(req: Request, res: Response) {
  const huntId = parseInt(req.params.id);
  const publishedHunt = await this.huntService.publishHunt(huntId, req.user.id);
  return res.status(200).json(publishedHunt);
}
```

### 3.3 Add Route
**File:** `hunt.router.ts`

```typescript
router.post('/:id/publish',
  authMiddleware,
  asyncHandler(controller.publishHunt.bind(controller))
);
```

### 3.4 Validation Rules
```typescript
// Can't publish if:
- Hunt doesn't exist → 404
- User not owner → 403
- Already published (isPublished=true) → 400 "Version already published"
- No steps → 400 "Can't publish empty hunt"
```

---

## Phase 4: Publishing Tests (AFTER IMPLEMENTATION)

### 4.1 Basic Publishing Test
```typescript
describe('POST /api/hunts/:id/publish - Publish Hunt', () => {
  it('should publish v1 and create v2 draft', async () => {
    // 1. Create hunt with 3 steps
    // 2. Publish v1
    // 3. Verify v1 isPublished=true
    // 4. Verify v2 created (isPublished=false)
    // 5. Verify Hunt.liveVersion=1, latestVersion=2
    // 6. Verify all 3 steps cloned to v2
  });
});
```

### 4.2 Full Workflow Test
```typescript
it('should support full edit-publish-edit-publish cycle', async () => {
  // 1. Create hunt + 3 steps
  // 2. Edit hunt name
  // 3. Publish v1
  // 4. Edit hunt name again (updates v2)
  // 5. Remove 1 step from v2
  // 6. Add 1 new step to v2
  // 7. Publish v2
  // 8. Verify v1 has 3 steps (unchanged)
  // 9. Verify v2 has 3 steps (2 old + 1 new)
  // 10. Verify Hunt.liveVersion=2, latestVersion=3
});
```

### 4.3 Edge Cases
```typescript
it('should prevent publishing already-published version');
it('should prevent publishing empty hunt');
it('should prevent editing published version');
it('should allow switching live version back to v1');
it('should handle transaction rollback on clone failure');
```

---

## Implementation Order

### ✅ Phase 1: Fix Tests (NOW)
**Time:** 2-3 hours
**Priority:** CRITICAL - Nothing works without this
**Deliverable:** All existing tests pass

**Steps:**
1. Update huntCrud.test.ts (remove invalid assertions, fix stepOrder checks)
2. Update stepCrud.test.ts (fix stepOrder setup/verification)
3. Run tests, verify all pass
4. Commit: "fix: Update tests for Hunt versioning system"

### ⏸️ BREAK

### ✅ Phase 2: Data Integrity (AFTER BREAK)
**Time:** 1-2 hours
**Priority:** HIGH - Security and data safety
**Deliverable:** Cascade delete + validation fixes

**Steps:**
1. Fix cascade delete
2. Add huntVersion validation
3. Add transaction safety (optional - can defer)
4. Run tests, verify all still pass
5. Commit: "fix: Add data integrity validations and cascade delete"

### ✅ Phase 3: Implement Publishing (AFTER BREAK)
**Time:** 4-5 hours
**Priority:** HIGH - Core missing functionality
**Deliverable:** Full publishing workflow

**Steps:**
1. Implement publishHunt() method
2. Add controller endpoint
3. Add route
4. Test manually with Postman/curl
5. Commit: "feat: Implement hunt publishing workflow"

### ✅ Phase 4: Publishing Tests (AFTER IMPLEMENTATION)
**Time:** 3-4 hours
**Priority:** HIGH - Validate correctness
**Deliverable:** Comprehensive test coverage

**Steps:**
1. Write basic publishing test
2. Write full workflow test
3. Write edge case tests
4. Run all tests
5. Commit: "test: Add comprehensive publishing workflow tests"

---

## Total Effort Estimate

| Phase | Time | Status |
|-------|------|--------|
| Fix Tests | 2-3h | 🟢 Ready |
| Data Integrity | 1-2h | 🟡 After break |
| Implement Publishing | 4-5h | 🟡 After break |
| Publishing Tests | 3-4h | 🟡 After break |
| **TOTAL** | **10-14h** | |

---

## Success Criteria

### Phase 1 Complete:
- ✅ All huntCrud.test.ts tests pass
- ✅ All stepCrud.test.ts tests pass
- ✅ No references to old schema fields
- ✅ Factories create valid data

### Phase 2 Complete:
- ✅ Delete hunt removes all HuntVersions
- ✅ Can't reorder steps from different versions
- ✅ createHunt is atomic (optional)
- ✅ All existing tests still pass

### Phase 3 Complete:
- ✅ POST /api/hunts/:id/publish works
- ✅ Publishing marks version as published
- ✅ Publishing clones all steps
- ✅ Publishing creates new draft
- ✅ Publishing updates Hunt pointers

### Phase 4 Complete:
- ✅ Basic publishing test passes
- ✅ Full workflow test passes
- ✅ Edge case tests pass
- ✅ 100% test coverage on publishing

---

## Risk Assessment

### Low Risk (Safe to proceed):
- ✅ Fixing tests - Just updating assertions
- ✅ Cascade delete - Straightforward addition
- ✅ huntVersion validation - Simple WHERE clause

### Medium Risk (Test thoroughly):
- ⚠️ Transaction safety - Need to handle session properly
- ⚠️ Step cloning - Bulk operation, validate IDs

### High Risk (Needs careful implementation):
- 🔴 Publishing workflow - Multiple DB operations, complex state changes
- 🔴 Version pointer updates - Critical for system integrity

---

## Notes for Implementation

1. **Always use mappers** - No manual DB object construction
2. **Always use services** - Cross-service operations through interfaces
3. **Test incrementally** - After each fix, run tests
4. **Commit frequently** - Small, atomic commits
5. **Document decisions** - Update this file with any changes

---

**Ready to start Phase 1: Fix Tests**
