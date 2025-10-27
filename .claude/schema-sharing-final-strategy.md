# Schema Sharing: Final Strategy

**Based on your decisions and requirements.**

## Your Requirements

1. ✅ **Monorepo now** - FE and BE are coupled, will stay coupled
2. ✅ **Pattern must support decoupled projects** - Future projects might separate FE/BE
3. ✅ **Easy to keep in sync** - No manual copy-paste errors
4. ✅ **MVP in 2 months** - Can't spend weeks on tooling

## The Strategy: Monorepo with Shared Package

### Project Structure

```
hunthub/
├── package.json              # Root workspace config
├── apps/
│   ├── backend/
│   │   └── api/              # ← Backend Express API (@hunthub/api)
│   │       ├── package.json
│   │       ├── src/
│   │       └── (imports from @hunthub/shared)
│   └── frontend/
│       ├── editor/           # ← Hunt creation app (desktop)
│       │   ├── package.json
│       │   ├── src/
│       │   └── (imports from @hunthub/shared)
│       └── player/           # ← Hunt playing app (mobile)
│           ├── package.json
│           ├── src/
│           └── (imports from @hunthub/shared)
├── packages/
│   └── shared/               # ← Shared types, validation, constants (@hunthub/shared)
│       ├── package.json
│       ├── tsconfig.json
│       ├── src/
│       │   ├── types/        # Generated from OpenAPI
│       │   ├── schemas/      # Zod validation schemas
│       │   ├── constants/    # Enums, configs
│       │   └── index.ts
│       ├── openapi/
│       └── scripts/
│           └── generate.ts   # OpenAPI → Types → Zod
└── .claude/                  # Your context files
```

### Workspace Setup (npm workspaces)

**Root package.json:**
```json
{
  "name": "hunthub",
  "private": true,
  "workspaces": [
    "apps/backend/*",
    "apps/frontend/*",
    "packages/*"
  ],
  "scripts": {
    "build:shared": "npm run build --workspace=@hunthub/shared",
    "build:api": "npm run build --workspace=@hunthub/api",
    "build:all": "npm run build --workspaces --if-present",
    "dev:api": "npm run dev --workspace=@hunthub/api",
    "dev:backend": "npm run dev:api",
    "generate": "npm run generate --workspace=@hunthub/shared"
  }
}
```

**packages/shared/package.json:**
```json
{
  "name": "@hunthub/shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "generate": "ts-node scripts/generate.ts",
    "build": "tsc"
  },
  "dependencies": {
    "zod": "^3.24.1"
  }
}
```

**apps/backend/api/package.json:**
```json
{
  "name": "@hunthub/api",
  "dependencies": {
    "@hunthub/shared": "*",  // ← References local package
    "express": "...",
    // ...
  }
}
```

**apps/frontend/editor/package.json:**
```json
{
  "name": "@hunthub/editor",
  "dependencies": {
    "@hunthub/shared": "*",  // ← References local package
    "react": "...",
    // ...
  }
}
```

**apps/frontend/player/package.json:**
```json
{
  "name": "@hunthub/player",
  "dependencies": {
    "@hunthub/shared": "*",  // ← References local package
    "react": "...",
    // ...
  }
}
```

## The Generation Flow

```
┌────────────────────────────────────────────┐
│ OpenAPI YAML (single source of truth)     │
│ packages/shared/openapi/hunthub.yaml       │
└─────────────────┬──────────────────────────┘
                  │
                  │ npm run generate:types
                  ▼
┌────────────────────────────────────────────┐
│ Generate TypeScript Types                  │
│ swagger-typescript-api                     │
└─────────────────┬──────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────┐
│ packages/shared/src/types/index.ts         │
│ export interface Hunt {...}                │
│ export interface HuntCreate {...}          │
└─────────────────┬──────────────────────────┘
                  │
                  │ npm run generate:types (same script)
                  ▼
┌────────────────────────────────────────────┐
│ Generate Zod Schemas                       │
│ ts-to-zod (or custom generator)            │
└─────────────────┬──────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────────────┐
│ packages/shared/src/validation/index.ts    │
│ export const huntSchema = z.object({...})  │
│ export const huntCreateSchema = z.object() │
└─────────────────┬──────────────────────────┘
                  │
                  │ npm run build:shared
                  ▼
┌────────────────────────────────────────────┐
│ packages/shared/dist/                      │
│ ├── types/index.d.ts                       │
│ ├── validation/index.d.ts                  │
│ └── index.js                               │
└────────┬───────────────────────┬───────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ Backend imports │     │ Frontend imports│
│ @hunthub/shared │     │ @hunthub/shared │
└─────────────────┘     └─────────────────┘
```

## Usage in Code

### Backend Service

```typescript
// packages/backend/src/services/hunt.service.ts
import { Hunt, HuntCreate } from '@hunthub/shared/types';
import { huntCreateSchema } from '@hunthub/shared/validation';

export class HuntService {
  async createHunt(data: HuntCreate, userId: string): Promise<Hunt> {
    // data is already typed
    // validation happened in middleware using huntCreateSchema
    const hunt = await HuntModel.create({ ...data, creatorId: userId });
    return hunt.toJSON() as Hunt;
  }
}
```

### Backend Middleware

```typescript
// packages/backend/src/middlewares/validation.middleware.ts
import { huntCreateSchema } from '@hunthub/shared/validation';

router.post('/hunts',
  validateRequest(huntCreateSchema), // Zod validation
  controller.createHunt
);
```

### Frontend Form

```typescript
// packages/frontend/src/pages/CreateHunt.tsx
import { HuntCreate } from '@hunthub/shared/types';
import { huntCreateSchema } from '@hunthub/shared/validation';
import { zodResolver } from '@hookform/resolvers/zod';

const CreateHuntForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<HuntCreate>({
    resolver: zodResolver(huntCreateSchema) // Same validation!
  });

  const onSubmit = async (data: HuntCreate) => {
    // data is typed as HuntCreate
    await api.post('/hunts', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
};
```

## Will Schemas Diverge Between FE and BE?

**Short answer: Sometimes, yes.**

### Same Schemas For

✅ **User input validation:**
```typescript
// Both FE and BE use same schema
export const huntCreateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  // ...
});
```

✅ **API request/response types:**
```typescript
// Both use same interfaces
export interface Hunt {
  id: string;
  name: string;
  // ...
}
```

### Different Schemas For

❌ **UI-specific validation:**
```typescript
// Frontend only (packages/frontend/src/validation/)
export const huntFormSchema = huntCreateSchema.extend({
  confirmPublish: z.boolean(), // UI checkbox
  previewMode: z.boolean(),    // UI state
});
```

❌ **Backend-specific validation:**
```typescript
// Backend only (packages/backend/src/validation/)
export const huntCreateWithAuthSchema = huntCreateSchema.extend({
  creatorId: z.string().uuid(), // Added by backend
});
```

❌ **Database-specific types:**
```typescript
// Backend only (packages/backend/src/db/types/)
export interface IHunt {
  _id: mongoose.Types.ObjectId; // Mongo-specific
  stepOrder: mongoose.Types.ObjectId[]; // References
  // ...
}
```

### The Pattern

**Shared package:** Core types and validation (80% of schemas)
**Frontend:** Extends shared for UI-specific needs (10%)
**Backend:** Extends shared for DB/auth-specific needs (10%)

```typescript
// In shared
export const baseHuntSchema = z.object({
  name: z.string(),
  // ...
});

// In frontend (if needed)
export const huntFormSchema = baseHuntSchema.extend({
  uiSpecificField: z.boolean()
});

// In backend (if needed)
export const huntDatabaseSchema = baseHuntSchema.extend({
  creatorId: z.string().uuid()
});
```

**This is normal and healthy separation of concerns.**

## Keeping It In Sync

### Automatic (Recommended)

**Git hooks (Husky):**
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run generate:types && git add packages/shared/src"
    }
  }
}
```

**CI/CD check:**
```yaml
# .github/workflows/check-types.yml
- name: Check types are in sync
  run: |
    npm run generate:types
    git diff --exit-code packages/shared/src
```

### Manual (Fallback)

**Script to check:**
```bash
npm run generate:types
# If types changed, commit them
```

**Developers run before committing changes to OpenAPI schema.**

## Supporting Decoupled Projects (Future)

**This pattern DOES support decoupled FE/BE for future projects:**

### Option A: Keep Monorepo Pattern

```
future-project/
├── packages/
│   ├── shared/      # ← Same pattern
│   ├── backend/     # Deployed separately
│   └── frontend/    # Deployed separately
```

**Works for separate deployments. Still same repo.**

### Option B: Generate for Frontend

**If you truly decouple (separate repos):**

```bash
# In backend repo
npm run generate:types
npm run export:types  # Copies to /types-export

# Frontend fetches types
curl backend.com/types-export/types.ts > src/types/generated/
```

**This is what your "generation" fallback plan enables.**

### Option C: Publish to NPM

```bash
# Backend publishes
npm publish @hunthub/types

# Frontend installs
npm install @hunthub/types
```

**Most scalable, most overhead.**

## Decision Summary

**For HuntHub (now):**
- ✅ Monorepo with shared package
- ✅ OpenAPI → TS → Zod generation
- ✅ Both FE and BE import from `@hunthub/shared`
- ✅ Automatic sync via git hooks
- ✅ Core schemas shared, extend as needed

**For future projects (if decoupled):**
- You CAN use generation approach (Option B above)
- You CAN use NPM publish (Option C above)
- The PATTERN is reusable, just change distribution method

**Migration path:** Monorepo → Separate repos is easy. Just change how shared package is consumed.

## Setup Timeline

**Estimated time to set up:**
- Workspace structure: 30 minutes
- Move existing code: 1 hour
- Generation scripts: 2 hours
- Testing: 1 hour

**Total: ~4-5 hours**

**Worth it?** YES - saves hours of manual sync and prevents bugs.

## Action Items

- [ ] Create workspace structure
- [ ] Move backend to `packages/backend`
- [ ] Create `packages/shared` with generation
- [ ] Configure imports
- [ ] Test build process
- [ ] Add to template documentation

## Example: Complete Shared Package

**packages/shared/src/index.ts:**
```typescript
// Re-export everything
export * from './types';
export * from './validation';
export * from './constants';
```

**packages/shared/src/types/index.ts:**
```typescript
// Generated from OpenAPI
export interface Hunt {
  id: string;
  name: string;
  // ...
}

export interface HuntCreate {
  name: string;
  // ...
}
// ... all other types
```

**packages/shared/src/validation/index.ts:**
```typescript
import { z } from 'zod';

export const huntCreateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  // ...
});

export const huntSchema = huntCreateSchema.extend({
  id: z.string(),
  creatorId: z.string(),
  // ...
});

// ... all other schemas
```

**packages/shared/src/constants/index.ts:**
```typescript
export enum HuntStatus {
  Draft = 'draft',
  Review = 'review',
  Published = 'published'
}

export const MAX_STEPS_PER_HUNT = 50;
export const FREE_TIER_HUNT_LIMIT = 2;
// ... other constants
```

---

## Future Enhancement: Full OpenAPI Spec with Endpoint Types

**Current MVP approach:** Schema-only OpenAPI (types only, no endpoint definitions)

**Future enhancement:** Add full API contract with typed endpoints

### Why Add This Later?

**When you might want it:**
- Multiple developers working on FE/BE separately
- Need clear API contract documentation
- Want automated API documentation (Swagger UI)
- Want to validate backend matches OpenAPI spec
- Building public API for third parties

**For MVP:** Skip this - adds complexity without much benefit when you control both FE and BE

---

### Current Setup (Schema-Only)

**OpenAPI:**
```yaml
paths: {}  # ← Empty - no endpoints defined

components:
  schemas:
    Hunt:
      type: object
      properties:
        id: { type: string }
        name: { type: string }

    HuntCreate:
      type: object
      properties:
        name: { type: string }
```

**Generation script:**
```typescript
// packages/shared/scripts/generate.ts
await generateApi({
  input: './openapi/hunthub_models.yaml',
  output: './src/types',
  name: 'index.ts',

  generateClient: false,
  generateRouteTypes: false,
  extractRequestParams: false,      // ← No extraction
  extractRequestBody: false,        // ← No extraction
  extractResponseBody: false,       // ← No extraction
});
```

**Generates:**
```typescript
// Clean schema types only
export interface Hunt {
  id: string;
  name: string;
}

export interface HuntCreate {
  name: string;
}
```

**Frontend writes manual API client:**
```typescript
// packages/frontend/src/api/hunts.ts
import { Hunt, HuntCreate } from '@hunthub/shared/types';

export const huntsApi = {
  create: async (data: HuntCreate): Promise<Hunt> => {
    return axios.post('/api/hunts', data);
  },

  getById: async (id: string): Promise<Hunt> => {
    return axios.get(`/api/hunts/${id}`);
  },
};
```

---

### Future Enhancement (Full OpenAPI Spec)

**Step 1: Add paths to OpenAPI**

```yaml
paths:
  /api/hunts:
    post:
      operationId: createHunt
      summary: Create a new hunt
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/HuntCreate'
      responses:
        '201':
          description: Hunt created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Hunt'
        '400':
          description: Invalid input
        '401':
          description: Unauthorized

  /api/hunts/{id}:
    get:
      operationId: getHuntById
      summary: Get hunt by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Hunt found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Hunt'
        '404':
          description: Hunt not found

    put:
      operationId: updateHunt
      summary: Update hunt
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/HuntUpdate'
      responses:
        '200':
          description: Hunt updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Hunt'

    delete:
      operationId: deleteHunt
      summary: Delete hunt
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Hunt deleted successfully

components:
  schemas:
    Hunt: { ... }
    HuntCreate: { ... }
    HuntUpdate:
      type: object
      properties:
        name: { type: string }
        description: { type: string }
```

**Step 2: Update generation script to enable extraction**

```typescript
// packages/shared/scripts/generate.ts
await generateApi({
  input: './openapi/hunthub_models.yaml',
  output: './src/types',
  name: 'index.ts',

  generateClient: false,              // Still no HTTP client
  generateRouteTypes: true,           // ← Enable endpoint types
  extractRequestParams: true,         // ← Enable
  extractRequestBody: true,           // ← Enable
  extractResponseBody: true,          // ← Enable
  extractResponseError: true,         // ← Enable

  // Clean output
  cleanOutput: true,
  modular: false,
});
```

**Step 3: Generates endpoint types**

```typescript
// packages/shared/src/types/index.ts

// Schema types (same as before)
export interface Hunt {
  id: string;
  name: string;
  creatorId: string;
}

export interface HuntCreate {
  name: string;
  description?: string;
}

export interface HuntUpdate {
  name?: string;
  description?: string;
}

// NEW: Endpoint types
export namespace Hunts {
  /**
   * POST /api/hunts
   * Create a new hunt
   */
  export namespace CreateHunt {
    export type RequestBody = HuntCreate;
    export type Response = Hunt;
    export type ErrorResponse = { message: string };
  }

  /**
   * GET /api/hunts/{id}
   * Get hunt by ID
   */
  export namespace GetHuntById {
    export interface PathParams {
      id: string;
    }
    export type Response = Hunt;
    export type ErrorResponse = { message: string };
  }

  /**
   * PUT /api/hunts/{id}
   * Update hunt
   */
  export namespace UpdateHunt {
    export interface PathParams {
      id: string;
    }
    export type RequestBody = HuntUpdate;
    export type Response = Hunt;
  }

  /**
   * DELETE /api/hunts/{id}
   * Delete hunt
   */
  export namespace DeleteHunt {
    export interface PathParams {
      id: string;
    }
    export type Response = void;
  }
}
```

**Step 4: Frontend uses generated endpoint types**

```typescript
// packages/frontend/src/api/hunts.ts
import { Hunts } from '@hunthub/shared/types';
import { api } from './client';

export const huntsApi = {
  create: async (
    data: Hunts.CreateHunt.RequestBody
  ): Promise<Hunts.CreateHunt.Response> => {
    const response = await api.post<Hunts.CreateHunt.Response>(
      '/api/hunts',
      data
    );
    return response.data;
  },

  getById: async (
    params: Hunts.GetHuntById.PathParams
  ): Promise<Hunts.GetHuntById.Response> => {
    const response = await api.get<Hunts.GetHuntById.Response>(
      `/api/hunts/${params.id}`
    );
    return response.data;
  },

  update: async (
    params: Hunts.UpdateHunt.PathParams,
    data: Hunts.UpdateHunt.RequestBody
  ): Promise<Hunts.UpdateHunt.Response> => {
    const response = await api.put<Hunts.UpdateHunt.Response>(
      `/api/hunts/${params.id}`,
      data
    );
    return response.data;
  },

  delete: async (
    params: Hunts.DeleteHunt.PathParams
  ): Promise<void> => {
    await api.delete(`/api/hunts/${params.id}`);
  },
};
```

---

### Benefits of Full OpenAPI Spec

**Single source of truth:**
- ✅ OpenAPI defines data types AND endpoints
- ✅ Frontend and backend must match spec
- ✅ Breaking changes caught immediately

**Better type safety:**
- ✅ Path parameters typed (can't pass wrong type)
- ✅ Request/response bodies explicitly typed
- ✅ Error responses typed

**Auto-documentation:**
- ✅ Generate Swagger UI docs automatically
- ✅ API docs always up to date
- ✅ Interactive API explorer

**Validation:**
- ✅ Can validate backend routes match OpenAPI
- ✅ Can validate frontend calls match OpenAPI
- ✅ CI/CD can catch mismatches

**Example CI/CD check:**
```yaml
# .github/workflows/validate-api.yml
- name: Validate backend matches OpenAPI
  run: |
    npm run generate:types
    npm run validate:api-spec
    # Fails if backend routes don't match OpenAPI
```

---

### Trade-offs

**Schema-only (MVP - current):**
- ✅ Simple and fast
- ✅ Less to maintain
- ✅ Frontend has full flexibility
- ❌ No single source of truth for endpoints
- ❌ Manual API client code

**Full OpenAPI spec (Future):**
- ✅ Single source of truth
- ✅ Better type safety
- ✅ Auto-generated documentation
- ❌ More to maintain
- ❌ Must update OpenAPI for every endpoint change
- ❌ Less frontend flexibility

---

### Migration Path

**When you're ready to add full spec:**

1. **Add one endpoint at a time:**
   ```yaml
   paths:
     /api/hunts:
       post: { ... }  # Start with one
   ```

2. **Enable extraction flags**

3. **Generate and test**

4. **Update frontend to use generated types**

5. **Add remaining endpoints incrementally**

6. **Add to CI/CD pipeline**

**No need to do everything at once** - can migrate endpoint by endpoint

---

### Alternative: Fully Generated Client

**If you want even MORE automation:**

Use a different tool like **openapi-typescript-codegen** or **orval**:

```bash
npm install --save-dev @hey-api/openapi-typescript-codegen
```

**Generates complete typed API client:**

```typescript
// Fully generated - no manual API client code!
import { HuntsService } from '@hunthub/shared/api';

// All typed, auto-generated from OpenAPI
const hunt = await HuntsService.createHunt({ name: 'Barcelona' });
const hunt2 = await HuntsService.getHuntById('123');
await HuntsService.updateHunt('123', { name: 'New name' });
await HuntsService.deleteHunt('123');
```

**Pros:**
- ✅ Zero manual API client code
- ✅ Perfect type safety
- ✅ Changes automatically on OpenAPI update

**Cons:**
- ❌ Less control over client behavior
- ❌ Harder to customize (interceptors, auth, etc.)
- ❌ More complex generated code

---

### Recommendation

**For HuntHub MVP:**
- ✅ Keep schema-only OpenAPI (current approach)
- ✅ Manual frontend API client (simple, flexible)
- ✅ Revisit after MVP is working

**Add full OpenAPI spec when:**
- Multiple developers need clear API contract
- Want automated API documentation
- Building public API
- Need strict validation in CI/CD

**This documentation ensures you won't forget the option exists!**

---

**This is your schema sharing strategy. It's solid, scalable, and template-ready.**
