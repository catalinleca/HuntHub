# Backend Code Patterns & Conventions

## File Naming

- **Models:** PascalCase - `Hunt.ts`, `User.ts`
- **Services:** camelCase - `hunt.service.ts`, `auth.service.ts`
- **Controllers:** camelCase - `hunt.controller.ts`
- **Routes:** camelCase - `hunt.router.ts`, `auth.routes.ts`
- **Middlewares:** camelCase - `auth.middleware.ts`
- **Types:** PascalCase - `Hunt.ts`, `User.ts`

## Code Patterns

### Service Pattern

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

### Controller Pattern

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

### Router Pattern

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
- Use asyncHandler to catch errors (or similar pattern)

### Model Pattern

```typescript
import { Schema, model } from 'mongoose';
import { IHunt, HuntStatus } from '../types/Hunt';

const huntSchema: Schema<IHunt> = new Schema<IHunt>(
  {
    creatorId: { type: String, required: true },
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

const Hunt = model('Hunt', huntSchema);

export default Hunt;
```

**Key conventions:**
- Import interface from types/
- Type schema with interface: `Schema<IHunt>`
- Enable timestamps: `{ timestamps: true }`
- Define indexes for frequently queried fields
- Use enums for status fields
- Use `{ type: String, ref: 'ModelName' }` for references

### Error Handling Pattern

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

### Validation Pattern

**Strategy:** Import Zod schemas from `@hunthub/shared/schemas`, extend for backend-specific needs

**Shared package provides:**
- Base Zod schemas generated from OpenAPI
- TypeScript types inferred from Zod schemas
- Shared between frontend and backend

**Backend validation structure:**
```
src/validation/
├── schemas/
│   ├── auth.schema.ts    # Backend-specific auth validation
│   ├── hunt.schema.ts    # Re-exports + extends shared hunt schemas
│   ├── user.schema.ts    # Re-exports + extends shared user schemas
│   └── step.schema.ts    # Step-specific validation
└── index.ts              # Barrel exports
```

**Example: Hunt validation schema**
```typescript
// src/validation/schemas/hunt.schema.ts
import { HuntCreate, Hunt, HuntStatus } from '@hunthub/shared/schemas';

// Re-export base schemas from shared
export { Hunt, HuntCreate, HuntStatus };

// Create backend-specific variants
export const createHuntSchema = HuntCreate;
export const updateHuntSchema = HuntCreate.partial();

// Backend-specific validation (if needed)
export const huntWithAuthSchema = HuntCreate.extend({
  creatorId: z.string().uuid(), // Added by backend
});
```

**Example: Backend-only auth validation**
```typescript
// src/validation/schemas/auth.schema.ts
import { z } from 'zod';

// These schemas are backend-only (not in shared)
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
});
```

**Usage in routes:**
```typescript
import { createHuntSchema } from '@/validation';

router.post('/',
  validateRequest(createHuntSchema),
  controller.createHunt
);
```

**Validation middleware:**
```typescript
// src/middlewares/validation.middleware.ts
export const validateRequest = (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Validation failed', error.errors));
      }
    }
  };
```

**Key conventions:**
- ✅ Import base schemas from `@hunthub/shared/schemas`
- ✅ Re-export shared schemas for consistency
- ✅ Create domain-specific schema files (hunt.schema.ts, user.schema.ts)
- ✅ Use `.partial()` for update schemas
- ✅ Use `.extend()` for backend-specific additions
- ✅ Backend-only schemas (like auth) stay in backend
- ✅ Barrel export from `validation/index.ts`
- ✅ Use `validateRequest()` middleware in routes

**Schema sharing strategy:**
- **Core domain schemas** (Hunt, User, Step) → Defined in `@hunthub/shared/schemas`
- **Backend-specific** (auth, internal validation) → Defined in `src/validation/schemas/`
- **Frontend-specific** (form state, UI) → Stay in frontend

**Type inference:**
```typescript
import { HuntCreate } from '@hunthub/shared/schemas';
import type { z } from 'zod';

// TypeScript type is automatically inferred from Zod schema
type HuntCreateType = z.infer<typeof HuntCreate>;
```

### Type Patterns

**Two type systems:**

1. **Database types** (`src/db/types/`) - Used by Mongoose
```typescript
export interface IHunt {
  id: string;
  creatorId: string;
  name: string;
  // ... mongoose-specific fields
}
```

2. **API types** (`src/openapi/`) - Generated from OpenAPI, used by API
```typescript
export interface Hunt {
  id: string;
  creatorId: string;
  name: string;
  // ... API-facing fields
}
```

**Convention:**
- Services return API types (Hunt)
- Models use DB types (IHunt)
- Convert via `.toJSON()` method

### Import Patterns

```typescript
// Module aliases
import { HuntModel } from '@db/models';
import { IHuntService } from '@/services/hunt.service';

// Relative imports for nearby files
import { NotFoundError } from './errors/NotFoundError';

// Types from OpenAPI
import { Hunt, HuntCreate } from '@/openapi/HuntHubTypes';

// DB types
import { IHunt } from '@db/types/Hunt';
```

## Testing Patterns

**Framework:** Jest + Supertest + MongoDB Memory Server

**Test Structure:**
```
tests/
├── integration/
│   └── hunts/
│       └── huntCrud.test.ts        # Integration tests for hunt endpoints
├── setup/
│   ├── testServer.ts               # Test Express app setup
│   ├── testDatabase.ts             # MongoDB Memory Server setup
│   ├── env.setup.ts                # Environment variables for tests
│   ├── jest.setup.ts               # Jest configuration
│   └── factories/
│       ├── user.factory.ts         # Test user creation
│       └── hunt.factory.ts         # Test hunt creation
└── helpers/
    ├── authHelper.ts               # Firebase auth mocking
    ├── dbHelper.ts                 # Database utilities
    └── assertionHelper.ts          # Custom assertions
```

### Integration Test Pattern

**Example: Hunt CRUD test**
```typescript
import request from 'supertest';
import { Express } from 'express';
import { createTestApp } from '../../setup/testServer';
import { createTestUser } from '../../setup/factories/user.factory';
import { createTestHunt, generateHuntData } from '../../setup/factories/hunt.factory';
import { mockFirebaseAuth, createTestAuthToken } from '../../helpers/authHelper';

describe('Hunt CRUD Integration Tests', () => {
  let app: Express;
  let testUser: IUser;
  let authToken: string;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(async () => {
    // Create test user
    testUser = await createTestUser({
      email: 'test@example.com',
      firstName: 'Test',
    });

    // Mock Firebase auth
    mockFirebaseAuth(testUser);
    authToken = createTestAuthToken(testUser);
  });

  afterEach(() => {
    clearFirebaseAuthMocks();
  });

  describe('POST /api/hunts - Create Hunt', () => {
    it('should create a new hunt and return 201', async () => {
      const huntData = generateHuntData({
        name: 'Barcelona Adventure',
      });

      const response = await request(app)
        .post('/api/hunts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(huntData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'Barcelona Adventure',
        status: HuntStatus.Draft,
        creatorId: testUser.id,
      });
    });

    it('should return 401 when no auth token provided', async () => {
      await request(app)
        .post('/api/hunts')
        .send(generateHuntData())
        .expect(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/hunts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}) // Empty body
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);
    });
  });
});
```

### Test Factories Pattern

**Purpose:** Create test data consistently and easily

**Example: User factory**
```typescript
// tests/setup/factories/user.factory.ts
import { faker } from '@faker-js/faker';
import UserModel from '@db/models/User';
import { IUser } from '@db/types/User';

export const generateUserData = (overrides?: Partial<IUser>) => ({
  firebaseUid: faker.string.uuid(),
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  displayName: faker.internet.username(),
  ...overrides,
});

export const createTestUser = async (overrides?: Partial<IUser>): Promise<IUser> => {
  const userData = generateUserData(overrides);
  const user = await UserModel.create(userData);
  return user.toJSON() as IUser;
};
```

**Example: Hunt factory**
```typescript
// tests/setup/factories/hunt.factory.ts
import { faker } from '@faker-js/faker';
import HuntModel from '@db/models/Hunt';
import { IHunt } from '@db/types/Hunt';
import { HuntStatus } from '@hunthub/shared';

export const generateHuntData = (overrides?: Partial<IHunt>) => ({
  name: faker.lorem.words(3),
  description: faker.lorem.sentence(),
  status: HuntStatus.Draft,
  currentVersion: 1,
  stepOrder: [],
  ...overrides,
});

export const createTestHunt = async (overrides?: Partial<IHunt>): Promise<IHunt> => {
  const huntData = generateHuntData(overrides);
  const hunt = await HuntModel.create(huntData);
  return hunt.toJSON() as IHunt;
};
```

### Auth Mocking Pattern

**Purpose:** Mock Firebase authentication in tests

```typescript
// tests/helpers/authHelper.ts
import { DecodedIdToken } from 'firebase-admin/auth';
import * as admin from 'firebase-admin';

export const mockFirebaseAuth = (user: IUser) => {
  const decodedToken: DecodedIdToken = {
    uid: user.firebaseUid,
    email: user.email,
    // ... other token fields
  };

  jest.spyOn(admin.auth(), 'verifyIdToken')
    .mockResolvedValue(decodedToken);
};

export const createTestAuthToken = (user: IUser): string => {
  return `test-token-${user.firebaseUid}`;
};

export const clearFirebaseAuthMocks = () => {
  jest.restoreAllMocks();
};
```

### Database Setup Pattern

**In-memory MongoDB for tests:**
```typescript
// tests/setup/testDatabase.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export const setupTestDatabase = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
};

export const teardownTestDatabase = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

export const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};
```

**Jest setup:**
```typescript
// tests/setup/jest.setup.ts
import { setupTestDatabase, teardownTestDatabase, clearDatabase } from './testDatabase';

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

beforeEach(async () => {
  await clearDatabase();
});
```

### Test Organization Conventions

**File naming:**
- Integration tests: `*.test.ts`
- Unit tests: `*.spec.ts` (when added)
- Factories: `*.factory.ts`
- Helpers: `*Helper.ts`

**Test grouping:**
- Use `describe()` for endpoint grouping
- Use nested `describe()` for HTTP method grouping
- Each test should be atomic and independent

**What to test:**
- ✅ Happy paths (successful operations)
- ✅ Error cases (validation, not found, unauthorized)
- ✅ Authentication/authorization
- ✅ Edge cases
- ✅ Data integrity

**What NOT to test:**
- ❌ Third-party libraries (Mongoose, Express)
- ❌ Framework internals
- ❌ Simple getters/setters

### Test Naming Conventions

**Format:** `should [expected behavior] when [condition]`

**Examples:**
- ✅ `should create a new hunt and return 201`
- ✅ `should return 401 when no auth token provided`
- ✅ `should validate required fields`
- ✅ `should return 404 when hunt does not exist`
- ✅ `should return 403 when trying to update another user's hunt`

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test huntCrud.test.ts

# Run with coverage
npm test -- --coverage

# Clear Jest cache (if encountering issues)
npx jest --clearCache
```

### Key Testing Conventions

- ✅ Use factories to create test data
- ✅ Mock external services (Firebase, S3, etc.)
- ✅ Use in-memory database for speed
- ✅ Clean database between tests
- ✅ Test validation middleware integration
- ✅ Test authentication/authorization
- ✅ Use supertest for HTTP testing
- ✅ Assert on response status AND body
- ✅ Keep tests independent (no shared state)

## Documentation Patterns

**[TO BE DEFINED]**
- Use JSDoc for complex functions?
- API docs via Swagger UI?

## Don't Do This

❌ **Don't catch errors in controllers** - Let error middleware handle it
❌ **Don't use serializers** - Use toJSON() instead
❌ **Don't return null from services** - Throw NotFoundError
❌ **Don't hard-code values** - Use config/env
❌ **Don't bypass DI** - Always use container.get()
❌ **Don't mix DB and API types** - Convert via toJSON()
