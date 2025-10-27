# Project State & Context

**Last updated:** 2025-10-27

## Current Focus

🎯 **Finishing the backend** before moving to frontend and deployment

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

**2025-10-27: Monorepo Restructure for Multiple Apps** ✅
- Reorganized for 2 frontends (editor + player) + 1 backend (API)
- Moved `apps/backend/` → `apps/backend/api/` (renamed to `@hunthub/api`)
- Created structure: `apps/backend/*` and `apps/frontend/*`
- Updated workspace config to support nested app structure
- Ready for React editor and player apps to be added
- Backend compiles cleanly with new structure

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
✅ Backend server runs (needs MongoDB connection fix)
✅ Firebase service account configured
✅ User registration and login
✅ Hunt creation and retrieval
✅ Basic error handling and validation

## Immediate Next Steps

**Updated: 2025-10-26 after completing monorepo setup**

**All critical decisions made. Ready to build.**

**Priority 1: ~~Set up monorepo~~** ✅ **COMPLETE**
- ✅ Created packages/shared, packages/backend
- ✅ Configured npm workspaces
- ✅ Set up OpenAPI → TypeScript generation
- ✅ Updated all imports to @hunthub/shared
- ✅ Configured tsconfig-paths for runtime resolution

**Priority 2: Implement Tree VIEW API** (~1 week) **← CURRENT PRIORITY**
1. Create `GET /api/hunts/:id/tree` endpoint (compact step list)
2. Update `GET /api/hunts` to include `stepCount`
3. Ensure `GET /api/steps/:id` returns full details
4. Add database indexes (huntId, order)
5. Frontend tree component (lazy loads steps)

**See:** `.claude/tree-and-branching-strategy.md` for complete design

**Why this is priority:** Better editor UX, production-quality API pattern, foundation for future branching

**Priority 3: Complete Hunt CRUD** (~3-4 days)
1. Update hunt endpoint (PUT /api/hunts/:id)
2. Delete hunt endpoint (DELETE /api/hunts/:id)
3. Validation with Zod schemas

**Priority 4: Step Management** (~1 week)
1. Add step to hunt (POST /api/hunts/:id/steps)
2. Update step (PUT /api/steps/:id)
3. Delete step (DELETE /api/steps/:id)
4. Reorder steps (PUT /api/hunts/:id/step-order)

**Priority 5: Publishing MVP** (~1-2 weeks)
1. Simplified workflow: Draft → Published (skip Review for MVP)
2. Publish hunt (clone hunt + steps)
3. Create PublishedHunt record
4. Create LiveHunt record
5. Get live version for playing

**Priority 6: Hunt Player** (~1-2 weeks)
1. Get live hunt for playing
2. Submit step completion
3. Track progress
4. Completion flow

## Blockers

**[NONE CURRENTLY]**

## Future Consideration

**Context file structure:** If `backend/current-state.md` grows too large (200+ lines), consider splitting into:
- `roadmap.md` (planned features)
- `progress.md` (active work)
- `changelog.md` (completed history)

For now, keeping it simple with single file until we see if it becomes unwieldy.

## Questions to Resolve

**All major questions answered on 2025-02-05:**

1. ✅ Hunt participation flow - Defined in publishing-workflow.md
2. ⚠️ Location verification - To be designed during player implementation
3. ✅ Frontend tech stack - React + MUI + TypeScript (see frontend/overview.md)
4. ⚠️ Deployment - TBD (see deployment/strategy.md)
5. ✅ Type sharing - Monorepo with shared package (DECIDED)

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
