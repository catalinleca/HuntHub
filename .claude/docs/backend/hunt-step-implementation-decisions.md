# Hunt & Step Implementation - Key Decisions & Rationale

**Created:** 2025-10-28
**Context:** Week 1 implementation of Hunt CRUD + Step CRUD

---

## Business Logic Decisions

### 1. Hunt-Step Relationship

**Decision:** Steps are separate documents, Hunt stores ordered array of step IDs

```typescript
Hunt {
  stepOrder: ObjectId[]  // Ordered array of step references
}

Step {
  huntId: ObjectId      // Belongs to one hunt
}
```

**Rationale:**
- **Progress tracking**: Player progress references individual steps
- **Versioning**: Easier to clone hunts for publishing (separate step docs)
- **Flexibility**: Steps can be queried/analyzed independently
- **Scalability**: No 16MB document limit (MongoDB), unlimited steps per hunt

**Alternative rejected:** Embedded steps in Hunt document (would hit size limits, harder to track progress)

---

### 2. Step Ordering Strategy

**Decision:** Hunt stores `stepOrder: ObjectId[]`, NO `order: number` field on Step documents

**Rationale:**
- **MongoDB preserves array order** (one of the reasons we chose MongoDB)
- **Simpler reordering**: Single array update vs recalculating all step order numbers
- **No gaps**: Array automatically maintains contiguous order
- **Atomic updates**: One database write instead of N writes

**Operations:**
```typescript
// Reorder (1 write)
hunt.stepOrder = ["step-3", "step-1", "step-2"];
await hunt.save();

// vs order field approach (3+ writes)
await Step.updateMany({ huntId }, [
  { _id: "step-1", order: 2 },
  { _id: "step-2", order: 3 },
  { _id: "step-3", order: 1 }
]);
```

**Alternative rejected:** `Step.order: number` field (causes "order field hell": gaps, race conditions, complex reordering)

---

### 3. Authorization Pattern: Reusable Ownership Verification

**Decision:** Created `huntService.verifyOwnership()` method that other services inject and call

```typescript
// HuntService
async verifyOwnership(huntId: string, userId: string): Promise<Hunt> {
  const hunt = await HuntModel.findById(huntId);
  if (!hunt) throw new NotFoundError();
  if (hunt.creatorId !== userId) throw new ForbiddenError();
  return hunt;
}

// StepService (injects HuntService via DI)
async createStep(..., userId: string) {
  await this.huntService.verifyOwnership(huntId, userId);
  // Proceed with step creation
}
```

**Rationale:**
- **DRY**: Reusable across all services that need hunt ownership checks
- **Consistent errors**: NotFoundError (resource missing) vs ForbiddenError (unauthorized)
- **Dependency injection**: Follows SOLID principles, testable
- **Single responsibility**: HuntService owns hunt authorization logic

**Alternative rejected:** Helper function using HuntModel directly (breaks service layer pattern)

---

### 4. RESTful Route Structure: Nested Resources

**Decision:** Use huntId in URL path, not payload

```
POST   /api/hunts/:huntId/steps
PUT    /api/hunts/:huntId/steps/:stepId
DELETE /api/hunts/:huntId/steps/:stepId
```

**Rationale:**
- **Verify ownership FIRST**: Check hunt access before touching step
- **Validate step belongs to hunt**: Prevent step-switching attacks
- **RESTful hierarchy**: Clear parent-child relationship in URL
- **Consistent pattern**: All nested resources follow same structure
- **Security**: Can't manipulate stepId to access other hunts' steps

**Flow:**
```typescript
1. Extract huntId from URL
2. Verify user owns hunt (verifyOwnership)
3. Check step belongs to hunt
4. Perform operation
```

**Alternative rejected:** `PUT /api/steps/:id` with huntId in payload (less secure, can't verify ownership first)

---

### 5. DTO Separation: Clean Contracts

**Decision:** Create/Update schemas contain ONLY editable fields

```typescript
StepCreate {
  type: ChallengeType     // User provides
  challenge: Challenge    // User provides
  // NO id, NO huntId (from URL), NO timestamps
}

StepUpdate {
  type: ChallengeType     // Editable
  challenge: Challenge    // Editable
  // NO id, NO huntId, NO timestamps
}

Step {
  id: string              // Generated
  huntId: string          // Set by backend
  type: ChallengeType
  challenge: Challenge
  createdAt: string       // Auto-generated
  updatedAt: string       // Auto-generated
}
```

**Rationale:**
- **Security**: Can't manipulate id, huntId, or timestamps
- **Clarity**: API contract shows exactly what user can set
- **Frontend validation**: Zod strips unknown fields automatically
- **Type safety**: TypeScript prevents passing wrong fields

**Alternative rejected:** Same schema for Create/Update/Response (allows field manipulation, unclear API contract)

---

### 6. Discriminated Union: Challenge Types

**Decision:** `type` field is REQUIRED, discriminates which challenge is active

```typescript
Step {
  type: ChallengeType     // REQUIRED - tells you which challenge
  challenge: {
    clue?: Clue          // Only one of these four
    quiz?: Quiz          // will be populated
    mission?: Mission
    task?: Task
  }
}
```

**Rationale:**
- **Performance**: Can filter by type (`db.steps.find({ type: 'quiz' })`)
- **Type narrowing**: TypeScript can infer which challenge is active
- **Validation**: Ensures type matches populated challenge
- **Direct access**: `if (step.type === 'quiz') use step.challenge.quiz`

**Why not optional?** Without `type`, must check all four challenge fields (slow, ugly)

**Alternative rejected:** Make `type` optional and infer from which challenge is populated (slower queries, no type narrowing)

---

### 7. Update Hunt: Metadata Only

**Decision:** Hunt update endpoint does NOT update steps

```typescript
PUT /api/hunts/:id
Body: { name, description, startLocation }  // Metadata only

Steps managed separately:
POST   /api/hunts/:id/steps
PUT    /api/hunts/:huntId/steps/:stepId
DELETE /api/hunts/:huntId/steps/:stepId
PUT    /api/hunts/:id/step-order
```

**Rationale:**
- **Single Responsibility**: One endpoint = one purpose
- **Simpler API**: Clear separation of concerns
- **Flexibility**: Can update hunt without touching steps
- **Granular permissions**: Could add step-level permissions later

**Alternative rejected:** Nested step updates in hunt update (complex validation, all-or-nothing updates)

---

### 8. Delete Hunt: Cascade Delete

**Decision:** Deleting hunt EXPLICITLY deletes all steps

```typescript
async deleteHunt(id: string, userId: string) {
  const hunt = await HuntModel.findByIdAndCreator(id, userId);
  if (!hunt) throw new NotFoundError();

  await StepModel.deleteMany({ huntId: id });  // Cascade
  await hunt.deleteOne();
}
```

**Rationale:**
- **Data integrity**: No orphaned steps
- **Explicit**: Developer knows cascade happens (vs relying on DB cascade)
- **Testable**: Can verify steps are deleted
- **MongoDB**: No native cascade delete, must implement manually

**Alternative rejected:** Mongoose hooks (hidden logic, harder to test)

---

### 9. Validation Strategy: Three Layers

**Decision:** Validate at UI, API, and DB layers

```
UI (React):        Zod schemas (immediate feedback)
    ↓
API (Middleware):  Zod schemas (security - don't trust client)
    ↓
DB (Mongoose):     Schema validation (data integrity)
```

**Rationale:**
- **UI**: User experience (instant feedback)
- **API**: Security (can't bypass with curl)
- **DB**: Last line of defense (corrupted data, developer errors)

**Shared validation:** OpenAPI → TypeScript types → Zod schemas (single source of truth)

---

### 10. Error Handling: Semantic HTTP Status

**Decision:** NotFoundError (404) vs ForbiddenError (403)

```typescript
// Resource doesn't exist
if (!hunt) throw new NotFoundError();  // 404

// Resource exists but user can't access
if (hunt.creatorId !== userId) throw new ForbiddenError();  // 403
```

**Rationale:**
- **Security**: Don't leak existence of resources user can't access
- **UX**: Clear error messages
- **Standard HTTP semantics**: Follows REST conventions

**Alternative rejected:** Always return 404 (leaks no info but less clear for legitimate users)

---

## Architectural Patterns Established

### Mapper Pattern
```typescript
StepMapper.toDocument(dto, huntId)      // API → DB
StepMapper.toDocumentUpdate(dto)        // API → DB (partial)
StepMapper.fromDocument(doc)            // DB → API
StepMapper.fromDocuments(docs)          // DB[] → API[]
```

**Purpose:** Clean separation between API types and DB types

---

### Dependency Injection Pattern
```typescript
@injectable()
class StepService {
  constructor(@inject(TYPES.HuntService) private huntService: IHuntService) {}
}
```

**Purpose:** Reusable services, testable, loose coupling

---

### Interface-First Pattern
```typescript
export interface IStepService { ... }
export class StepService implements IStepService { ... }
```

**Purpose:** Contract-based programming, swappable implementations

---

## Technical Decisions

### OpenAPI as Source of Truth
- Define schemas once
- Generate TypeScript types
- Generate Zod schemas
- Keep FE/BE in sync

### MongoDB Best Practices
- Ordered arrays for sequencing
- Separate collections for flexibility
- Explicit cascade deletes
- Indexes on foreign keys

### TypeScript Patterns
- Strict mode
- Type guards for enums
- Interface + Implementation
- Mapper for type conversion

---

## What We Built (Week 1)

**Hunt CRUD:**
- ✅ Create hunt (POST /api/hunts)
- ✅ List user hunts (GET /api/hunts)
- ✅ Get hunt by ID (GET /api/hunts/:id)
- ✅ Update hunt metadata (PUT /api/hunts/:id)
- ✅ Delete hunt with cascade (DELETE /api/hunts/:id)
- ✅ Reorder steps (PUT /api/hunts/:id/step-order)

**Step CRUD:**
- ✅ Create step (POST /api/hunts/:huntId/steps)
- ✅ Update step (PUT /api/hunts/:huntId/steps/:stepId)
- ✅ Delete step (DELETE /api/hunts/:huntId/steps/:stepId)

**Patterns:**
- ✅ Reusable authorization
- ✅ RESTful nested routes
- ✅ Clean DTO separation
- ✅ Mapper pattern
- ✅ Dependency injection
- ✅ Three-layer validation

---

## Next: UUID Migration (Critical)

**Problem:** Currently exposing MongoDB ObjectIds in API
**Solution:** Dual ID system (internal ObjectId + external UUID)
**Impact:** All models, mappers, services need updating
**Priority:** HIGH - Security and architecture best practice

---

**This document preserves the "why" behind our implementation choices.**
