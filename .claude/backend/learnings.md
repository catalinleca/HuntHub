# Backend Learnings

Practical patterns and gotchas learned during HuntHub development.

---

## MongoDB: Atomic Conditional Updates (Avoid Race Conditions)

**Problem:** Check-then-update creates a race condition.

```typescript
// BAD - Two operations, gap in between
const stepProgress = await getStepProgress(sessionId);
if (stepProgress.hintsUsed >= 1) {
  throw new Error('Limit reached');
}
await incrementHintsUsed(sessionId);  // Race: another request could sneak in
```

**Solution:** Put the condition IN the query.

```typescript
// GOOD - One atomic operation
const result = await ProgressModel.findOneAndUpdate(
  {
    sessionId,
    steps: {
      $elemMatch: {
        stepId,
        hintsUsed: { $lt: maxHints }  // Condition is part of the find
      }
    }
  },
  { $inc: { 'steps.$.hintsUsed': 1 } },
  { new: true }
);

if (!result) {
  // Either not found OR limit already reached
  throw new Error('Limit reached');
}
```

**Why it works:** MongoDB finds AND updates in one indivisible operation. If `hintsUsed >= maxHints`, the query matches nothing, update doesn't happen.

---

## MongoDB: Always Check matchedCount/modifiedCount

**Problem:** `updateOne` succeeds even if nothing was updated.

```typescript
// BAD - Silently fails if step doesn't exist
await ProgressModel.updateOne(
  { sessionId, 'steps.stepId': stepId },
  { $inc: { 'steps.$.attempts': 1 } }
);
```

**Solution:** Check the result.

```typescript
// GOOD - Explicit error if nothing matched
const result = await ProgressModel.updateOne(
  { sessionId, 'steps.stepId': stepId },
  { $inc: { 'steps.$.attempts': 1 } }
);

if (result.matchedCount === 0) {
  throw new NotFoundError('Session or step not found');
}
```

---

## MongoDB: Explicit ObjectId Conversion

**Problem:** Type assertions don't convert at runtime.

```typescript
// BAD - Compiles but doesn't convert string to ObjectId
userId: userId as unknown as mongoose.Types.ObjectId
```

**Solution:** Explicit conversion.

```typescript
// GOOD - Actually converts the string to ObjectId
userId: userId ? new mongoose.Types.ObjectId(userId) : undefined
```

---

## Edge Cases: Handle indexOf returning -1

**Problem:** `-1` can accidentally match array length calculations.

```typescript
// BAD - Returns true for empty array when stepId not found
static isLastStep(stepOrder: number[], stepId: number): boolean {
  const index = stepOrder.indexOf(stepId);
  return index === stepOrder.length - 1;  // -1 === -1 for empty array!
}
```

**Solution:** Check for -1 explicitly.

```typescript
// GOOD
static isLastStep(stepOrder: number[], stepId: number): boolean {
  const index = stepOrder.indexOf(stepId);
  if (index === -1) {
    return false;
  }
  return index === stepOrder.length - 1;
}
```

---

## Validation: Defense in Depth

**Problem:** Trusting that earlier validation caught everything.

```typescript
// BAD - If lat/lng are NaN, haversine returns NaN, feedback says "You're NaNm away"
const distance = haversineDistance(location.lat, location.lng, target.lat, target.lng);
```

**Solution:** Validate before calculation.

```typescript
// GOOD - Clear error message
if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
  return { isCorrect: false, feedback: 'Invalid location coordinates' };
}
const distance = haversineDistance(location.lat, location.lng, target.lat, target.lng);
```

---

## Validation: Check Submitted Value Exists in Options

**Problem:** Malicious client could submit arbitrary option IDs.

```typescript
// BAD - Only checks if answer matches target
const isCorrect = submittedOptionId === quiz.targetId;
```

**Solution:** Verify option exists first.

```typescript
// GOOD - Validates option is from the available choices
const validOptionIds = quiz.options?.map((o) => o.id) ?? [];
if (!validOptionIds.includes(submittedOptionId)) {
  return { isCorrect: false, feedback: 'Invalid option selected' };
}
const isCorrect = submittedOptionId === quiz.targetId;
```

---

## Enums: Use Constants, Not String Literals

**Problem:** String literals can have typos and aren't refactorable.

```typescript
// BAD - Typo risk, not refactorable
const isInProgress = progress.status === 'in_progress';
```

**Solution:** Use enum values.

```typescript
// GOOD - Type-safe, refactorable
const isInProgress = progress.status === HuntProgressStatus.InProgress;
```

---

## Batch Queries: Avoid N+1

**Problem:** Fetching related data in a loop.

```typescript
// BAD - N+1 queries
const hunts = await HuntModel.find({ liveVersion: { $ne: null } });
for (const hunt of hunts) {
  const version = await HuntVersionModel.findOne({ huntId: hunt.huntId, version: hunt.liveVersion });
  // ...
}
```

**Solution:** Batch fetch with $or or $in, then map.

```typescript
// GOOD - 2 queries total
const hunts = await HuntModel.find({ liveVersion: { $ne: null } });

const versionQueries = hunts.map(h => ({ huntId: h.huntId, version: h.liveVersion }));
const versions = await HuntVersionModel.find({ $or: versionQueries });

const versionMap = new Map(versions.map(v => [`${v.huntId}-${v.version}`, v]));

const result = hunts.map(hunt => {
  const version = versionMap.get(`${hunt.huntId}-${hunt.liveVersion}`);
  return { ...hunt, versionData: version };
});
```