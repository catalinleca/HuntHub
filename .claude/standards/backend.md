# Backend Standards

Enforceable patterns for HuntHub backend (Node.js + Express + MongoDB).

---

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Models | PascalCase | `Hunt.ts`, `User.ts` |
| Services | camelCase | `hunt.service.ts`, `auth.service.ts` |
| Controllers | camelCase | `hunt.controller.ts` |
| Routes | camelCase | `hunt.router.ts`, `auth.routes.ts` |
| Middlewares | camelCase | `auth.middleware.ts` |
| Types | PascalCase | `Hunt.ts`, `User.ts` |

---

## Service Pattern

```typescript
export interface IHuntService {
  createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt>;
  getHuntById(id: string): Promise<Hunt>;
}

@injectable()
export class HuntService implements IHuntService {
  async createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt> {
    const createdHunt = await HuntModel.create({
      creatorId,
      ...hunt,
    });
    return createdHunt.toJSON() as Hunt;
  }

  async getHuntById(id: string): Promise<Hunt> {
    const hunt = await HuntModel.findById(id).exec();
    if (!hunt) {
      throw new NotFoundError();
    }
    return hunt.toJSON() as Hunt;
  }
}
```

**Key conventions:**
- Always define interface first
- Use @injectable() decorator
- Return OpenAPI types (Hunt), not DB types (IHunt)
- Use toJSON() for serialization
- Throw custom errors, don't return null
- Async/await everywhere

---

## Controller Pattern

```typescript
export interface IHuntController {
  createHunt(req: Request, res: Response): Promise<Response>;
  getHuntById(req: Request, res: Response): Promise<Response>;
}

@injectable()
export class HuntController implements IHuntController {
  constructor(@inject(TYPES.HuntService) private huntService: HuntService) {}

  async createHunt(req: Request, res: Response) {
    const hunt = req.body;
    const createdHunt = await this.huntService.createHunt(hunt, req.user.id);
    return res.status(201).json(createdHunt);
  }

  async getHuntById(req: Request, res: Response) {
    const id = req.params.id;
    const hunt = await this.huntService.getHuntById(id);
    return res.status(200).json(hunt);
  }
}
```

**Key conventions:**
- Always define interface first
- Use @injectable() decorator
- Inject dependencies via constructor with @inject
- Extract data from req (body, params, user)
- Delegate to services
- Return res.status().json()
- Don't catch errors (let error middleware handle it)

---

## Router Pattern

```typescript
const router = Router();
const container = getContainer();
const controller = container.get<IHuntController>(TYPES.HuntController);

router.post('/',
  validateRequest(createHuntSchema),
  asyncHandler(controller.createHunt.bind(controller))
);

router.get('/:id',
  asyncHandler(controller.getHuntById.bind(controller))
);

export default router;
```

**Key conventions:**
- Get controller from DI container
- Use validateRequest() middleware for validation
- Bind controller methods to preserve `this` context
- Use asyncHandler to catch errors

---

## Model Pattern

```typescript
import { Schema, model } from 'mongoose';
import { IHunt, HuntStatus } from '../types/Hunt';

const huntSchema: Schema<IHunt> = new Schema<IHunt>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(HuntStatus),
      default: HuntStatus.Draft,
    },
    name: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

huntSchema.index({ creatorId: 1 });

const HuntModel = model('Hunt', huntSchema);

export default HuntModel;
```

**Key conventions:**
- Import interface from types/
- Type schema with interface: `Schema<IHunt>`
- Enable timestamps: `{ timestamps: true }`
- Define indexes for frequently queried fields
- Use enums for status fields
- Use `{ type: Schema.Types.ObjectId, ref: 'ModelName' }` for ObjectId references
- Export as `*Model` (e.g., `HuntModel`, `UserModel`)

---

## Error Handling Pattern

```typescript
// In service
if (!hunt) {
  throw new NotFoundError(); // or NotFoundError('Hunt not found')
}

if (!isValid) {
  throw new ValidationError('Invalid data', errors);
}

// Custom error classes extend AppError
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}
```

**Key conventions:**
- Throw, don't return errors
- Use specific error classes
- Provide helpful messages
- Error middleware catches all

---

## Validation Pattern

**Strategy:** Import Zod schemas from `@hunthub/shared/schemas`, extend for backend-specific needs

```typescript
// src/validation/schemas/hunt.schema.ts
import { HuntCreate, Hunt } from '@hunthub/shared/schemas';

// Re-export base schemas from shared
export { Hunt, HuntCreate };

// Create backend-specific variants
export const createHuntSchema = HuntCreate;
export const updateHuntSchema = HuntCreate.partial();

// Backend-specific extensions
export const huntWithAuthSchema = HuntCreate.extend({
  creatorId: z.string().uuid(),
});
```

**Usage in routes:**
```typescript
router.post('/',
  validateRequest(createHuntSchema),
  controller.createHunt
);
```

**Key conventions:**
- Import base schemas from `@hunthub/shared/schemas`
- Re-export shared schemas for consistency
- Use `.partial()` for update schemas
- Use `.extend()` for backend-specific additions
- Backend-only schemas (like auth) stay in backend
- Barrel export from `validation/index.ts`

---

## Type Patterns

**Two type systems:**

1. **Database types** (`src/database/types/`) - Used by Mongoose
```typescript
export interface IHunt {
  id: string;
  creatorId: mongoose.Types.ObjectId;
  name: string;
}
```

2. **API types** (`src/openapi/`) - Generated from OpenAPI
```typescript
export interface Hunt {
  id: string;
  creatorId: string;
  name: string;
}
```

**Convention:**
- Services return API types (Hunt)
- Models use DB types (IHunt)
- Convert via `.toJSON()` method

---

## Import Patterns

```typescript
// Module aliases
import HuntModel from '@/database/models/Hunt';
import { IHuntService } from '@/services/hunt.service';

// Relative imports for nearby files
import { NotFoundError } from './errors/NotFoundError';

// Types from OpenAPI
import { Hunt, HuntCreate } from '@/openapi/HuntHubTypes';

// DB types
import { IHunt } from '@/database/types/Hunt';
```

---

## Testing Patterns

### Test Structure

```
tests/
├── integration/
│   └── hunts/
│       └── huntCrud.test.ts
├── setup/
│   ├── testServer.ts
│   ├── testDatabase.ts
│   └── factories/
│       ├── user.factory.ts
│       └── hunt.factory.ts
└── helpers/
    ├── authHelper.ts
    └── dbHelper.ts
```

### Integration Test Pattern

```typescript
describe('Hunt CRUD Integration Tests', () => {
  let app: Express;
  let testUser: IUser;
  let authToken: string;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    testUser = await createTestUser({ email: 'test@example.com' });
    mockFirebaseAuth(testUser);
    authToken = createTestAuthToken(testUser);
  });

  afterEach(() => {
    clearFirebaseAuthMocks();
  });

  it('should create a new hunt and return 201', async () => {
    const huntData = generateHuntData({ name: 'Test Hunt' });

    const response = await request(app)
      .post('/api/hunts')
      .set('Authorization', `Bearer ${authToken}`)
      .send(huntData)
      .expect(201);

    expect(response.body).toMatchObject({
      name: 'Test Hunt',
      status: HuntStatus.Draft,
    });
  });
});
```

### Test Naming Convention

**Format:** `should [expected behavior] when [condition]`

- `should create a new hunt and return 201`
- `should return 401 when no auth token provided`
- `should return 404 when hunt does not exist`

### Key Testing Conventions

- Use factories to create test data
- Mock external services (Firebase, S3)
- Use in-memory database for speed
- Clean database between tests
- Test validation middleware integration
- Test authentication/authorization
- Use supertest for HTTP testing
- Assert on response status AND body
- Keep tests independent (no shared state)

---

## MongoDB Patterns

### Atomic Conditional Updates (Avoid Race Conditions)

```typescript
// BAD - Two operations, gap in between (race condition)
const stepProgress = await getStepProgress(sessionId);
if (stepProgress.hintsUsed >= 1) {
  throw new Error('Limit reached');
}
await incrementHintsUsed(sessionId);

// GOOD - One atomic operation
const result = await ProgressModel.findOneAndUpdate(
  {
    sessionId,
    steps: {
      $elemMatch: {
        stepId,
        hintsUsed: { $lt: maxHints }  // Condition in the find
      }
    }
  },
  { $inc: { 'steps.$.hintsUsed': 1 } },
  { new: true }
);

if (!result) {
  throw new Error('Limit reached');
}
```

### Always Check matchedCount/modifiedCount

```typescript
// BAD - Silently fails if step doesn't exist
await ProgressModel.updateOne(
  { sessionId, 'steps.stepId': stepId },
  { $inc: { 'steps.$.attempts': 1 } }
);

// GOOD - Explicit error if nothing matched
const result = await ProgressModel.updateOne(
  { sessionId, 'steps.stepId': stepId },
  { $inc: { 'steps.$.attempts': 1 } }
);

if (result.matchedCount === 0) {
  throw new NotFoundError('Session or step not found');
}
```

### Explicit ObjectId Conversion

```typescript
// BAD - Type assertion doesn't convert at runtime
userId: userId as unknown as mongoose.Types.ObjectId

// GOOD - Actually converts the string
userId: userId ? new mongoose.Types.ObjectId(userId) : undefined
```

### Batch Queries (Avoid N+1)

```typescript
// BAD - N+1 queries
const hunts = await HuntModel.find({ liveVersion: { $ne: null } });
for (const hunt of hunts) {
  const version = await HuntVersionModel.findOne({ huntId: hunt.huntId, version: hunt.liveVersion });
}

// GOOD - 2 queries total
const hunts = await HuntModel.find({ liveVersion: { $ne: null } });
const versionQueries = hunts.map(h => ({ huntId: h.huntId, version: h.liveVersion }));
const versions = await HuntVersionModel.find({ $or: versionQueries });
const versionMap = new Map(versions.map(v => [`${v.huntId}-${v.version}`, v]));
```

---

## Edge Cases

### Handle indexOf Returning -1

```typescript
// BAD - Returns true for empty array when stepId not found
static isLastStep(stepOrder: number[], stepId: number): boolean {
  const index = stepOrder.indexOf(stepId);
  return index === stepOrder.length - 1;  // -1 === -1 for empty array!
}

// GOOD - Check for -1 explicitly
static isLastStep(stepOrder: number[], stepId: number): boolean {
  const index = stepOrder.indexOf(stepId);
  if (index === -1) {
    return false;
  }
  return index === stepOrder.length - 1;
}
```

### Validation Defense in Depth

```typescript
// BAD - If lat/lng are NaN, haversine returns NaN
const distance = haversineDistance(location.lat, location.lng, target.lat, target.lng);

// GOOD - Validate before calculation
if (!Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
  return { isCorrect: false, feedback: 'Invalid location coordinates' };
}
const distance = haversineDistance(location.lat, location.lng, target.lat, target.lng);
```

### Validate Submitted Values Exist in Options

```typescript
// BAD - Only checks if answer matches target
const isCorrect = submittedOptionId === quiz.targetId;

// GOOD - Validates option is from available choices
const validOptionIds = quiz.options?.map((o) => o.id) ?? [];
if (!validOptionIds.includes(submittedOptionId)) {
  return { isCorrect: false, feedback: 'Invalid option selected' };
}
const isCorrect = submittedOptionId === quiz.targetId;
```

---

## Enums: Use Constants, Not String Literals

```typescript
// BAD - Typo risk, not refactorable
const isInProgress = progress.status === 'in_progress';

// GOOD - Type-safe, refactorable
const isInProgress = progress.status === HuntProgressStatus.InProgress;
```

---

## SOLID Principles (Pragmatic)

### Single Responsibility

- Controllers → HTTP only
- Services → Business logic only
- Models → Data persistence only
- Each module has one reason to change

### Open/Closed (Your Focus)

**Use strategy/factory pattern for extensible behavior:**

```typescript
// BAD - Adding new type requires modifying this function
async validateChallenge(step: Step): Promise<boolean> {
  if (step.type === 'clue') { /* ... */ }
  else if (step.type === 'quiz') { /* ... */ }
  // Adding new type = modifying here
}

// GOOD - Open for extension, closed for modification
interface IChallengeValidator {
  validate(challenge: Challenge): boolean;
}

const validators = new Map<ChallengeType, IChallengeValidator>([
  [ChallengeType.Clue, new ClueValidator()],
  [ChallengeType.Quiz, new QuizValidator()],
]);

// Adding new type = new validator class + register in map
// No modification to validateChallenge
```

### Dependency Inversion

**You're already doing this with InversifyJS:**

```typescript
@injectable()
export class HuntController {
  constructor(@inject(TYPES.HuntService) private huntService: IHuntService) {}
  //                                                         ^^^^^^^^^^^^
  //                                         Abstraction, not concrete class
}
```

### Interface Segregation

**Smaller, focused interfaces:**

```typescript
// GOOD - Each consumer depends only on what it needs
interface IHuntReader {
  findById(id: string): Promise<Hunt | null>;
}

interface IHuntWriter {
  create(data: HuntCreate): Promise<Hunt>;
}

// PlayerService only needs IHuntReader
// EditorService needs both
```

---

## Don't Do This

- **Don't catch errors in controllers** - Let error middleware handle it
- **Don't use serializers** - Use toJSON() instead
- **Don't return null from services** - Throw NotFoundError
- **Don't hard-code values** - Use config/env
- **Don't bypass DI** - Always use container.get()
- **Don't mix DB and API types** - Convert via toJSON()
