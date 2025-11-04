# Project State & Context

**Last updated:** 2025-11-04

## Current Focus

🎯 **Publishing Workflow Implementation** - Core versioning system complete, ready for Phase 3

**Recent Achievement (2025-11-04):**
✅ **Hunt Versioning System Complete!**
- Hunt (master) + HuntVersion (content) architecture fully implemented
- All 69 tests passing with atomic transaction safety
- Production-grade data integrity fixes complete
- Ready for publishing workflow (Phase 3)

## Project Meta-Goal

⚡ **This project serves dual purposes:**
1. Build HuntHub application
2. Create a reusable template/framework for future projects

**Template Vision:**
- Establish proven architecture patterns
- Document all decisions and patterns thoroughly
- Create code skeleton that can bootstrap new projects in minutes
- Separate reusable (template) from project-specific (HuntHub) concerns
- Make starting new projects painless - no more "building from nothing"

**After HuntHub completion:**
- Extract reusable patterns into template repository
- Create init scripts for new projects
- User can clone template → fill in requirements → start building immediately

## Recent Work (Last 1-2 Commits)

**2025-11-04: Hunt Versioning System Complete** ✅
- ✅ **Phase 1 Complete:** All models updated for Hunt (master) + HuntVersion (content) separation
- ✅ **Phase 2 Complete:** All services updated with versioning logic
- ✅ **Data Integrity Fixes:** Cascade delete, huntVersion validation, atomic transactions
- ✅ **Test Infrastructure Upgrade:** MongoDB Memory Replica Set for transaction support
- ✅ **All 69 tests passing** with full transaction safety
- 📍 **Next:** Phase 3 - Publishing Workflow (publishHunt() method)

**2025-11-03: Asset Management Complete** ✅
- Full asset service implementation with AWS S3 integration
- StorageService with presigned URL generation
- Asset CRUD endpoints (5/5) with 26/26 tests passing
- AWS infrastructure deployed (S3 bucket, CloudFront CDN)

**2025-10-28: Hunt & Step CRUD Complete** ✅
- Hunt CRUD (6/6 endpoints) - Create, Read, List, Update, Delete, Reorder
- Step CRUD (3/3 endpoints) - Create, Update, Delete
- OpenAPI schema fixes and production patterns documented

**2025-10-26: Monorepo Setup Complete** ✅
- Migrated to npm workspaces monorepo structure
- Created `packages/shared/` for types, validation, and constants
- Moved backend to `apps/backend/`
- Set up OpenAPI → TypeScript type generation in shared package
- Configured root configs with package-level inheritance (TypeScript, ESLint, Prettier)
- Fixed module resolution: Using `tsconfig-paths` for runtime path aliases
- Secured Firebase service account (gitignored, example file created)
- Updated all imports to use `@hunthub/shared`

**Commit 4b88846** (2025-02-05): Merge PR #3 - User service, Hunt service, Auth fixes
- Added user service with CRUD operations
- Completed hunt service with basic operations
- Fixed authentication issues
- Removed serializers in favor of toJSON()

**Previous commits:**
- Validation and error handling
- Hunt service foundation
- Auth service and user service WIP

## What's Working Now

✅ Monorepo structure with npm workspaces
✅ Shared package for types and constants
✅ OpenAPI → TypeScript type generation
✅ Runtime module resolution with tsconfig-paths
✅ Backend server with production-grade patterns
✅ Firebase authentication
✅ **Hunt Versioning System (NEW):**
  - Hunt (master) + HuntVersion (content) separation
  - Atomic transaction support (MongoDB replica set)
  - Draft version editing with protection
  - Cascade delete for data integrity
  - Cross-version validation
✅ **Complete CRUD Operations:**
  - Hunt CRUD (6/6 endpoints)
  - Step CRUD (3/3 endpoints)
  - Asset CRUD (5/5 endpoints)
✅ **Testing Infrastructure:**
  - MongoDB Memory Replica Set
  - 69/69 tests passing
  - Full transaction support in tests

## Immediate Next Steps

**Updated: 2025-11-04 after versioning system completion**

**Priority 1: ~~Hunt Versioning System~~** ✅ **COMPLETE**
- ✅ Phase 1: Database Models & Types
- ✅ Phase 2: Service Layer with versioning logic
- ✅ Data Integrity: Cascade delete, huntVersion validation, atomic transactions
- ✅ Test Infrastructure: MongoDB replica set for transactions
- ✅ All 69 tests passing

**Priority 2: Publishing Workflow** **← CURRENT PRIORITY**

**Phase 3: Publishing (4-5 hours estimated):**
1. Implement `HuntService.publishHunt()` method
   - Mark HuntVersion as published (isPublished=true, publishedAt, publishedBy)
   - Clone all steps from latestVersion → latestVersion+1
   - Create new draft HuntVersion (latestVersion+1)
   - Update Hunt.liveVersion to latestVersion
   - Update Hunt.latestVersion to latestVersion+1
   - Use transaction for atomicity
2. Add controller endpoint: `POST /api/hunts/:id/publish`
3. Add route configuration
4. Implement validation rules

**Phase 4: Publishing Tests (3-4 hours estimated):**
1. Basic publishing test (publish v1, verify v2 created)
2. Full workflow test (edit-publish-edit-publish cycle)
3. Edge case tests

**Why this is priority:** Core missing functionality blocking QR code generation and hunt playing

**Priority 3: Step Management + Tree VIEW** (Weeks 2-4) **← NEXT**
1. Reorder steps (PUT /api/hunts/:id/step-order)
2. Challenge type validation (Strategy pattern)
3. Get hunt tree (GET /api/hunts/:id/tree)
4. Add stepCount to hunt list
5. Get step details (GET /api/steps/:id)
6. Database indexes

**See:** `.claude/ROADMAP.md` for complete timeline

**Priority 4: Asset Management** (Weeks 2-4)
1. Upload asset (POST /api/assets)
2. Attach asset to step
3. Get asset (GET /api/assets/:id)

**Note:** Assets must be done before Player API (missions need file uploads)

**Priority 5: Publishing MVP** (Weeks 4-5)
1. Publish hunt (POST /api/hunts/:id/publish)
2. Get live version (GET /api/hunts/:id/live)
3. Simplified workflow: Draft → Published (skip Review for MVP)

**Priority 6: Hunt Player API** (Weeks 5-6)
1. Get live hunt for playing
2. Submit step completion
3. Validate challenges
4. Track progress

**Note:** Player API structure needs discussion before implementation

## Blockers

**[NONE CURRENTLY]**

## Documentation Status

**✅ Complete roadmap:** See `ROADMAP.md` for comprehensive 14-week timeline
**✅ Organized .claude files:** Recently reorganized for clarity (decisions/, reference/, etc.)
**✅ All major decisions documented:** MongoDB, monorepo, versioning strategy, etc.
**✅ Dependencies validated:** No circular logic, clear implementation order

## Questions to Resolve

**All major questions answered on 2025-02-05:**

1. ✅ Hunt participation flow - Defined in publishing-workflow.md
2. ⚠️ Location verification - To be designed during player implementation
3. ✅ Frontend tech stack - React + MUI + TypeScript (see frontend/overview.md)
4. ⚠️ Deployment - TBD (see deployment/strategy.md)
5. ✅ Type sharing - Monorepo with shared package (DECIDED)

**New question (2025-10-27):**

6. ⚠️ Player API structure - Needs discussion before Week 5-6 implementation
   - Current design: `/api/play/:huntId`, `/api/play/:huntId/steps/:stepId/complete`, `/api/play/:huntId/progress`
   - Alternatives: Separate validation endpoint? Different route prefix (`/api/player/`)?
   - Timeline: Decide by Week 4 (before Player API implementation)

## Development Workflow

**Starting a session:**
```bash
cd /Users/catalinleca/leca/HuntHub
claude  # Boot Claude Code - context auto-loads
```

**Common tasks:**
```bash
# From root
npm run dev:backend              # Start backend API dev server (alias for dev:api)
npm run dev:api                  # Start backend API dev server
npm run build:shared             # Build shared package
npm run build:api                # Build backend API
npm run generate                 # Generate types from OpenAPI
npm run lint                     # Lint all packages
npm run format                   # Format all packages

# From apps/backend/api
npm run dev                      # Start dev server with hot reload
npm run type-check               # Type checking (watch mode)
npm run build                    # Build for production
npm run test                     # Run tests
```

## Repository Structure

```
HuntHub/
├── apps/
│   ├── backend/
│   │   └── api/                # Express + TypeScript API (@hunthub/api)
│   │       ├── src/
│   │       │   ├── config/     # App configuration
│   │       │   ├── controllers/ # HTTP handlers
│   │       │   ├── db/         # Models, schemas, types
│   │       │   ├── middlewares/ # Express middlewares
│   │       │   ├── routes/     # Route definitions
│   │       │   ├── services/   # Business logic
│   │       │   ├── types/      # TypeScript types
│   │       │   └── utils/      # Helpers, errors, validation
│   │       ├── tests/          # Integration tests
│   │       ├── firebaseService.json # (gitignored, see .example)
│   │       └── package.json    # @hunthub/api
│   └── frontend/
│       ├── editor/             # Hunt creation app (desktop) [Not started]
│       └── player/             # Hunt playing app (mobile-responsive) [Not started]
├── packages/
│   └── shared/                 # Shared types, validation, constants (@hunthub/shared)
│       ├── src/
│       │   ├── types/          # Generated from OpenAPI
│       │   ├── schemas/        # Zod validation schemas
│       │   ├── constants/      # Enums, configs
│       │   └── index.ts        # Barrel exports
│       ├── openapi/            # OpenAPI schema (source of truth)
│       ├── scripts/            # Type generation scripts
│       └── package.json        # @hunthub/shared
├── .claude/                    # Claude Code memory files
├── node_modules/               # Hoisted dependencies
└── package.json                # Root workspace config
```
