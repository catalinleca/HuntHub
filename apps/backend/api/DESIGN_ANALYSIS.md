# Hunt Versioning System - Design Analysis

**Date:** 2025-01-04
**Status:** Pre-Implementation Review

## Executive Summary

✅ **Overall Architecture**: SOLID - Hunt (master) + HuntVersion (content) pattern is correct
⚠️ **Critical Gaps**: Publishing flow NOT implemented - major functionality missing
❌ **Broken Tests**: All factories and tests incompatible with new schema
⚠️ **Data Integrity**: Missing transaction safety, incomplete cascade deletes

---

## 1. Architecture Review

### ✅ STRENGTHS

#### 1.1 Separation of Concerns
```
Hunt (Master Record)          HuntVersion (Content Snapshots)
├─ huntId                     ├─ huntId + version (compound key)
├─ creatorId                  ├─ name, description
├─ latestVersion (pointer)    ├─ startLocation, stepOrder
├─ liveVersion (pointer)      ├─ isPublished, publishedAt
└─ isDeleted                  └─ timestamps
```

**Why this works:**
- Clean separation: pointers vs content
- Multiple versions without data duplication
- Query efficiency: 2 indexed queries faster than $lookup
- Extensibility: Easy to add version-specific metadata

#### 1.2 Service Boundaries
- ✅ HuntService owns ALL Hunt/HuntVersion operations
- ✅ StepService delegates HuntVersion updates through HuntService
- ✅ Mappers handle ALL DB↔DTO transformations
- ✅ verifyOwnership() returns HuntDoc for DRY authorization

#### 1.3 Type Safety
- ✅ Proper DTO (Hunt) vs DB (IHunt, IHuntVersion) separation
- ✅ Runtime enum validation with type guards
- ✅ Null handling in array operations

---

## 2. ❌ CRITICAL ISSUES

### 2.1 **MISSING: Publishing Implementation**

**Severity:** 🔴 CRITICAL - Blocks entire versioning workflow

**What's Missing:**
```typescript
// NEEDED: HuntService.publishHunt()
async publishHunt(huntId: number, userId: string): Promise<Hunt> {
  // 1. Mark current HuntVersion as published
  // 2. Clone all Steps from latestVersion to new version
  // 3. Create new draft HuntVersion (latestVersion + 1)
  // 4. Update Hunt pointers (liveVersion, latestVersion)
  // 5. Return published hunt
}
```

**Impact:**
- User scenario "publishes" → NOT POSSIBLE
- "publishes again" → NOT POSSIBLE
- Can't test real-world versioning flow
- Half of the architecture is unused (isPublished, liveVersion, etc.)

**Fields Currently Unused:**
- `HuntVersion.isPublished` ❌
- `HuntVersion.publishedAt` ❌
- `HuntVersion.publishedBy` ❌
- `Hunt.liveVersion` ❌

---

### 2.2 **BROKEN: Test Factories**

**Severity:** 🔴 CRITICAL - All tests will fail

**Problem 1: Hunt Factory Creates Invalid Data**
```typescript
// Current factory (WRONG):
export const createTestHunt = async (options: CreateHuntOptions = {}): Promise<IHunt> => {
  const huntData = {
    creatorId: options.creatorId,
    status: options.status || HuntStatus.Draft,  // ❌ Doesn't exist on Hunt
    name: options.name,                          // ❌ Doesn't exist on Hunt
    description: options.description,            // ❌ Doesn't exist on Hunt
    currentVersion: options.currentVersion || 1, // ❌ Wrong field name (latestVersion)
    startLocation: options.startLocation,        // ❌ Doesn't exist on Hunt
  };

  const hunt = await HuntModel.create(huntData); // ❌ Will fail validation
  return hunt.toJSON() as IHunt;
};
```

**Should Be:**
```typescript
export const createTestHunt = async (options: CreateHuntOptions = {}): Promise<IHunt> => {
  // 1. Create Hunt master
  const huntData = HuntMapper.toHuntDocument(options.creatorId);
  const hunt = await HuntModel.create(huntData);

  // 2. Create HuntVersion
  const versionData = HuntMapper.toVersionDocument(
    { name: options.name, description: options.description },
    hunt.huntId,
    1
  );
  await HuntVersionModel.create(versionData);

  return hunt.toJSON() as IHunt;
};
```

**Problem 2: Step Factory Missing huntVersion**
```typescript
// Current (WRONG):
const stepData = {
  huntId: options.huntId,
  type: options.type,
  // ❌ Missing huntVersion field!
};

// Should be:
const stepData = {
  huntId: options.huntId,
  huntVersion: options.huntVersion || 1,  // ✅ Required FK
  type: options.type,
};
```

---

### 2.3 **BROKEN: Existing Tests Reference Old Schema**

**Test Issues:**
```typescript
// ❌ WRONG: Tests check fields that don't exist
expect(response.body).toMatchObject({
  currentVersion: 1,  // ❌ Should be latestVersion, but NOT exposed in DTO
});

// ❌ WRONG: Tests query HuntModel for stepOrder
const updatedHunt = await HuntModel.findOne({ huntId });
expect(updatedHunt?.stepOrder).toContain(stepId);  // ❌ stepOrder is on HuntVersion!

// ❌ WRONG: Tests create steps without huntVersion
await StepModel.create({
  huntId: hunt.huntId,
  type: 'clue',
  // Missing huntVersion!
});
```

---

### 2.4 **INCOMPLETE: Cascade Delete Logic**

**Current Implementation:**
```typescript
async deleteHunt(huntId: number, userId: string): Promise<void> {
  await StepModel.deleteMany({ huntId });  // ❌ Deletes ALL steps across ALL versions
  await existingHunt.deleteOne();          // ❌ Only deletes Hunt, not HuntVersions
}
```

**Problems:**
1. Doesn't delete HuntVersion documents → orphaned data
2. Deletes Steps across all versions (might be ok, but should be explicit)

**Should Be:**
```typescript
async deleteHunt(huntId: number, userId: string): Promise<void> {
  // Delete ALL versions
  await HuntVersionModel.deleteMany({ huntId });

  // Delete ALL steps across all versions
  await StepModel.deleteMany({ huntId });

  // Delete Hunt master
  await existingHunt.deleteOne();
}
```

---

### 2.5 **MISSING: Step Version Validation**

**Problem in reorderSteps:**
```typescript
async reorderSteps(huntId: number, stepOrder: number[], userId: string): Promise<Hunt> {
  // Validate all steps belong to this hunt
  const stepsCount = await StepModel.countDocuments({
    stepId: { $in: stepOrder },
    huntId: huntId,  // ❌ Should ALSO check huntVersion!
  });
}
```

**Issue:** Could reorder steps from different versions together!

**Should Be:**
```typescript
const stepsCount = await StepModel.countDocuments({
  stepId: { $in: stepOrder },
  huntId: huntId,
  huntVersion: huntDoc.latestVersion,  // ✅ Validate version match
});
```

---

### 2.6 **MISSING: Transaction Safety**

**Operations That Need Transactions:**

**1. Create Hunt:**
```typescript
// Current: Not atomic
const createdHunt = await HuntModel.create(huntData);      // Operation 1
const createdVersion = await HuntVersionModel.create(...);  // Operation 2
// ❌ If operation 2 fails, operation 1 is already committed!
```

**2. Publish Hunt (when implemented):**
```typescript
// Will need:
// 1. Mark HuntVersion as published
// 2. Clone N steps
// 3. Create new HuntVersion
// 4. Update Hunt pointers
// ❌ All must succeed or all must fail!
```

**Solution: Use Mongoose Sessions**
```typescript
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  const hunt = await HuntModel.create([huntData], { session });
  await HuntVersionModel.create([versionData], { session });
});
```

---

## 3. Real-World Test Scenarios

### Scenario 1: Basic CRUD (Currently Testable)
```
1. User creates hunt → Hunt v1 (draft) + HuntVersion v1
2. User adds steps → Steps with huntVersion=1
3. User edits hunt data → Updates HuntVersion v1
4. User edits steps → Updates Steps with huntVersion=1
5. User deletes hunt → Cascade deletes everything
```

### Scenario 2: Publishing Workflow (NOT TESTABLE - MISSING IMPLEMENTATION)
```
1. Create hunt → v1 draft
2. Add 3 steps
3. Edit hunt name
4. Publish v1 → ❌ NO ENDPOINT/SERVICE
   Expected:
   - HuntVersion v1: isPublished=true
   - All 3 steps cloned to v2
   - HuntVersion v2: created (draft)
   - Hunt: liveVersion=1, latestVersion=2
5. Edit hunt in v2 → ❌ Can't test
6. Add step to v2 → ❌ Can't test
7. Publish v2 → ❌ Can't test
```

### Scenario 3: Multi-Version Management (NOT TESTABLE)
```
1. Create hunt + 5 steps
2. Publish v1
3. Edit v2: Remove 2 steps, add 1 step (net: 4 steps)
4. Publish v2
5. Check v1 still has 5 steps → ❌ Can't test
6. Check v2 has 4 steps → ❌ Can't test
7. Switch live version back to v1 → ❌ Can't test
```

### Scenario 4: Data Integrity
```
1. Create hunt with steps
2. Publish v1
3. Try to edit published v1 directly → ❌ Should fail (no validation)
4. Try to add step to published version → ❌ Should fail (no validation)
5. Delete hunt → Should delete all versions + all steps
```

---

## 4. Required Fixes

### Priority 1: FIX TESTS (Immediate)
1. ✅ Update hunt.factory.ts to create Hunt + HuntVersion
2. ✅ Update step.factory.ts to include huntVersion
3. ✅ Fix all test assertions to match new schema
4. ✅ Remove references to non-existent fields (currentVersion, status on Hunt)

### Priority 2: IMPLEMENT PUBLISHING (Critical Path)
1. ✅ Add `publishHunt()` to HuntService
2. ✅ Implement step cloning logic
3. ✅ Update Hunt.liveVersion pointer
4. ✅ Create new draft version
5. ✅ Add transaction safety
6. ✅ Add controller endpoint POST /api/hunts/:id/publish
7. ✅ Write comprehensive publishing tests

### Priority 3: FIX DATA INTEGRITY (Important)
1. ✅ Add huntVersion validation to reorderSteps
2. ✅ Fix cascade delete to include HuntVersions
3. ✅ Add validation: Can't edit published versions
4. ✅ Add transaction safety to createHunt

### Priority 4: NICE TO HAVE (Polish)
1. Add GET /api/hunts/:id/versions (list all versions)
2. Add PUT /api/hunts/:id/live (set live version)
3. Add GET /api/hunts/:id/versions/:version (get specific version)
4. Add version comparison endpoint

---

## 5. Test Coverage Plan

### 5.1 Unit Tests (Service Layer)
```
HuntService:
- ✅ createHunt creates Hunt + HuntVersion atomically
- ✅ updateHunt updates only draft version
- ✅ deleteHunt cascades to all versions
- ❌ publishHunt marks version as published and creates new draft
- ❌ publishHunt clones all steps to new version
- ✅ reorderSteps validates huntVersion
- ✅ verifyOwnership returns HuntDoc

StepService:
- ✅ createStep adds to correct huntVersion
- ✅ updateStep validates huntVersion
- ✅ deleteStep removes from correct version
- ✅ delegates HuntVersion updates to HuntService
```

### 5.2 Integration Tests (API Layer)
```
Hunt CRUD:
- ✅ POST /api/hunts creates with version 1
- ✅ GET /api/hunts returns merged Hunt DTO
- ✅ PUT /api/hunts updates draft only
- ✅ DELETE /api/hunts cascades to all versions

Publishing Workflow:
- ❌ POST /api/hunts/:id/publish marks v1 published
- ❌ Publishing creates v2 draft
- ❌ Publishing clones all steps
- ❌ Can edit v2 after publishing v1
- ❌ Can't edit v1 after publishing
- ❌ Publishing again (v2→v3) works correctly

Step Management:
- ✅ POST /api/hunts/:id/steps adds to draft version
- ✅ PUT /api/hunts/:id/steps/:id updates draft only
- ✅ DELETE /api/hunts/:id/steps/:id removes from draft
- ❌ Steps isolated between versions after publish

Data Integrity:
- ✅ Can't reorder steps from different versions
- ❌ Can't edit published version
- ✅ Cascade delete removes all data
- ❌ Transaction rollback on failures
```

---

## 6. Recommendations

### Immediate Actions (Do Now)
1. **Fix test factories** - Tests currently broken
2. **Update existing tests** - Remove invalid assertions
3. **Implement publishHunt()** - Core missing functionality

### Short Term (This Sprint)
4. **Add transaction safety** to createHunt and publishHunt
5. **Fix cascade delete** to include HuntVersions
6. **Add huntVersion validation** to reorderSteps
7. **Write comprehensive publishing tests**

### Medium Term (Next Sprint)
8. **Add version listing endpoints**
9. **Add "set live version" endpoint**
10. **Add validation: can't edit published versions**
11. **Performance testing with many versions**

### Long Term (Future)
12. **Version comparison/diff endpoint**
13. **Revert to previous version**
14. **Version branching (if needed)**
15. **Archive old versions**

---

## 7. Conclusion

### Architecture Quality: ✅ EXCELLENT
- Clean separation of concerns
- Scalable and maintainable
- Follows SOLID principles
- Proper use of mappers and services

### Implementation Completeness: ⚠️ 60%
- ✅ Hunt CRUD: Complete
- ✅ Step CRUD: Complete
- ❌ Publishing: Missing (40% of functionality)
- ❌ Version management: Missing

### Test Coverage: ❌ BROKEN
- All factories need rewrite
- All tests need updates
- Publishing tests missing
- Integration tests incomplete

### Next Steps:
1. ✅ Fix factories (1 hour)
2. ✅ Update tests (2 hours)
3. ✅ Implement publishHunt() (4 hours)
4. ✅ Write publishing tests (3 hours)
5. ✅ Add transaction safety (2 hours)

**Total Effort: ~12 hours to complete versioning system**

---

**Ready for implementation? Let's fix it systematically.**