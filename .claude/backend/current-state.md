# Backend Current State

**Last updated:** 2025-10-28

**🎉 Week 1 NOW Sprint: COMPLETE!**

**Recent work (2025-10-28):**
- ✅ **Hunt CRUD Complete** (6/6 endpoints)
- ✅ **Step CRUD Complete** (3/3 endpoints)
- ✅ **Reorder Steps endpoint** (bonus - from Week 2)
- ✅ **OpenAPI schema fixes**: Fixed type/challengeType inconsistencies, made required fields actually required
- ✅ **Production patterns documented**: See `.claude/backend/hunt-step-implementation-decisions.md`

**⚠️ CRITICAL NEXT: UUID Migration**
- **Problem**: Currently exposing MongoDB ObjectIds in API responses (security issue)
- **Solution**: Dual ID system (internal ObjectId + external UUID)
- **Status**: Documented, ready to implement
- **Priority**: HIGH - Must fix before continuing feature development

**Previous work (2025-10-27/28):**
- Production data flow patterns applied (all 7 mappers)
- Implemented: toDocument (API→DB), fromDocument (DB→API), type guards for enums
- Mongoose validation constraints added (minLength, maxLength, trim)
- Complete documentation: `.claude/backend/data-flow.md`

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
- [x] Module aliases (@/) with tsconfig-paths for runtime

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

### Hunt Management (COMPLETE - Week 1)
- [x] Hunt model (Mongoose schema)
- [x] Hunt types/interfaces (IHunt, HuntStatus enum)
- [x] Hunt mapper (toDocument, toDocumentUpdate, fromDocument)
- [x] Hunt service (full CRUD):
  - createHunt()
  - getAllHunts()
  - getUserHunts()
  - getHuntById()
  - getUserHuntById()
  - updateHunt() (metadata only)
  - deleteHunt() (cascade delete steps)
  - reorderSteps()
  - verifyOwnership() (reusable authorization)
- [x] Hunt controller (all endpoints)
- [x] Hunt routes (all CRUD + reorder)
- [x] Hunt validation schemas (create, update, reorder)

### Step Management (COMPLETE - Week 1)
- [x] Step model (Mongoose schema)
- [x] Step types/interfaces (IStep, ChallengeType enum)
- [x] Step mapper (toDocument, toDocumentUpdate, fromDocument)
- [x] Step service (full CRUD):
  - createStep() (auto-append to stepOrder)
  - updateStep()
  - deleteStep() (remove from stepOrder)
- [x] Step controller (all endpoints)
- [x] Step routes (RESTful nested: /api/hunts/:huntId/steps/...)
- [x] Step validation schemas (create, update)
- [x] Dependency injection (StepService injects HuntService for authorization)

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

## 🚧 Known Issues & Technical Debt

### CRITICAL: Security Issue
- ⚠️ **Exposing MongoDB ObjectIds in API** - Must migrate to UUID before production
  - Problem: ObjectIds contain timestamp, reveal DB implementation, predictable
  - Solution: Dual ID system (internal ObjectId + external UUID v4)
  - Impact: All models, mappers, services need updating
  - Status: Ready to implement (next task)

### Hunt Features (Pending)
- [ ] Hunt publishing workflow (status transitions)
- [ ] Hunt sharing/access control (HuntAccess model exists but not wired up)
- [ ] Hunt versioning logic (currentVersion field exists but not used)

### Challenge Types
- [x] Types defined in OpenAPI (Clue, Quiz, Mission, Task)
- [x] Challenge structure in steps (discriminated union)
- [ ] Challenge validation by type (Strategy pattern - Week 2)
- [ ] Challenge response handling (Player API - Week 5-6)
- [ ] Scoring/completion logic (Player API - Week 5-6)

### Data Models (Defined but Not Used)
- [ ] Asset service/controller/routes (for media uploads - Week 3)
- [ ] Progress service/controller/routes (tracking user progress - Week 5-6)
- [ ] LiveHunt service (active hunt instances - Week 5-6)
- [ ] PublishedHunt service (hunt versions - Week 4-5)

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
- `users` - Active (full CRUD)
- `hunts` - Active (full CRUD)
- `steps` - Active (full CRUD - Week 1 complete)
- `assets` - Defined, not used (Week 3)
- `progress` - Defined, not used (Week 5-6)
- `livehunts` - Defined, not used (Week 5-6)
- `publishedhunts` - Defined, not used

## API Endpoints

**✅ Implemented (Week 1 Complete):**
```
POST   /auth/signup
POST   /auth/login

# Hunt CRUD (6/6)
POST   /api/hunts                          # Create hunt
GET    /api/hunts                          # List user's hunts
GET    /api/hunts/:id                      # Get hunt by ID
PUT    /api/hunts/:id                      # Update hunt (metadata only)
DELETE /api/hunts/:id                      # Delete hunt (cascade delete steps)
PUT    /api/hunts/:id/step-order           # Reorder steps

# Step CRUD (3/3)
POST   /api/hunts/:huntId/steps            # Create step
PUT    /api/hunts/:huntId/steps/:stepId    # Update step
DELETE /api/hunts/:huntId/steps/:stepId    # Delete step
```

**📋 Needed - Week 2 (Tree VIEW API):**
```
GET    /api/hunts/:id/tree                 # Get compact step list (lazy loading)
GET    /api/steps/:id                      # Get full step details
# + Add stepCount to GET /api/hunts response
# + Database indexes
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

1. ⚠️ **CRITICAL: Exposing MongoDB ObjectIds** - Must migrate to UUIDs (NEXT TASK)
2. **Validation schemas** - Domain-organized structure complete ✅
3. **OpenAPI schema inconsistencies** - Fixed type/challengeType mismatches ✅
4. **Error messages** - Some errors lack descriptive messages
5. **Testing** - Integration tests implemented ✅ (need more test coverage for Step CRUD)
6. **Documentation** - No API docs yet (Swagger UI installed but not configured)

## 🎯 Current Priority: Numeric ID Migration (CRITICAL - 2025-10-30)

**Problem:** Exposing MongoDB ObjectIds in API responses (security + architecture issue)

**Solution:** Dual ID system with **sequential numeric IDs**
- **Internal ID**: MongoDB ObjectId (`_id`) - database only, never exposed
- **External ID**: Numeric sequential ID (`huntId: 1332`, `stepId: 13344`) - API layer, human-readable

**Why numeric IDs:**
1. **Human-readable**: "Check hunt 1332" vs "Check hunt 550e8400-e29b..."
2. **Short URLs**: `/api/hunts/1332` (perfect for QR codes)
3. **Easy to share**: Can verbally communicate IDs
4. **Production standard**: GitHub, Twitter, Stripe all use sequential IDs
5. **Authorization-based security**: Enumeration is safe with proper auth (we have this)

**Why this is critical:**
1. **Security**: ObjectIds contain timestamps → reveals creation order/timing
2. **Implementation leakage**: Tells the world you're using MongoDB
3. **Migration difficulty**: Tied to MongoDB format forever
4. **Predictability**: ObjectIds are somewhat sequential
5. **Production best practice**: External IDs should be opaque

**Scope of changes:**
- **7 Models**: Hunt, Step, User, Asset, Progress, PublishedHunt, LiveHunt
- **Counter Model**: New model for auto-incrementing IDs
- **7 Mappers**: Return numeric IDs, update foreign keys
- **All Services**: Query by numeric ID instead of ObjectId
- **All Foreign Keys**: Change from ObjectId to number (`huntId: 1332`)
- **Database**: Add numeric ID field with unique index to all models
- **Pre-save hooks**: Auto-generate numeric IDs on document creation
- **OpenAPI schema**: Update to `type: integer`

**Implementation time estimate:** 2-3 hours

**See:** Complete validated plan in `.claude/backend/NUMERIC-ID-MIGRATION-PLAN.md`

---

## 📋 Next After UUID Migration: Week 2 (Tree VIEW API)

**Backend work:**
- [ ] Create `GET /api/hunts/:id/tree` endpoint (compact step list)
- [ ] Update `GET /api/hunts` to include `stepCount`
- [ ] Ensure `GET /api/steps/:id` returns full step details
- [ ] Add database indexes for performance

**See:** `.claude/tree-and-branching-strategy.md` for complete context

---

## Next Steps (Priority Order)

1. **🔥 UUID Migration** (~2-3 hours) - **CURRENT TASK**
   - Add `id: string` field to all models
   - Generate UUIDs on create (v4)
   - Query by UUID instead of ObjectId
   - Update all foreign key references
   - Update all mappers and services
   - Migration plan to be created next

2. **Tree VIEW API** (~1 week) - **Week 2**
   - GET /api/hunts/:id/tree (compact step list)
   - GET /api/steps/:id (full details, lazy loading)
   - Add stepCount to hunt list
   - Database indexes

3. **Challenge Validation** (~2 days) - **Week 2**
   - Strategy pattern for validators
   - ClueValidator, QuizValidator, MissionValidator, TaskValidator

4. **Asset Management** (~3 days) - **Week 3 (CRITICAL - moved up)**
   - File upload (multer + Firebase Storage/S3)
   - Attach assets to steps
   - Required before Publishing

5. **Publishing Workflow** (~1-2 weeks) - **Week 4-5**
   - Simplified: Draft → Published
   - Clone hunt + steps
   - PublishedHunt + LiveHunt records

6. **Player API** (~1-2 weeks) - **Week 5-6**
   - Get live hunt
   - Submit completions
   - Track progress

7. **Testing** - **Ongoing**
   - Add Step CRUD integration tests
   - Test UUID migration
