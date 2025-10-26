# Backend Current State

**Last updated:** 2025-10-26

**Recent work:** Monorepo setup complete, type sharing implemented

## ✅ Implemented

### Monorepo Infrastructure (NEW - 2025-10-26)
- [x] npm workspaces configuration
- [x] Shared package (@hunthub/shared) for types, validation, constants
- [x] OpenAPI → TypeScript type generation
- [x] Root-level configs with package inheritance (TypeScript, ESLint, Prettier)
- [x] Runtime module resolution with tsconfig-paths
- [x] Dependency hoisting to root node_modules
- [x] Type imports from @hunthub/shared across backend

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
- [x] Auth validation schemas

### Tooling
- [x] TypeScript configuration (strict mode)
- [x] ESLint + Prettier setup
- [x] Dev scripts (hot reload, type checking)
- [x] Build scripts

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

**Needed:**
```
PUT    /api/hunts/:id          # Update hunt
DELETE /api/hunts/:id          # Delete hunt
POST   /api/hunts/:id/publish  # Publish hunt
GET    /api/hunts/:id/steps    # Get steps
POST   /api/hunts/:id/steps    # Add step
...and many more
```

## Technical Debt / TODOs

1. **Serializers removed** - Now using mongoose toJSON() method
2. **creatorId reference** - Has "TODO revert" comment in Hunt.ts:7
3. **Validation schemas** - Only auth schemas exist, need hunt schemas
4. **Type inconsistencies** - OpenAPI types vs DB types need reconciliation
5. **Error messages** - Some errors lack descriptive messages
6. **Testing** - No tests written yet
7. **Documentation** - No API docs yet (Swagger UI installed but not configured)

## Next Steps (Suggested)

1. **Complete Hunt CRUD** - Update, delete, publish endpoints
2. **Step Management** - Full CRUD for hunt steps
3. **Challenge Validation** - Implement challenge-specific logic
4. **Hunt Publishing** - Workflow from draft → published
5. **LiveHunt** - Enable users to start/participate in hunts
6. **Testing** - Add unit/integration tests
7. **API Documentation** - Configure Swagger UI
