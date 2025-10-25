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

```typescript
// Define Zod schema
import { z } from 'zod';

export const createHuntSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  startLocation: locationSchema.optional(),
});

// Use in router
router.post('/',
  validateRequest(createHuntSchema),
  controller.createHunt
);
```

**Key conventions:**
- Define schemas in `utils/validation/schemas/`
- Use Zod for runtime validation
- Validation middleware returns formatted errors
- OpenAPI → TypeScript → Zod workflow

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

**[TO BE DEFINED]**
- No tests exist yet
- Need to establish testing patterns

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
