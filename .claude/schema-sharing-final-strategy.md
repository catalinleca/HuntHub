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
├── packages/
│   ├── shared/               # ← Shared types, validation, constants
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── types/        # Generated from OpenAPI
│   │   │   ├── validation/   # Zod schemas
│   │   │   ├── constants/    # Enums, configs
│   │   │   └── index.ts
│   │   └── scripts/
│   │       └── generate.ts   # OpenAPI → Types → Zod
│   ├── backend/
│   │   ├── package.json
│   │   ├── src/
│   │   └── (imports from @hunthub/shared)
│   └── frontend/
│       ├── package.json
│       ├── src/
│       └── (imports from @hunthub/shared)
└── .claude/                  # Your context files
```

### Workspace Setup (npm workspaces)

**Root package.json:**
```json
{
  "name": "hunthub",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build:shared": "npm run build --workspace=@hunthub/shared",
    "build:all": "npm run build:shared && npm run build --workspaces",
    "generate:types": "npm run generate --workspace=@hunthub/shared"
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

**packages/backend/package.json:**
```json
{
  "name": "@hunthub/backend",
  "dependencies": {
    "@hunthub/shared": "*",  // ← References local package
    "express": "...",
    // ...
  }
}
```

**packages/frontend/package.json:**
```json
{
  "name": "@hunthub/frontend",
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

**This is your schema sharing strategy. It's solid, scalable, and template-ready.**
