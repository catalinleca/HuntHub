# HuntHub Architecture

**High-level technical overview of the system.**

**Last updated:** 2025-11-08

---

## System Overview

HuntHub is a **monorepo** application with three main packages:

```
HuntHub (Monorepo)
├── @hunthub/shared     # Types, validation, constants
├── @hunthub/api        # Backend API (Node + Express + MongoDB)
└── @hunthub/editor     # Frontend (React + MUI) [Not started]
    @hunthub/player     # Player app (React + MUI) [Not started]
```

**Architecture Pattern:** Monorepo with shared package

**Why:** Tightly coupled frontend and backend, single source of truth for types and validation.

**See:** `decisions/schema-sharing-final-strategy.md` for detailed rationale.

---

## Backend Architecture

### Tech Stack

- **Runtime:** Node.js 22.13.1 + TypeScript 5.3.3
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose ODM
- **Auth:** Firebase Authentication
- **Storage:** AWS S3 + CloudFront CDN
- **DI:** InversifyJS
- **Validation:** Zod + OpenAPI 3.0

**See:** `backend/architecture.md` for detailed backend patterns.

### Layered Architecture

```
HTTP Request
    ↓
Router (Express)
    ↓
Middleware (Auth, Validation)
    ↓
Controller (HTTP handling)
    ↓
Service (Business logic)
    ↓
Model (Mongoose)
    ↓
Database (MongoDB)
    ↓
Response (JSON)
```

**Key Principle:** Clean separation of concerns at each layer.

**See:** `backend/patterns.md` for code conventions.

---

## Data Architecture

### Versioning System

**Hunt (master record):**
- huntId (numeric)
- creatorId
- latestVersion (draft version number)
- liveVersion (published version number)

**HuntVersion (content snapshots):**
- huntId + version (compound key)
- name, description, startLocation, stepOrder
- isPublished, publishedAt, publishedBy

**Step:**
- huntId + huntVersion (FK to HuntVersion)
- challenge data

**Why:** Allows version snapshots while editing draft, instant version switching for release.

**See:** `features/hunt-release.md` for versioning architecture.

### Authorization Model

**Three-tier permission hierarchy:**
1. **Owner** (creator) - Full control, immutable
2. **Admin** (collaborator) - Edit, publish, release, share (cannot delete)
3. **View** (collaborator) - Read-only access

**HuntAccess model:**
- Separate table design (not embedded in Hunt)
- One-to-many relationship (Hunt → HuntAccess)
- userId + huntId + permission level

**AuthorizationService:**
- Centralized permission checks
- Rich AccessContext (hunt document + user permission)
- Query optimization (N+1 prevention)

**See:** `features/hunt-sharing.md` for collaboration architecture.

---

## Type Sharing Strategy

### OpenAPI as Source of Truth

```
OpenAPI Schema (YAML)
    ↓
swagger-typescript-api
    ↓
TypeScript Types
    ↓
@hunthub/shared package
    ↓
Backend imports ← → Frontend imports
```

**Benefits:**
- Single source of truth
- No manual duplication
- TypeScript enforces consistency

**See:** `decisions/schema-sharing-final-strategy.md` for complete strategy.

### Three-Layer Validation

**Layer 1: UI (Frontend)**
- React Hook Form + Zod
- Immediate user feedback

**Layer 2: API (Backend)**
- Zod schemas + validation middleware
- Security - don't trust client

**Layer 3: Database (Mongoose)**
- Mongoose schema validation
- Data integrity - last line of defense

**See:** `decisions/schema-validation-strategy.md` for validation approach.

---

## Key Architectural Patterns

### Dependency Injection (InversifyJS)

**Why:** Testability, loose coupling, clear dependencies

**Pattern:**
```typescript
@injectable()
class HuntService {
  constructor(@inject(TYPES.HuntRepository) private repo: IHuntRepository) {}
}
```

**See:** `backend/architecture.md` for DI setup.

### Optimistic Locking

**Used for:** Concurrent edit detection, race condition prevention

**Pattern:**
```typescript
// Check version hasn't changed
if (hunt.liveVersion !== currentLiveVersion) {
  throw new ConflictError('Hunt was modified');
}
```

**See:** `features/hunt-release.md` for optimistic locking implementation.

### Transaction Safety

**Used for:** Multi-operation atomicity (create hunt + version, publish + clone steps)

**Pattern:**
```typescript
await session.withTransaction(async () => {
  await HuntModel.create([huntData], { session });
  await HuntVersionModel.create([versionData], { session });
});
```

**See:** `backend/patterns.md` for transaction patterns.

### Repository Pattern (via Mongoose)

**Models act as repositories:**
- HuntModel.findById()
- HuntModel.create()
- HuntModel.updateOne()

**Services orchestrate business logic:**
- Validation
- Authorization
- Multi-model operations
- Error handling

---

## Security Architecture

### Authentication

**Firebase Authentication:**
- Frontend gets Firebase token
- Backend verifies via Firebase Admin SDK
- authMiddleware attaches req.user (firebaseUid)

**No passwords in our database** - delegated to Firebase.

### Authorization

**Permission Checks:**
- Every hunt operation checks user permission
- AuthorizationService.requireAccess() returns rich context
- Three permission levels (Owner > Admin > View)
- Owner is immutable (cannot be changed or removed)

**Security Guarantees:**
- Cannot escalate own permission
- Cannot remove hunt owner
- Only owner can delete hunt
- Cannot delete hunt while live

**See:** `features/hunt-sharing.md` for authorization details.

### Data Protection

**Sensitive Data:**
- Firebase service account (gitignored)
- AWS credentials (environment variables)
- No secrets in code or version control

**API Security:**
- All hunt endpoints require authentication
- Firebase token validation on every request
- Permission checks before operations

---

## Storage Architecture

### Asset Storage (AWS S3)

**Upload Flow:**
1. Client requests presigned upload URL
2. Backend generates presigned URL (valid 15 minutes)
3. Client uploads directly to S3
4. Client notifies backend of upload completion
5. Backend creates Asset record

**CDN:** CloudFront distribution for fast global delivery

**See:** `deployment/aws-deployment-complete.md` for AWS setup.

### Database (MongoDB)

**Why MongoDB:**
- Flexible schema for hunt data
- Embedded documents for challenges
- Array order preservation (stepOrder)
- Horizontal scaling (future)

**Collections:**
- hunts (master records)
- huntversions (content snapshots)
- steps (challenge data)
- huntaccess (collaboration permissions)
- users, assets, progress

**See:** `decisions/mongodb-vs-postgres.md` for database choice rationale.

---

## Testing Strategy

### Integration Tests

**Framework:** Jest + Supertest + MongoDB Memory Replica Set

**Test Coverage (185/185 tests):**
- Hunt CRUD (23 tests)
- Step CRUD (20 tests)
- Asset Management (26 tests)
- Publishing Workflow (34 tests)
- Authorization Service (46 tests)
- Hunt Sharing (36 tests)

**Test Patterns:**
- Test factories for data creation
- Firebase auth mocking
- In-memory replica set for transaction support
- Database cleanup between tests

**See:** `backend/patterns.md` for testing patterns.

---

## Performance Considerations

### Query Optimization

**N+1 Prevention:**
- Use populate() for relationships
- Select only needed fields
- Batch operations where possible

**Indexes:**
- huntId on Steps (for step queries)
- creatorId on Hunts (for user's hunts)
- userId + huntId on HuntAccess (for permission lookups)

### Caching Strategy

**Not implemented yet** - premature optimization

**Future:**
- Redis for session caching
- CDN caching for assets (CloudFront)
- Query result caching

---

## Deployment Architecture

**Current:** Development only

**Planned:**
- Backend: Railway/Render/Heroku
- Frontend: Vercel/Netlify
- Database: MongoDB Atlas (managed)
- Storage: AWS S3 + CloudFront

**See:** `deployment/strategy.md` for deployment plans.

---

## Scalability Considerations

**Current Scale:** Thousands of users, tens of thousands of hunts

**MongoDB handles this easily** - not a bottleneck

**Future Scaling:**
- Horizontal scaling (MongoDB sharding)
- CDN for static assets (CloudFront)
- Load balancing for API (if needed)
- Microservices (only if necessary - YAGNI)

**See:** `decisions/mongodb-vs-postgres.md` for scalability analysis.

---

## Key Design Decisions

**Major architectural decisions:**
1. **MongoDB over PostgreSQL** - Flexibility, JSON-native, fast iteration
2. **Monorepo** - Shared types, single source of truth
3. **Firebase Auth** - Delegate authentication, focus on business logic
4. **AWS S3** - Scalable storage, presigned URLs for client uploads
5. **Hunt + HuntVersion separation** - Version snapshots + live pointer pattern
6. **Separate HuntAccess table** - Efficient permission queries
7. **Optimistic locking** - Race condition prevention without locks

**See:** `decisions/` folder for detailed decision documentation.

---

## Future Architecture

**When frontend starts:**
- Same monorepo structure
- Shared types from @hunthub/shared
- React + MUI + TypeScript
- Client-side routing (React Router)

**When deploying:**
- Separate deployments (backend, frontend)
- Environment-specific configs
- CI/CD pipeline (GitHub Actions)

**When scaling:**
- Consider microservices (only if needed)
- Add caching layer (Redis)
- Implement API versioning

**Principle:** Build for today, design for tomorrow, don't over-engineer.

---

**Updated:** 2025-11-08
