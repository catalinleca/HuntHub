# Backend Current State

**Last updated:** 2025-10-27

**Recent work:** Monorepo restructured for multiple apps, tree VIEW API design documented

## ✅ Implemented

### Monorepo Infrastructure (2025-10-26/27)
- [x] npm workspaces configuration with nested app structure
- [x] Shared package (@hunthub/shared) for types, validation, constants
- [x] OpenAPI → TypeScript type generation
- [x] Root-level configs with package inheritance (TypeScript, ESLint, Prettier)
- [x] Runtime module resolution with tsconfig-paths
- [x] Dependency hoisting to root node_modules
- [x] Type imports from @hunthub/shared across backend
- [x] Restructured for multiple apps:
  - `apps/backend/api/` - Backend API (@hunthub/api)
  - `apps/frontend/editor/` - Hunt creation app (planned)
  - `apps/frontend/player/` - Hunt playing app (planned)
- [x] Workspace config supports nested structure (`apps/backend/*`, `apps/frontend/*`)

### Core Infrastructure
- [x] Express server setup with TypeScript
- [x] MongoDB connection via Mongoose
- [x] InversifyJS dependency injection container
- [x] Centralized error handling middleware
- [x] Custom error classes (AppError, NotFoundError, ValidationError, etc.)
- [x] Firebase Admin SDK integration
- [x] Firebase service account properly secured (gitignored, example file provided)
- [x] Environment configuration (.env support)
- [x] Module aliases (@/, @db/) with tsconfig-paths for runtime

### Authentication & Authorization
- [x] Firebase authentication middleware
- [x] Auth service (signup, login via Firebase)
- [x] Auth controller
- [x] Auth routes (`/auth/signup`, `/auth/login`)
- [x] User attached to req.user in protected routes

### User Management
- [x] User model (Mongoose schema)
- [x] User types/interfaces
- [x] User service (CRUD operations)
- [x] Firebase UID mapping to internal user ID
- [x] User profile fields (name, email, bio, picture)

### Hunt Management
- [x] Hunt model (Mongoose schema)
- [x] Hunt types/interfaces (IHunt, HuntStatus enum)
- [x] Hunt service:
  - createHunt()
  - getAllHunts()
  - getUserHunts()
  - getHuntById()
  - getUserHuntById()
- [x] Hunt controller
- [x] Hunt routes (`/api/hunts`)
- [x] Basic hunt properties (name, description, status, version, startLocation)

### Data Models (Defined)
- [x] Hunt
- [x] User
- [x] Step
- [x] Asset
- [x] Progress
- [x] LiveHunt
- [x] PublishedHunt
- [x] Location (schema)

### OpenAPI & Validation
- [x] OpenAPI schema definition (hunthub_models.yaml)
- [x] Type generation from OpenAPI (HuntHubTypes.ts)
- [x] Validation middleware with Zod
- [x] Domain-organized validation structure (validation/schemas/)
- [x] Auth validation schemas
- [x] Hunt validation schemas (imported from @hunthub/shared/schemas)
- [x] User validation schemas (imported from @hunthub/shared/schemas)

### Testing Infrastructure (NEW - 2025-10-26)
- [x] Jest configuration with TypeScript support
- [x] Integration test setup (supertest + MongoDB Memory Server)
- [x] Test factories for creating test data (User, Hunt)
- [x] Firebase auth mocking helpers
- [x] Test database setup and cleanup utilities
- [x] Hunt CRUD integration tests (create, read, list)
- [x] Validation testing (required fields, error responses)
- [x] Authentication testing (401 unauthorized cases)

### Tooling
- [x] TypeScript configuration (strict mode)
- [x] ESLint + Prettier setup
- [x] Dev scripts (hot reload, type checking)
- [x] Build scripts
- [x] Test scripts (jest with coverage support)

## 🚧 Partially Implemented / Known Issues

### Hunt Features
- [ ] Hunt step management (steps exist in schema but no CRUD endpoints)
- [ ] Hunt publishing workflow (status transitions)
- [ ] Hunt sharing/access control (HuntAccess model exists but not wired up)
- [ ] Hunt versioning logic (currentVersion field exists but not used)

### Challenge Types
- [x] Types defined in OpenAPI (Clue, Quiz, Mission, Task)
- [ ] Challenge creation/validation logic
- [ ] Challenge response handling
- [ ] Scoring/completion logic

### Data Models (Defined but Not Used)
- [ ] Step service/controller/routes
- [ ] Asset service/controller/routes (for media uploads)
- [ ] Progress service/controller/routes (tracking user progress)
- [ ] LiveHunt service (active hunt instances)
- [ ] PublishedHunt service (hunt versions)

## ❌ Not Yet Implemented

### Hunt Participation
- [ ] Start a hunt (create LiveHunt)
- [ ] Submit challenge responses
- [ ] Validate location proximity
- [ ] Track progress
- [ ] Complete hunt
- [ ] Leaderboards/scoring

### Location Features
- [ ] Location validation middleware
- [ ] GPS proximity checks
- [ ] Map integration

### Media/Assets
- [ ] File upload handling
- [ ] Image/video storage
- [ ] Asset CDN integration

### Hunt Discovery
- [ ] Public hunt listing
- [ ] Search/filter hunts
- [ ] Hunt categories/tags

### Social Features
- [ ] Hunt sharing
- [ ] Collaboration/permissions
- [ ] Comments/reviews

### Advanced Features
- [ ] Real-time updates (WebSockets?)
- [ ] Push notifications
- [ ] Analytics/insights
- [ ] Admin dashboard

## Database Schema Status

**Collections in use:**
- `users` - Active
- `hunts` - Active
- `steps` - Defined, not used
- `assets` - Defined, not used
- `progress` - Defined, not used
- `livehunts` - Defined, not used
- `publishedhunts` - Defined, not used

## API Endpoints

**Implemented:**
```
POST   /auth/signup
POST   /auth/login
POST   /api/hunts              # Create hunt
GET    /api/hunts              # Get current user's hunts
GET    /api/hunts/:id          # Get hunt by ID
```

**Needed - High Priority (Tree VIEW API):**
```
GET    /api/hunts/:id/tree     # Get compact step list for tree visualization (PRIORITY)
GET    /api/steps/:id          # Get full step details
```

**Needed - Core CRUD:**
```
PUT    /api/hunts/:id          # Update hunt
DELETE /api/hunts/:id          # Delete hunt
POST   /api/hunts/:id/steps    # Add step
PUT    /api/steps/:id          # Update step
DELETE /api/steps/:id          # Delete step
PUT    /api/hunts/:id/step-order # Reorder steps
```

**Needed - Publishing & Playing:**
```
POST   /api/hunts/:id/publish  # Publish hunt
GET    /api/hunts/:id/live     # Get live version
GET    /api/play/:huntId       # Get live hunt for playing
POST   /api/play/:huntId/steps/:stepId/complete  # Submit step completion
GET    /api/play/:huntId/progress  # Get user progress
```

## Technical Debt / TODOs

1. **Serializers removed** - Now using mongoose toJSON() method ✅
2. **creatorId reference** - Has "TODO revert" comment in Hunt.ts:7
3. **Validation schemas** - Domain-organized structure complete ✅
4. **Type inconsistencies** - OpenAPI types vs DB types need reconciliation
5. **Error messages** - Some errors lack descriptive messages
6. **Testing** - Integration tests implemented ✅ (need more test coverage)
7. **Documentation** - No API docs yet (Swagger UI installed but not configured)

## 🎯 Current Priority: Tree VIEW API (2025-10-27)

**Decision made:** Implement tree VIEW (visualization with lazy loading) NOW, reserve gameplay branching for V1.1+

**See:** `.claude/tree-and-branching-strategy.md` for complete context

### Tree VIEW API Implementation (~1 week)

**Backend work:**
- [ ] Create `GET /api/hunts/:id/tree` endpoint
  - Returns compact step list (id, type, title, order)
  - No full challenge data (lazy loading pattern)
  - Performance optimized for large step counts
- [ ] Update `GET /api/hunts` to include `stepCount`
  - Add to response: `{ id, name, status, stepCount, updatedAt }`
  - Allows UI to show step count without fetching steps
- [ ] Ensure `GET /api/steps/:id` returns full step details
  - Full challenge data loaded on demand
  - When user clicks step in tree
- [ ] Add database indexes for performance
  - Index on `Step.huntId` for efficient tree queries
  - Index on `Step.order` for sorted retrieval

**API Design Pattern (Lazy Loading):**
```typescript
// 1. GET /api/hunts - Compact list
Response: {
  hunts: [
    { id: "hunt-1", name: "Barcelona", status: "draft", stepCount: 14 }
  ]
}

// 2. GET /api/hunts/:id/tree - Compact step list
Response: {
  id: "hunt-1",
  name: "Barcelona Adventure",
  steps: [
    { id: "step-1", type: "clue", title: "Find Sagrada", order: 1 },
    { id: "step-2", type: "quiz", title: "Who designed it?", order: 2 }
  ]
}

// 3. GET /api/steps/:id - Full details on click
Response: {
  id: "step-1",
  type: "clue",
  challenge: { clue: { title: "...", description: "..." } },
  hint: "...",
  requiredLocation: { lat: 41.4, lng: 2.17, radius: 50 }
}
```

**Frontend work (separate):**
- Tree component showing compact step list
- Lazy load full details on step click
- Visual tree representation in editor

**Why this matters:**
- Better editor UX (visual overview)
- Production-quality API (efficient data transfer)
- Foundation for future branching (V1.1+)
- Scalable (works with 100+ steps)

**Future (V1.1+): Gameplay Branching**
- Use existing `Step.metadata` field (no model changes needed!)
- Add branching logic to player API
- No breaking changes to current implementation

---

## Next Steps (Priority Order)

1. **🔥 Tree VIEW API** (~1 week) - **CURRENT PRIORITY**
   - Implement endpoints above
   - Add indexes
   - Test with large step counts

2. **Complete Hunt CRUD** (~3-4 days)
   - Update hunt (PUT /api/hunts/:id)
   - Delete hunt (DELETE /api/hunts/:id)

3. **Step Management** (~1 week)
   - Full CRUD for hunt steps
   - Add step (POST /api/hunts/:id/steps)
   - Update step (PUT /api/steps/:id)
   - Delete step (DELETE /api/steps/:id)
   - Reorder steps (PUT /api/hunts/:id/step-order)

4. **Publishing MVP** (~1-2 weeks)
   - Simplified: Draft → Published (skip Review for MVP)
   - Publish hunt (clone hunt + steps)
   - Create PublishedHunt record
   - Create LiveHunt record

5. **Hunt Player** (~1-2 weeks)
   - Get live hunt for playing
   - Submit step completion
   - Track progress

6. **Testing** - Ongoing
   - Add integration tests for new endpoints
   - Test tree API performance

7. **API Documentation** - Lower priority
   - Configure Swagger UI
