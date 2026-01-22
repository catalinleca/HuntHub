# Backend Standards

Node.js + Express + MongoDB + InversifyJS. Also follow `common-standards.md`.

---

## File Naming

| Type | Convention | Example |
|------|------------|---------|
| Models | PascalCase | `Hunt.ts` |
| Services | camelCase | `hunt.service.ts` |
| Controllers | camelCase | `hunt.controller.ts` |
| Routes | camelCase | `hunt.router.ts` |
| Types | PascalCase | `Hunt.ts` |

---

## Layer Responsibilities

| Layer | Does | Doesn't |
|-------|------|---------|
| Controller | HTTP req/res, extract params, delegate | Business logic, DB access, error catching |
| Service | Business logic, orchestration | HTTP concerns, direct res.json() |
| Model | Data persistence, schema | Business rules |

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
    const createdHunt = await HuntModel.create({ creatorId, ...hunt });
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

**Rules:**
- Interface first
- `@injectable()` decorator
- Return API types (Hunt), not DB types (IHunt)
- Use `toJSON()` for serialization
- Throw errors, don't return null

---

## Controller Pattern

```typescript
@injectable()
export class HuntController implements IHuntController {
  constructor(@inject(TYPES.HuntService) private huntService: IHuntService) {}

  async createHunt(req: Request, res: Response) {
    const createdHunt = await this.huntService.createHunt(req.body, req.user.id);
    return res.status(201).json(createdHunt);
  }
}
```

**Rules:**
- Inject via constructor with `@inject`
- Extract from req, delegate to service, return res
- Don't catch errors (error middleware handles it)

---

## Router Pattern

```typescript
const controller = container.get<IHuntController>(TYPES.HuntController);

router.post('/',
  validateRequest(createHuntSchema),
  asyncHandler(controller.createHunt.bind(controller))
);
```

**Rules:**
- Get controller from DI container
- `.bind(controller)` to preserve `this`
- `asyncHandler` for error catching
- `validateRequest` for Zod validation

---

## Model Pattern

```typescript
const huntSchema: Schema<IHunt> = new Schema<IHunt>(
  {
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.values(HuntStatus), default: HuntStatus.Draft },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

huntSchema.index({ creatorId: 1 });

export default model('Hunt', huntSchema);
```

**Rules:**
- Type schema: `Schema<IHunt>`
- `{ timestamps: true }`
- Define indexes for query fields
- Export as `*Model`

---

## Error Handling Pattern

```typescript
// Custom errors extend AppError
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

// In service - throw, don't return
if (!hunt) {
  throw new NotFoundError();
}

if (!isValid) {
  throw new ValidationError('Invalid data', errors);
}
```

**Error classes:**
- `NotFoundError` (404)
- `ValidationError` (400)
- `UnauthorizedError` (401)
- `ForbiddenError` (403)

**Rules:**
- Throw specific error classes
- Provide helpful messages
- Error middleware catches all (don't catch in controllers)

---

## Validation Pattern

**Import from `@hunthub/shared/schemas`, extend for backend-specific needs.**

```typescript
import { HuntCreate, Hunt } from '@hunthub/shared/schemas';

// Re-export shared schemas
export { Hunt, HuntCreate };

// Update schema = partial
export const updateHuntSchema = HuntCreate.partial();

// Backend-specific extension
export const huntWithAuthSchema = HuntCreate.extend({
  creatorId: z.string().uuid(),
});
```

**Usage in routes:**
```typescript
router.post('/', validateRequest(createHuntSchema), controller.createHunt);
```

**Rules:**
- Import base schemas from `@hunthub/shared/schemas`
- `.partial()` for update schemas
- `.extend()` for backend-specific additions
- Backend-only schemas stay in backend

---

## Import Patterns

```typescript
// Module aliases (@/)
import HuntModel from '@/database/models/Hunt';
import { IHuntService } from '@/services/hunt.service';

// Relative for nearby files
import { NotFoundError } from './errors/NotFoundError';

// API types from shared
import { Hunt, HuntCreate } from '@hunthub/shared';

// DB types
import { IHunt } from '@/database/types/Hunt';
```

---

## Two Type Systems

| Type | Location | Used By |
|------|----------|---------|
| DB types (`IHunt`) | `database/types/` | Mongoose schemas |
| API types (`Hunt`) | `@hunthub/shared` | Services, controllers |

**Convert via `toJSON()`** - Services always return API types.

---

## Null vs Undefined (Backend)

**Use `null` for absent values. Don't convert.**

- JSON uses `null`
- MongoDB returns `null`
- OpenAPI uses `nullable: true`

```typescript
// Types use null
interface Hunt {
  liveVersion: number | null;
}

// Check both
if (value == null) { }  // catches null OR undefined
const safe = value ?? defaultValue;
```

---

## MongoDB Patterns

### Atomic Updates (Avoid Race Conditions)

```typescript
// BAD - gap between read and write
const progress = await getProgress(sessionId);
if (progress.hintsUsed >= 1) throw new Error('Limit');
await incrementHints(sessionId);

// GOOD - atomic
const result = await ProgressModel.findOneAndUpdate(
  { sessionId, 'steps.hintsUsed': { $lt: maxHints } },
  { $inc: { 'steps.$.hintsUsed': 1 } },
  { new: true }
);
if (!result) throw new Error('Limit reached');
```

### Always Check matchedCount

```typescript
const result = await Model.updateOne(query, update);
if (result.matchedCount === 0) {
  throw new NotFoundError();
}
```

### Explicit ObjectId Conversion

```typescript
// BAD
userId: userId as unknown as mongoose.Types.ObjectId

// GOOD
userId: new mongoose.Types.ObjectId(userId)
```

### Avoid N+1 Queries

```typescript
// BAD
for (const hunt of hunts) {
  const version = await VersionModel.findOne({ huntId: hunt.id });
}

// GOOD - batch query
const versions = await VersionModel.find({ huntId: { $in: huntIds } });
const versionMap = new Map(versions.map(v => [v.huntId, v]));
```

---

## Edge Cases

### indexOf Returns -1

```typescript
// BAD - empty array returns true (-1 === -1)
return index === arr.length - 1;

// GOOD
if (index === -1) return false;
return index === arr.length - 1;
```

### Validate Before Calculation

```typescript
// BAD - NaN propagates
const distance = haversine(lat, lng, targetLat, targetLng);

// GOOD
if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
  return { isCorrect: false, feedback: 'Invalid coordinates' };
}
```

### Validate Submitted Values

```typescript
// BAD - only checks correctness
const isCorrect = submittedId === targetId;

// GOOD - also validates option exists
const validIds = options.map(o => o.id);
if (!validIds.includes(submittedId)) {
  return { isCorrect: false, feedback: 'Invalid option' };
}
```

---

## Use Enums, Not Strings

```typescript
// BAD
const isInProgress = status === 'in_progress';

// GOOD
const isInProgress = status === HuntProgressStatus.InProgress;
```

---

## SOLID in Practice

### Single Responsibility

Controllers → HTTP | Services → Logic | Models → Data

### Open/Closed (Strategy Pattern)

```typescript
// BAD - modify to add type
if (type === 'clue') { } else if (type === 'quiz') { }

// GOOD - extend without modifying
const validators = new Map<ChallengeType, IValidator>([
  [ChallengeType.Clue, new ClueValidator()],
  [ChallengeType.Quiz, new QuizValidator()],
]);
```

### Dependency Inversion (InversifyJS)

```typescript
constructor(@inject(TYPES.HuntService) private huntService: IHuntService) {}
//                                                          ^^^^^^^^^^^^
//                                          Abstraction, not concrete
```

---

## Testing

```typescript
describe('Hunt CRUD', () => {
  beforeEach(async () => {
    testUser = await createTestUser();
    mockFirebaseAuth(testUser);
  });

  it('should create hunt and return 201', async () => {
    const response = await request(app)
      .post('/api/hunts')
      .set('Authorization', `Bearer ${token}`)
      .send(huntData)
      .expect(201);

    expect(response.body).toMatchObject({ name: 'Test' });
  });
});
```

**Rules:**
- Factories for test data
- Mock external services (Firebase, S3)
- In-memory DB
- Assert status AND body
- Independent tests (no shared state)

---

## Don't Do This

- Catch errors in controllers (let middleware handle)
- Return null from services (throw NotFoundError)
- Hard-code values (use config/env)
- Bypass DI (use container.get())
- Mix DB and API types (convert via toJSON)
- Use string literals for enums