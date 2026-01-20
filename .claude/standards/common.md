# Common Standards

**IMPORTANT: Do not miss any requirements in this file!.**

**Applies to ALL code - frontend and backend.**

These standards are referenced by both `frontend.md` and `backend.md`.

---

## Self-Explanatory Code (MANDATORY)

**No comments explaining what code does. The code explains itself.**

### Naming Over Comments

```typescript
// BAD - comment explains what code does
// Calculate the distance between two points
const d = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));

// GOOD - name explains what code does
const distanceBetweenPoints = Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
```

### When Comments Are Allowed

1. **Why, not what** - Business decisions, non-obvious requirements
2. **External references** - Links to algorithms, specs, issues
3. **Warnings** - Security implications, performance gotchas

```typescript
// ALLOWED - explains WHY (business decision)
// Bidirectional: user might type "Eiffel" when answer is "The Eiffel Tower"
const isMatch = submitted.includes(expected) || expected.includes(submitted);

// NOT ALLOWED - explains WHAT (the code already shows this)
// Check if submitted contains expected or expected contains submitted
const isMatch = submitted.includes(expected) || expected.includes(submitted);

// NOT ALLOWED - "next section does X" comments
// Check acceptable answers if primary didn't match   <-- DELETE THIS
for (const acceptable of config.acceptableAnswers) {
```

### Guard Clauses with Early Returns

Use guard clauses and early returns for sequential checks. Variable names replace comments.

```typescript
// BAD - nested conditionals, comments explaining logic
const checkAccessMode = async (hunt, accessMode, email, userId) => {
  // Check if open mode
  if (accessMode !== HuntAccessMode.Open) {
    // Check if user is creator
    if (userId != null && hunt.creatorId.toString() !== userId) {
      // Check if collaborator
      const hasAccess = await HuntAccessModel.hasAccess(hunt.huntId, userId);
      if (!hasAccess) {
        throw new NotFoundError();
      }
    }
  }
};

// GOOD - guard clauses, meaningful names, no comments needed
const checkAccessMode = async (hunt, accessMode, email, userId) => {
  if (accessMode === HuntAccessMode.Open) {
    return;
  }

  const isCreator = userId != null && hunt.creatorId.toString() === userId;
  if (isCreator) {
    return;
  }

  if (userId != null) {
    const hasCollaboratorAccess = await HuntAccessModel.hasAccess(hunt.huntId, userId);
    if (hasCollaboratorAccess) {
      return;
    }
  }

  throw new NotFoundError();
};
```

**Key principles:**
- Guard clauses exit early for each condition
- Descriptive variable names (`isCreator`, `hasCollaboratorAccess`) replace comments
- One-liner boolean checks stay inline with meaningful names
- Extract methods only when logic is reused or complex

### Section Headers

**NO section headers.** If you need section headers, your file is too big. Split it.

---

## Arrow Functions Only (MANDATORY)

**Never use the `function` keyword.**

```typescript
// BAD
function calculateSimilarity(a: string, b: string): number {
  return 1 - levenshteinDistance(a, b) / Math.max(a.length, b.length);
}

// GOOD
const calculateSimilarity = (a: string, b: string): number => {
  return 1 - levenshteinDistance(a, b) / Math.max(a.length, b.length);
};
```

---

## No Inline Returns (MANDATORY)

**Never put return on same line as if. Always use braces.**

```typescript
// BAD - inline return
if (a === b) return 1;
if (!user) return null;

// GOOD - explicit block
if (a === b) {
  return 1;
}

if (!user) {
  return null;
}
```

### Why No Inline Returns

1. Consistent, predictable structure
2. Easier to add logging/debugging
3. Clearer control flow
4. No surprises when reading code

---

## Predictable, Reliable, Understandable Code

### Predictable

- Same input → same output
- No hidden side effects
- Explicit over implicit
- Follow established patterns in the codebase

### Reliable

- Handle edge cases
- Validate inputs at boundaries
- Fail fast with clear errors
- No silent failures

### Understandable

- Read top to bottom
- Clear variable names
- Small, focused functions
- No clever tricks

```typescript
// BAD - clever but hard to understand
const r = a.length > b.length ? [b, a] : [a, b];

// GOOD - obvious what's happening
const shorter = a.length <= b.length ? a : b;
const longer = a.length > b.length ? a : b;
```

---

## SOLID Principles

**All code follows SOLID. See `.claude/behavior/solid-principles.md` for detailed examples.**

### Quick Reference

| Principle | Rule |
|-----------|------|
| **S**ingle Responsibility | One reason to change |
| **O**pen/Closed | Extend without modifying |
| **L**iskov Substitution | Subtypes are substitutable |
| **I**nterface Segregation | Small, focused interfaces |
| **D**ependency Inversion | Depend on abstractions |

### In Practice

- **Strategy pattern** for behavior variations (validation modes, challenge types)
- **Factory pattern** for object creation
- **Repository pattern** for data access
- **Interfaces first** - define contract before implementation

---

## Code Organization

### File Size

- **Aim for < 200 lines** per file
- **Never exceed 400 lines** - split into modules

### Function Size

- **Aim for < 20 lines** per function
- **Never exceed 50 lines** - extract helpers

### Complexity

- **Max 3 levels of nesting** - extract to functions
- **Max 3 parameters** - use options object for more
- **Max 1 responsibility** per function

---

## Naming Conventions

### Variables and Functions

```typescript
// Booleans - use is/has/can/should prefix
const isValid = true;
const hasPermission = false;
const canEdit = true;

// Arrays - use plural
const users = [];
const validOptions = [];

// Functions - use verbs
const calculateDistance = () => {};
const validateAnswer = () => {};
const getConfig = () => {};
```

### Types and Interfaces

```typescript
// Interfaces - use I prefix (backend) or no prefix (frontend)
interface IUserService {}  // backend
interface UserService {}   // frontend

// Types - PascalCase
type ValidationResult = { isCorrect: boolean; feedback: string };
type ValidationMode = 'exact' | 'fuzzy' | 'contains' | 'numeric-range';
```

---

## Error Handling

### Throw, Don't Return

```typescript
// BAD
const getUser = (id: string): User | null => {
  const user = users.find(u => u.id === id);
  return user || null;  // Caller must check for null
};

// GOOD
const getUser = (id: string): User => {
  const user = users.find(u => u.id === id);
  if (!user) throw new NotFoundError(`User ${id} not found`);
  return user;
};
```

### Specific Errors

```typescript
// BAD
throw new Error('Something went wrong');

// GOOD
throw new ValidationError('Email format is invalid');
throw new NotFoundError(`Hunt ${huntId} not found`);
throw new UnauthorizedError('Token expired');
```

---

## Testing

### Test Names

Format: `should [behavior] when [condition]`

```typescript
it('should return correct when answer matches exactly', () => {});
it('should fail when similarity is below threshold', () => {});
it('should use default threshold when not specified', () => {});
```

### Test Structure

```typescript
it('should validate fuzzy match with typo', () => {
  // Arrange
  const submitted = 'Eifel Tower';
  const expected = 'Eiffel Tower';
  const config = { mode: ValidationMode.Fuzzy, fuzzyThreshold: 0.8 };

  // Act
  const result = validateAnswer(submitted, expected, config);

  // Assert
  expect(result.isCorrect).toBe(true);
  expect(result.confidence).toBeGreaterThanOrEqual(0.8);
});
```

---

## Shared Types (MANDATORY)

**All API types live in `@hunthub/shared` - the single source of truth.**

### Where Types Come From

```
packages/shared/openapi/hunthub_models.yaml  →  npm run generate  →  packages/shared/src/types/index.ts
```

- **OpenAPI spec** defines all request/response shapes
- **Generated types** are imported by both backend and frontend
- **Never duplicate** API types locally - import from `@hunthub/shared`

### Usage

```typescript
// GOOD - import from shared
import { SessionResponse, NavigateResponse, StepResponse } from '@hunthub/shared';

// BAD - defining types locally that should be in shared
interface SessionResponse { ... }  // Duplicates shared type!
```

### When Adding New API Types

1. Add schema to `packages/shared/openapi/hunthub_models.yaml`
2. Run `npm run generate` from root
3. Export from `packages/shared/src/types/index.ts`
4. Import in both backend and frontend

### Backend-Only Types

Some types are internal to backend (DB interfaces, service internals). These stay in backend:

```typescript
// Internal to backend - NOT in shared
interface IProgress { ... }  // Mongoose document interface
interface IHuntService { ... }  // Service interface
```

### Frontend-Only Types

UI-specific types stay in frontend:

```typescript
// Internal to frontend - NOT in shared
interface FormState { ... }  // React Hook Form state
type ValidationStatus = 'idle' | 'validating' | 'success' | 'error';  // UI state
```
