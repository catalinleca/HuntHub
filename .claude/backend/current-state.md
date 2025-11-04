# Backend Current State

**Last updated:** 2025-11-04

**🎉 Hunt Versioning System Complete! (2025-11-04)**

**Most Recent Work (2025-11-04):**
- ✅ **Hunt Versioning Architecture** - Hunt (master) + HuntVersion (content) separation
- ✅ **Phase 1 Complete** - All tests fixed for new schema (43/43 tests passing)
- ✅ **Phase 2 Complete** - Data integrity fixes:
  - ✅ Cascade delete includes HuntVersions
  - ✅ huntVersion validation in reorderSteps (security fix)
  - ✅ Atomic transactions in createHunt (production-grade)
- ✅ **Test Infrastructure Upgrade** - MongoDB Memory Server → Replica Set for transaction support
- ✅ **All 69 tests passing** with full transaction safety

**Architecture Summary:**
```
Hunt (master record)
├─ huntId: number (PK)
├─ creatorId: string
├─ latestVersion: number (always draft)
├─ liveVersion: number (published)
└─ isDeleted: boolean

HuntVersion (content snapshots)
├─ huntId + version (compound PK)
├─ name, description, startLocation
├─ stepOrder: number[]
├─ isPublished: boolean
└─ publishedAt, publishedBy

Step
├─ huntId + huntVersion (FK to HuntVersion)
└─ challenge data
```

**Previous work (2025-11-03):**
- ✅ **Asset Service Complete** - Full implementation with AWS S3 integration
- ✅ **StorageService** - Presigned URL generation for S3 uploads
- ✅ **Asset CRUD endpoints** (5/5) - Request upload, Create, Read, List, Delete
- ✅ **Asset integration tests** (26/26 passing) - Full test coverage
- ✅ **AWS Infrastructure** - S3 bucket, CloudFront CDN deployed and configured
- ✅ **Test infrastructure fixes** - MongoDB in-memory DB, AWS SDK mocking, Jest cache issues resolved
- ✅ **Mongoose index warnings fixed** - Removed duplicate index definitions

**Previous work (2025-10-28):**
- ✅ Hunt CRUD (6/6 endpoints) - Create, Read, List, Update, Delete, Reorder
- ✅ Step CRUD (3/3 endpoints) - Create, Update, Delete
- ✅ OpenAPI schema fixes (type/challengeType inconsistencies resolved)
- ✅ Production patterns established and documented

**✅ Numeric ID Migration: COMPLETE for Active Models!**
- **Solution Implemented**: Dual ID system (internal ObjectId + external numeric ID)
- **Status**: Hunt (huntId), Step (stepId), and Asset (assetId) all use numeric IDs ✅
- **Counter System**: Auto-incrementing IDs via getNextSequence() ✅
- **User Model**: Uses firebaseUid as external identifier (by design)
- **Pending Models**: Progress, LiveHunt, PublishedHunt (not yet implemented)

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

### Hunt Management with Versioning (COMPLETE - Week 1 + Versioning 2025-11-04)
- [x] Hunt model (Mongoose schema) - Master record with version pointers
- [x] HuntVersion model (Mongoose schema) - Content snapshots
- [x] Hunt types/interfaces (IHunt, IHuntVersion, HuntStatus enum)
- [x] Hunt mapper (toDocument, toVersionDocument, fromDocuments)
- [x] Hunt service (full CRUD with versioning):
  - createHunt() - **Atomic transaction** (Hunt + HuntVersion)
  - getAllHunts()
  - getUserHunts()
  - getHuntById()
  - getUserHuntById()
  - updateHunt() - Updates draft HuntVersion only
  - deleteHunt() - **Cascade deletes HuntVersions + Steps**
  - reorderSteps() - **Validates huntVersion** (security fix)
  - verifyOwnership() - Returns HuntDoc for efficient authorization
  - addStepToVersion() - Encapsulation for StepService
  - removeStepFromVersion() - Encapsulation for StepService
- [x] Hunt controller (all endpoints)
- [x] Hunt routes (all CRUD + reorder)
- [x] Hunt validation schemas (create, update, reorder)
- [ ] publishHunt() - **NEXT** (Phase 3 implementation pending)

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

### Testing Infrastructure (UPGRADED - 2025-11-04)
- [x] Jest configuration with TypeScript support
- [x] **MongoDB Memory Replica Set** (upgraded from standalone for transaction support)
- [x] Integration test setup (supertest + in-memory replica set)
- [x] Test factories for creating test data (User, Hunt with HuntVersion, Step with huntVersion)
- [x] Firebase auth mocking helpers
- [x] Test database setup and cleanup utilities
- [x] Hunt CRUD integration tests (23/23 passing)
- [x] Step CRUD integration tests (20/20 passing)
- [x] Asset CRUD integration tests (26/26 passing)
- [x] **Total: 69/69 tests passing** with transaction safety
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

**✅ Implemented:**
```
POST   /auth/signup
POST   /auth/login

# Hunt CRUD (6/6) - Week 1 ✅
POST   /api/hunts                          # Create hunt
GET    /api/hunts                          # List user's hunts
GET    /api/hunts/:id                      # Get hunt by ID
PUT    /api/hunts/:id                      # Update hunt (metadata only)
DELETE /api/hunts/:id                      # Delete hunt (cascade delete steps)
PUT    /api/hunts/:id/step-order           # Reorder steps

# Step CRUD (3/3) - Week 1 ✅
POST   /api/hunts/:huntId/steps            # Create step
PUT    /api/hunts/:huntId/steps/:stepId    # Update step
DELETE /api/hunts/:huntId/steps/:stepId    # Delete step

# Asset CRUD (5/5) - Week 3 ✅
POST   /api/assets/request-upload          # Request presigned S3 upload URL
POST   /api/assets                         # Create asset record after upload
GET    /api/assets                         # List user's assets
GET    /api/assets/:id                     # Get asset by ID
DELETE /api/assets/:id                     # Delete asset
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

1. ✅ **Numeric ID Migration** - COMPLETE for all active models
2. ✅ **Validation schemas** - Domain-organized structure complete
3. ✅ **OpenAPI schema inconsistencies** - Fixed type/challengeType mismatches
4. ⚠️ **Error messages** - Some errors lack descriptive messages
5. ✅ **Testing** - Integration tests implemented (26/26 asset tests passing)
6. ⚠️ **Documentation** - No API docs yet (Swagger UI installed but not configured)
7. ⚠️ **Step CRUD tests** - Need integration tests for step endpoints

---

## 🎯 Current Priority: Tree VIEW API or Publishing Workflow

**Option A: Tree VIEW API** (Week 2 - Better UX)
- GET /api/hunts/:id/tree (compact step list for lazy loading)
- GET /api/steps/:id (full step details endpoint)
- Add stepCount to GET /api/hunts response
- Database indexes for performance
- Challenge type validation (Strategy pattern)

**Option B: Publishing Workflow** (Week 4-5 - Faster to MVP)
- POST /api/hunts/:id/publish (clone hunt + steps)
- PublishedHunt and LiveHunt models
- Version management system
- QR code generation support

**See:** `.claude/tree-and-branching-strategy.md` for Tree VIEW details

---

## Next Steps (Priority Order)

1. **🔥 Tree VIEW API** (~1 week) - **RECOMMENDED NEXT**
   - GET /api/hunts/:id/tree (compact step list)
   - GET /api/steps/:id (full details, lazy loading)
   - Add stepCount to hunt list
   - Database indexes
   - Better editor UX before publishing

2. **Challenge Validation** (~2 days) - **Week 2**
   - Strategy pattern for validators
   - ClueValidator, QuizValidator, MissionValidator, TaskValidator

3. **Publishing Workflow** (~1-2 weeks) - **Week 4-5**
   - Simplified: Draft → Published
   - Clone hunt + steps
   - PublishedHunt + LiveHunt records
   - Enables QR code generation

4. **Player API** (~1-2 weeks) - **Week 5-6**
   - Get live hunt for playing
   - Submit challenge completions
   - Track progress
   - Validate challenges

5. **Testing** - **Ongoing**
   - Add Step CRUD integration tests
   - Add Tree VIEW tests
   - Test publishing workflow
