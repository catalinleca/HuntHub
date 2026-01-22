# Backend Architecture

Node.js + Express + MongoDB API with InversifyJS dependency injection.

---

## Overview

```
Request
    ↓
Router (validation middleware)
    ↓
Controller (HTTP handling)
    ↓
Service (business logic)
    ↓
Model (Mongoose) ←→ Mapper ←→ API Types (@hunthub/shared)
```

**Layers:**
| Layer | Responsibility | Throws Errors? |
|-------|---------------|----------------|
| Router | Route definition, validation middleware | Via middleware |
| Controller | HTTP extraction, delegation, response | No (propagates) |
| Service | Business logic, authorization | Yes |
| Model | Data persistence, schema | Yes (via Mongoose) |

---

## Request Flow

```
server.ts
    │
    ├── /api/auth      ─────────────────────────► authRouter (no auth)
    ├── /api/play      ─────────────────────────► playRouter (no auth)
    ├── /api/preview   ─────────────────────────► previewRouter (no auth)
    │
    ├── authMiddleware ◄── Applied to /api/*
    │
    ├── /api/hunts/*   ─────────────────────────► Protected routes
    └── /api/assets/*  ─────────────────────────► Protected routes
```

**Route mounting order matters.** Unauthenticated routes (`/auth`, `/play`, `/preview`) are mounted BEFORE `authMiddleware` is applied.

**Authentication flow:**
```
Request with Bearer token
    ↓
authMiddleware extracts token
    ↓
Firebase Admin SDK verifies token
    ↓
authUser() creates/fetches user record
    ↓
req.user = { id, email, ... }
    ↓
Controller accesses req.user.id
```

---

## modules/ vs features/

```
src/
├── modules/          # Core CRUD (hunts, steps, assets, auth)
└── features/         # Domain workflows (play, publishing, sharing, preview)
```

**modules/** - Entity CRUD operations:
- `auth/` - Authentication flow
- `hunts/` - Hunt master CRUD
- `steps/` - Step CRUD
- `assets/` - Asset CRUD

**features/** - Complex multi-entity workflows:
- `publishing/` - Hunt → HuntVersion → Release workflow
- `sharing/` - Collaboration & permissions
- `play/` - Session management, validation
- `preview/` - Preview link generation
- `cloning/` - Hunt duplication
- `player-invitations/` - Player invite management
- `ai-generation/` - AI-powered hunt creation

**Rule:** Modules own entities. Features orchestrate workflows across modules.

---

## Dependency Injection (InversifyJS)

**Container setup:** `src/config/inversify.ts`

```typescript
// Registration
container.bind<IHuntService>(TYPES.HuntService).to(HuntService);
container.bind<IAIProvider>(TYPES.AIProvider).to(GroqProvider).inSingletonScope();

// Usage in service
@injectable()
export class HuntService implements IHuntService {
  constructor(
    @inject(TYPES.AuthorizationService) private authService: IAuthorizationService,
  ) {}
}

// Usage in routes
const controller = container.get<IHuntController>(TYPES.HuntController);
```

**TYPES symbols:** `src/shared/types/index.ts` - 38+ unique symbols for DI resolution.

**Scope:**
- Default (per-request) for services
- `inSingletonScope()` for stateless providers (AI, Storage)

---

## Data Flow & Mapper Pattern

**Hunt + HuntVersion Architecture:**
```
Hunt (master)              HuntVersion (content)
├── huntId                 ├── huntId + version (compound key)
├── creatorId              ├── name, description, stepOrder
├── latestVersion ─────────┤── isPublished, publishedAt
├── liveVersion            └── coverImage, startLocation
└── playSlug, accessMode
```

**API sees merged "Hunt" DTO.** Mapper handles the join:

```typescript
// DB → API (fromDocuments)
HuntMapper.fromDocuments(huntDoc, versionDoc) → Hunt DTO

// API → DB (toVersionDocument)
HuntMapper.toVersionDocument(dto, huntId, version) → IHuntVersion

// Batch mapping
HuntMapper.fromDocumentPairs(pairs) → Hunt[]
```

**Rule:** ALL DB ↔ API transformations go through mappers. Services never manually build DB objects.

**Mappers location:** `src/shared/mappers/`

---

## Authorization Pattern

**Service:** `src/services/authorization/authorization.service.ts`

```typescript
interface AccessContext {
  huntDoc: HydratedDocument<IHunt>;
  userId: string;
  permission: HuntPermission;
  isOwner: boolean;
  canEdit: boolean;
  canPublish: boolean;
  canRelease: boolean;
  canDelete: boolean;
  canShare: boolean;
  canClone: boolean;
}

// Usage in services
const access = await this.authService.requireAccess(huntId, userId, HuntPermission.Admin);
// Throws ForbiddenError if insufficient permission

// Check without throwing
const canEdit = await this.authService.canAccess(huntId, userId, HuntPermission.Admin);
```

**Permission hierarchy:** `View (1) < Admin (3) < Owner (5)`

---

## Error Handling

**Error classes:** `src/shared/errors/`

| Error | Status | Use Case |
|-------|--------|----------|
| `ValidationError` | 400 | Invalid input (with field errors array) |
| `UnauthorizedError` | 401 | No/invalid auth token |
| `ForbiddenError` | 403 | Insufficient permissions |
| `NotFoundError` | 404 | Resource doesn't exist |
| `ConflictError` | 409 | Concurrent modification |
| `DataIntegrityError` | 422 | Data consistency violation |
| `RateLimitError` | 429 | Too many requests |

**Pattern:** Services throw, error middleware catches:

```typescript
// In service - throw errors
if (!hunt) throw new NotFoundError('Hunt not found');
if (!isValid) throw new ValidationError('Invalid data', [{ field: 'name', message: 'Required' }]);

// Error middleware handles all - controllers never catch
```

---

## Validation Pattern

**Flow:**
```
Route → validateRequest(schema) middleware → Controller → Service
```

**Middleware:** `src/shared/middlewares/validation.middleware.ts`

```typescript
// Route definition
router.post('/',
  validateRequest(createHuntSchema),
  (req, res, next) => controller.createHunt(req, res).catch(next)
);

// Middleware catches ZodError → ValidationError
if (error instanceof ZodError) {
  const errors = error.errors.map(e => ({
    field: e.path.join('.'),
    message: e.message
  }));
  return next(new ValidationError('Validation failed', errors));
}
```

**Schemas:** Re-export from `@hunthub/shared/schemas`, extend for backend-specific needs.

---

## Strategy Pattern (Play API Validators)

**Location:** `src/features/play/helpers/validators/`

```typescript
// Interface
interface IAnswerValidator {
  validate(payload: AnswerPayload, step: IStep, attemptCount?: number): Promise<ValidationResult>;
}

// Registry
const validators: Record<AnswerType, IAnswerValidator> = {
  [AnswerType.Clue]: ClueValidator,
  [AnswerType.QuizChoice]: QuizChoiceValidator,
  [AnswerType.QuizInput]: QuizInputValidator,
  [AnswerType.MissionLocation]: MissionLocationValidator,
  [AnswerType.MissionMedia]: MissionMediaValidator,
  [AnswerType.Task]: TaskValidator,
};

// Usage - open for extension, closed for modification
const result = await AnswerValidator.validate(answerType, payload, step);
```

**Adding new validator:** Create class, add to registry. No changes to AnswerValidator logic.

---

## Transaction Safety

**Helper:** `src/shared/utils/transaction.ts`

```typescript
const result = await withTransaction(async (session) => {
  await HuntModel.create([huntData], { session });
  await HuntVersionModel.create([versionData], { session });
  return { huntId };
});
```

**Used in:**
- Hunt creation (Hunt + HuntVersion atomic)
- Publishing workflow (validate → clone → mark published)
- Release management (optimistic locking)

**Optimistic Locking Pattern:**
```typescript
// Client provides currentLiveVersion
const result = await HuntModel.findOneAndUpdate(
  { huntId, liveVersion: currentLiveVersion },  // Must match current state
  { $set: { liveVersion: newVersion } },
  { new: true }
);
if (!result) throw new ConflictError('Hunt was modified by another user');
```

---

## Controller & Route Patterns

**Controller:**
```typescript
@injectable()
export class HuntController implements IHuntController {
  constructor(@inject(TYPES.HuntService) private huntService: IHuntService) {}

  async createHunt(req: Request, res: Response) {
    const hunt = req.body;  // Already validated
    const created = await this.huntService.createHunt(hunt, req.user.id);
    return res.status(201).json(created);
  }
  // Never catches errors - let middleware handle
}
```

**Route:**
```typescript
const controller = container.get<IHuntController>(TYPES.HuntController);

router.post('/',
  validateRequest(createHuntSchema),
  (req, res, next) => controller.createHunt(req, res).catch(next)
);
```

**Key:** `.catch(next)` propagates errors to error middleware.

---

## Key Files

| Need | Location |
|------|----------|
| DI container | `src/config/inversify.ts` |
| TYPES symbols | `src/shared/types/index.ts` |
| Error classes | `src/shared/errors/` |
| Mappers | `src/shared/mappers/` |
| Authorization | `src/services/authorization/` |
| Middlewares | `src/shared/middlewares/` |
| Transaction helper | `src/shared/utils/transaction.ts` |
| Play validators | `src/features/play/helpers/validators/` |
| Publishing helpers | `src/features/publishing/helpers/` |
| Server entry | `src/server.ts` |

---

## Key Design Decisions

### Mapper Pattern Enforced
All DB ↔ API transformations go through mappers. Prevents manual object building errors, centralizes type conversions.

### Error-Throwing Services
Services throw specific error classes. Controllers never catch. Error middleware handles all errors consistently.

### modules/ vs features/ Separation
Clear distinction between entity CRUD (modules) and cross-entity workflows (features). Features can orchestrate multiple modules.

### Hunt + HuntVersion Separation
Enables version control: edit drafts freely, publish immutable snapshots, instant rollback via pointer switch.

### Authorization as Service
Centralized permission logic. Returns rich `AccessContext` with all permission flags computed once.

### Strategy Pattern for Validators
Open/Closed principle: adding new answer types requires new validator class + registry entry, no core logic changes.

### Optimistic Locking
Prevents silent overwrites in concurrent scenarios (release, publish). Client provides expected state, server rejects if stale.

### Transaction Safety
MongoDB sessions ensure atomic multi-document operations. Critical for data integrity in publishing workflow.
