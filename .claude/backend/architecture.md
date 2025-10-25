# Backend Architecture

## Tech Stack

**Runtime & Language:**
- Node.js 22.13.1
- TypeScript 5.3.3 (strict mode, experimental decorators)

**Framework & Core:**
- Express.js - Web framework
- MongoDB + Mongoose - Database & ODM
- Firebase Admin SDK - Authentication
- InversifyJS - Dependency injection

**Validation & Types:**
- Zod - Runtime validation
- OpenAPI 3.0 - API schema definition
- swagger-typescript-api - Generate types from OpenAPI
- ts-to-zod - Generate Zod schemas from TypeScript

**Development:**
- ts-node-dev - Hot reload in development
- ESLint + Prettier - Code quality
- Module aliases (@/, @db/)

## Architecture Pattern: Layered Architecture

```
Request → Router → Middleware → Controller → Service → Model → Database
                                                          ↓
                                               Response ← toJSON()
```

### 1. **Routes** (`src/routes/`)
- Define Express routes
- Mount middleware (auth, validation)
- Wire up controllers via InversifyJS container
- Example: `hunt.router.ts`, `auth.routes.ts`

### 2. **Middlewares** (`src/middlewares/`)
- **auth.middleware.ts**: Verify Firebase token, attach user to req
- **validation.middleware.ts**: Zod schema validation
- **error.middleware.ts**: Centralized error handling

### 3. **Controllers** (`src/controllers/`)
- Handle HTTP request/response
- Delegate business logic to services
- Return HTTP status codes
- Use dependency injection (@inject)
- Interface + Implementation pattern (IController/Controller)

### 4. **Services** (`src/services/`)
- Business logic layer
- Database operations via Mongoose models
- Throw custom errors (NotFoundError, ValidationError, etc.)
- Return domain types (from OpenAPI)
- Interface + Implementation pattern (IService/Service)

### 5. **Models** (`src/db/models/`)
- Mongoose schemas and models
- Indexes for performance
- Timestamps enabled (createdAt, updatedAt)
- Use toJSON() for serialization (not custom serializers)

### 6. **Types** (`src/db/types/`, `src/openapi/`)
- Database types (IHunt, IUser) - used by Mongoose
- API types (Hunt, User) - generated from OpenAPI YAML
- Enums for status/types (HuntStatus, ChallengeType)

## Dependency Injection (InversifyJS)

**Container setup:** `src/config/inversify.ts`

```typescript
container.bind<IHuntController>(TYPES.HuntController).to(HuntController);
container.bind<IHuntService>(TYPES.HuntService).to(HuntService);
```

**Usage in controllers:**
```typescript
@injectable()
export class HuntController implements IHuntController {
  constructor(@inject(TYPES.HuntService) private huntService: HuntService) {}
}
```

**Benefits:**
- Testability (easy to mock dependencies)
- Loose coupling
- Clear dependency graph

## Error Handling Pattern

**Custom Error Hierarchy:**
```
AppError (base)
  ├── NotFoundError (404)
  ├── ValidationError (400)
  ├── UnauthorizedError (401)
  ├── ForbiddenError (403)
  └── FirebaseAuthError (401/403)
```

**Usage in services:**
```typescript
if (!hunt) {
  throw new NotFoundError();
}
```

**Centralized handling:**
- `error.middleware.ts` catches all errors
- Extracts statusCode and message
- Returns consistent JSON error response

## Validation Pattern

**Schema-First Workflow:**

1. Define schemas in `src/openapi/hunthub_models.yaml` (OpenAPI YAML)
2. Generate TypeScript types: `npm run schemagen`
   - Creates `src/openapi/HuntHubTypes.ts`
3. Generate Zod schemas: `npm run generate-zodies`
   - Creates validation schemas from types

**Validation middleware:**
```typescript
router.post('/',
  validateRequest(createHuntSchema),
  controller.createHunt
);
```

## Authentication Pattern

**Firebase Authentication:**
- Frontend gets Firebase token
- Backend verifies via Firebase Admin SDK
- `authMiddleware` attaches `req.user: CompactUser`
- Services use `req.user.id` for authorization

**Auth flow:**
```
Client → Firebase → Token → Backend (authMiddleware) → req.user
```

## Data Flow Example

**Creating a Hunt:**
```
POST /api/hunts
  ↓
Router (validateRequest middleware)
  ↓
Controller.createHunt (extract req.body, req.user.id)
  ↓
Service.createHunt (business logic, validation)
  ↓
Model.create() (Mongoose)
  ↓
toJSON() (serialize)
  ↓
Controller returns 201 + JSON
```

## Module Organization

```
src/
├── config/           # App config, DI container, Firebase
├── controllers/      # HTTP handlers
├── db/
│   ├── models/       # Mongoose models
│   ├── schemas/      # Reusable Mongoose schemas
│   ├── types/        # TypeScript interfaces for DB
│   └── serializers/  # [DEPRECATED - use toJSON()]
├── middlewares/      # Express middlewares
├── openapi/          # OpenAPI schema + generated types
├── routes/           # Express routers
├── services/         # Business logic
├── types/            # Shared TypeScript types
└── utils/
    ├── errors/       # Custom error classes
    └── validation/   # Zod schemas
```

## Configuration

**Environment:**
- `.env.local` - Local overrides (gitignored)
- `.env` - Defaults (can be committed)
- Access via `process.env.VAR_NAME`

**Key configs:**
- `src/config.ts` - Export config values
- `src/config/firebase.ts` - Initialize Firebase Admin
- `src/config/inversify.ts` - DI container setup
