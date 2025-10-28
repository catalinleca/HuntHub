# Schema & Validation Strategy

**The Problem:** How do we share type definitions and validation between backend and frontend while maintaining proper validation at all layers?

**Your principle (excellent!):**
- **UI validation** - Because users will be users
- **API validation** - Because hackers will be hackers
- **DB validation** - Because data integrity matters, and developers will be developers

## Current Approach (Analyzed from Code)

### 1. OpenAPI as Source of Truth

**File:** `src/openapi/hunthub_models.yaml`

```yaml
components:
  schemas:
    Hunt:
      type: object
      properties:
        id: string
        creatorId: string
        name: string
        # ...
```

**Why OpenAPI first:**
- Language-agnostic schema definition
- Can generate types for both BE and FE
- Standard for API documentation
- Tooling support

### 2. Type Generation (Backend)

**Script:** `npm run schemagen`

**What it does:**
```
hunthub_models.yaml
      ↓
swagger-typescript-api
      ↓
src/openapi/HuntHubTypes.ts
```

**Generated types:**
```typescript
export interface Hunt {
  id: string;
  creatorId: string;
  name: string;
  // ... API-facing types
}
```

### 3. Zod Schema Generation (Planned)

**Script:** `npm run generate-zodies`

**What it would do:**
```
src/openapi/HuntHubTypes.ts
      ↓
ts-to-zod
      ↓
src/utils/validation/schemas.ts
```

**Generated Zod schemas:**
```typescript
export const HuntSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  name: z.string(),
  // ...
});
```

### 4. Database Types (Separate)

**File:** `src/database/types/Hunt.ts`

```typescript
export interface IHunt {
  id: string;
  creatorId: string;
  name: string;
  stepOrder?: mongoose.Types.ObjectId[];
  // ... DB-specific fields
}
```

**Why separate:**
- DB types have Mongoose-specific fields (ObjectId, refs)
- API types are serialized (strings instead of ObjectIds)
- Different concerns

### 5. Mongoose Schemas

**File:** `src/database/models/Hunt.ts`

```typescript
const huntSchema = new Schema<IHunt>({
  creatorId: { type: String, required: true },
  name: { type: String, required: true },
  // ... Mongoose validation
});
```

**Validation:**
- Required fields
- Type validation
- Custom validators
- Indexes

## The Complete Flow

```
┌─────────────────────────────────────────────┐
│  1. OpenAPI YAML (hunthub_models.yaml)      │
│     Source of truth for API contracts       │
└──────────────┬──────────────────────────────┘
               │
               ├────────────────┬─────────────────┐
               ▼                ▼                 ▼
    ┌──────────────────┐  ┌─────────────┐  ┌────────────┐
    │ TypeScript Types │  │ Zod Schemas │  │ Frontend   │
    │ (BE + FE)        │  │ (BE + FE?)  │  │ (planned)  │
    └──────────────────┘  └─────────────┘  └────────────┘
               │                 │
               ▼                 ▼
    ┌──────────────────┐  ┌─────────────┐
    │ DB Types (IHunt) │  │ Validation  │
    │ (Mongoose)       │  │ Middleware  │
    └──────────────────┘  └─────────────┘
               │                 │
               ▼                 ▼
    ┌──────────────────┐  ┌─────────────┐
    │ Mongoose Schema  │  │ API Endpoint│
    │ (DB validation)  │  │ (validated) │
    └──────────────────┘  └─────────────┘
```

## Three-Layer Validation

### Layer 1: UI Validation (Frontend)

**Purpose:** Immediate user feedback

**Tools:**
- React Hook Form
- Zod schemas (shared from backend?)
- Custom validators

**Example:**
```typescript
// In React component
const formSchema = HuntCreateSchema; // Imported from shared package?

<form onSubmit={handleSubmit(onSubmit)}>
  <input
    {...register("name", {
      required: "Hunt name is required",
      minLength: { value: 3, message: "Too short" }
    })}
  />
</form>
```

**Validates:**
- Required fields
- Format (email, URL, etc.)
- Length constraints
- Pattern matching

### Layer 2: API Validation (Backend)

**Purpose:** Security - don't trust client

**Tools:**
- Zod schemas
- Validation middleware

**Example:**
```typescript
// In router
router.post('/hunts',
  validateRequest(createHuntSchema), // Zod validation
  controller.createHunt
);

// Middleware
export const validateRequest = (schema: ZodSchema) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError('Invalid data', error.errors));
      }
    }
  };
```

**Validates:**
- Same as UI (can't trust client)
- Additional business rules
- Authorization checks
- Rate limiting

### Layer 3: Database Validation (Mongoose)

**Purpose:** Data integrity, last line of defense

**Tools:**
- Mongoose schema validation
- Custom validators
- Unique constraints
- Indexes

**Example:**
```typescript
const huntSchema = new Schema<IHunt>({
  name: {
    type: String,
    required: true,
    trim: true,
    minLength: 3,
    maxLength: 100
  },
  creatorId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: Object.values(HuntStatus),
    default: HuntStatus.Draft
  }
});

// Custom validator
huntSchema.path('stepOrder').validate(function(value) {
  return value.length <= 50; // Max 50 steps
}, 'Too many steps');
```

**Validates:**
- Type correctness
- Constraints
- Uniqueness
- Referential integrity (via refs)

## Sharing Schemas: Backend ↔ Frontend

**Challenge:** How to share types and validation without duplication?

### Option 1: Monorepo with Shared Package (Recommended)

```
hunthub/
├── packages/
│   ├── shared/
│   │   ├── types/          # Generated from OpenAPI
│   │   ├── validation/     # Zod schemas
│   │   └── constants/      # Enums, etc.
│   ├── backend/
│   │   └── (imports from shared)
│   └── frontend/
│       └── (imports from shared)
```

**Pros:**
- Single source of truth
- TypeScript enforces consistency
- No duplication
- Easy to keep in sync

**Cons:**
- More complex setup
- Need workspace tool (yarn workspaces, npm workspaces, pnpm)

### Option 2: Generate for Frontend from Backend

```
backend/
├── openapi/
│   └── hunthub_models.yaml
└── scripts/
    └── generate-frontend-types.sh
        ↓
frontend/
└── src/types/generated/
    ├── types.ts
    └── schemas.ts
```

**Pros:**
- Backend remains source of truth
- Simpler than monorepo
- Works with current setup

**Cons:**
- Manual generation step
- Types can get out of sync
- Need build process coordination

### Option 3: Publish NPM Package

```
@hunthub/types (private npm package)
      ↓
Both backend and frontend import
```

**Pros:**
- Clean separation
- Version control for types
- Standard approach

**Cons:**
- Overkill for small project
- Publishing overhead
- Not great for rapid iteration

### Option 4: Duplicate (Not Recommended)

**Don't do this** - leads to drift and bugs

## Recommended Approach for HuntHub

**For MVP (Current):**

1. Keep OpenAPI as source of truth
2. Generate types for backend (already doing)
3. Manually copy types to frontend for now
4. Generate Zod schemas from types

**For Production (Later):**

1. Set up monorepo with shared package
2. Both BE and FE import from `@hunthub/shared`
3. CI/CD validates types are in sync

## OpenAPI → TypeScript → Zod Workflow

```yaml
# hunthub_models.yaml
components:
  schemas:
    HuntCreate:
      type: object
      properties:
        name:
          type: string
          minLength: 3
          maxLength: 100
        description:
          type: string
      required:
        - name
```

**Step 1: Generate Types**
```bash
npm run schemagen
```

```typescript
// Generated: HuntHubTypes.ts
export interface HuntCreate {
  name: string;
  description?: string;
}
```

**Step 2: Generate Zod (manual for now)**
```typescript
// src/utils/validation/schemas/hunt.schema.ts
import { z } from 'zod';

export const createHuntSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional()
});

export type HuntCreateInput = z.infer<typeof createHuntSchema>;
```

**Step 3: Use in Validation Middleware**
```typescript
router.post('/hunts',
  validateRequest(createHuntSchema),
  controller.createHunt
);
```

**Step 4: Use in Services**
```typescript
async createHunt(hunt: HuntCreate, creatorId: string): Promise<Hunt> {
  // hunt is already validated by middleware
  const created = await HuntModel.create({
    creatorId,
    ...hunt
  });
  return created.toJSON() as Hunt;
}
```

## Key Decisions Needed

### 1. Monorepo now or later?

**Question:** Should we set up shared package structure now?

**Options:**
- a) Now (better architecture from start)
- b) Later (simpler for MVP)

**Recommendation:** Later - keep it simple for now

### 2. Where to generate Zod schemas?

**Question:** Backend only or shared?

**Options:**
- a) Backend only (current approach)
- b) Generate once, share with frontend
- c) Generate twice (once for BE, once for FE)

**Recommendation:** [TO BE DECIDED]

### 3. Manual or automated sync?

**Question:** How to keep types in sync?

**Options:**
- a) Manual copy (error-prone)
- b) Git submodule
- c) Automated script in CI/CD

**Recommendation:** [TO BE DECIDED]

## Implementation TODO

- [ ] Complete Zod schema generation for all models
- [ ] Set up validation middleware for all endpoints
- [ ] Decide on frontend type-sharing strategy
- [ ] Document the chosen workflow
- [ ] Add validation to all Mongoose schemas
- [ ] Create validation error response format standard
- [ ] Add API validation tests
