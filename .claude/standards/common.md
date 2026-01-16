# Common Standards

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
