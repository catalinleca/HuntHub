# Common Standards

Applies to ALL code - frontend and backend.

---

## Code Quality: Lean, Predictable, Reliable

**Lean** - no unnecessary code, no over-engineering
**Predictable** - same input → same output, no hidden side effects
**Reliable** - handle edge cases, fail fast with clear errors, no silent failures

Consider failure cases. What happens when things go wrong?

---

## Red Flags

**Always flag these issues:**

- Hard-coded values (use constants/config)
- Missing error handling
- Unclear naming
- Deviating from project patterns without good reason
- Potential performance issues
- Security concerns
- Type safety violations
- Silent failures

**If I see any of these, I speak up.**

---

## Self-Explanatory Code

**No comments explaining what code does. The code explains itself.**

```typescript
// BAD
// Calculate the distance between two points
const d = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));

// GOOD
const distanceBetweenPoints = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
```

**Comments allowed only for:**
- WHY (business decisions, non-obvious requirements)
- External references (links to algorithms, specs)
- Warnings (security, performance gotchas)

**No section headers.** If you need them, your file is too big. Split it.

---

## Arrow Functions Only

**Never use the `function` keyword.**

```typescript
// BAD
function calculateSimilarity(a: string, b: string): number { ... }

// GOOD
const calculateSimilarity = (a: string, b: string): number => { ... };
```

---

## No Inline Returns

**Always use braces. Never return on same line as if.**

```typescript
// BAD
if (a === b) return 1;

// GOOD
if (a === b) {
  return 1;
}
```

---

## Guard Clauses

Use early returns. Variable names replace comments.

```typescript
// BAD - nested conditionals
if (accessMode !== HuntAccessMode.Open) {
  if (userId != null && hunt.creatorId !== userId) {
    const hasAccess = await checkAccess(huntId, userId);
    if (!hasAccess) {
      throw new NotFoundError();
    }
  }
}

// GOOD - guard clauses
if (accessMode === HuntAccessMode.Open) {
  return;
}

const isCreator = userId != null && hunt.creatorId === userId;
if (isCreator) {
  return;
}

const hasCollaboratorAccess = await checkAccess(huntId, userId);
if (hasCollaboratorAccess) {
  return;
}

throw new NotFoundError();
```

---

## Code Organization

| Metric | Target | Max |
|--------|--------|-----|
| File size | < 200 lines | 400 lines |
| Function size | < 20 lines | 50 lines |
| Nesting depth | 2 levels | 3 levels |
| Parameters | 3 | use options object |

---

## Naming Conventions

```typescript
// Booleans - is/has/can/should prefix
const isValid = true;
const hasPermission = false;

// Arrays - plural
const users = [];
const validOptions = [];

// Functions - verbs
const calculateDistance = () => {};
const validateAnswer = () => {};

// Interfaces - I prefix (backend), no prefix (frontend)
interface IUserService {}  // backend
interface UserService {}   // frontend

// Types - PascalCase
type ValidationResult = { isCorrect: boolean; feedback: string };
```

---

## Error Handling

**Throw, don't return null.**

```typescript
// BAD
const getUser = (id: string): User | null => {
  const user = users.find(u => u.id === id);
  return user || null;
};

// GOOD
const getUser = (id: string): User => {
  const user = users.find(u => u.id === id);
  if (!user) {
    throw new NotFoundError(`User ${id} not found`);
  }
  return user;
};
```

**Use specific error classes:**
```typescript
throw new ValidationError('Email format is invalid');
throw new NotFoundError(`Hunt ${huntId} not found`);
throw new UnauthorizedError('Token expired');
```

---

## Testing

**Test names:** `should [behavior] when [condition]`

```typescript
it('should return correct when answer matches exactly', () => {});
it('should fail when similarity is below threshold', () => {});
```

**Structure:** Arrange → Act → Assert

```typescript
it('should validate fuzzy match with typo', () => {
  // Arrange
  const submitted = 'Eifel Tower';
  const expected = 'Eiffel Tower';

  // Act
  const result = validateAnswer(submitted, expected);

  // Assert
  expect(result.isCorrect).toBe(true);
});
```

---

## SOLID Principles

| Principle | Rule |
|-----------|------|
| **S**ingle Responsibility | One reason to change |
| **O**pen/Closed | Extend without modifying |
| **L**iskov Substitution | Subtypes are substitutable |
| **I**nterface Segregation | Small, focused interfaces |
| **D**ependency Inversion | Depend on abstractions |

**In practice:**
- Strategy pattern for behavior variations
- Factory pattern for object creation
- Interfaces first - define contract before implementation

---

## Shared Types

**All API types live in `@hunthub/shared` - single source of truth.**

```
packages/shared/openapi/hunthub_models.yaml → npm run generate → types + schemas
```

```typescript
// GOOD - import from shared
import { Hunt, Step, SessionResponse } from '@hunthub/shared';

// BAD - duplicating shared types locally
interface SessionResponse { ... }
```

**When adding new API types:**
1. Add to `packages/shared/openapi/hunthub_models.yaml`
2. Run `npm run generate`
3. Import from `@hunthub/shared`

**Backend-only types** (DB interfaces, service internals) stay in backend.
**Frontend-only types** (form state, UI state) stay in frontend.

---

## Zod Schemas

**Check `@hunthub/shared/schemas` FIRST. Never recreate existing schemas.**

| Need | Import From |
|------|-------------|
| Type annotations | `@hunthub/shared` |
| Runtime validation | `@hunthub/shared/schemas` |
| Form validation | `@hunthub/shared/schemas` |

**Extend, don't recreate:**

```typescript
// GOOD - extend existing
import { Challenge, ChallengeType } from '@hunthub/shared/schemas';

const AIGeneratedStepSchema = z.object({
  type: ChallengeType,
  challenge: Challenge,
  hint: z.string().optional(),
});

// BAD - recreating
const AIGeneratedStepSchema = z.object({
  type: z.enum(['clue', 'quiz', 'mission', 'task']),  // Duplicate!
  challenge: z.object({ ... }),                        // Duplicate!
});
```

**When in doubt:**
```bash
grep -n "export const" packages/shared/src/schemas/gen/index.ts
```
