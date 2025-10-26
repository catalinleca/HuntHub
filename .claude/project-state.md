# Project State & Context

**Last updated:** 2025-10-26

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

**2025-10-26: Monorepo Setup Complete** ✅
- Migrated to npm workspaces monorepo structure
- Created `packages/shared/` for types, validation, and constants
- Moved backend to `packages/backend/`
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

**Priority 2: Fix MongoDB connection and complete Hunt CRUD** (~1 week)
1. Update hunt endpoint
2. Delete hunt endpoint
3. Validation with Zod schemas

**Priority 3: Step Management** (~1 week)
1. Add step to hunt
2. Update step
3. Delete step
4. Reorder steps

**Priority 4: Publishing MVP** (~1-2 weeks)
1. Publish hunt (clone hunt + steps)
2. Create PublishedHunt record
3. Create LiveHunt record
4. Get live version for playing
5. (Skip Review state for MVP)

**Priority 5: Hunt Player** (~1-2 weeks)
1. Get live hunt
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
npm run dev:backend              # Start backend dev server
npm run build:shared             # Build shared package
npm run generate                 # Generate types from OpenAPI
npm run lint                     # Lint all packages
npm run format                   # Format all packages

# From packages/backend
npm run dev                      # Start dev server with hot reload
npm run type-check               # Type checking
npm run build                    # Build for production
```

## Repository Structure

```
HuntHub/
├── packages/
│   ├── shared/                  # Shared types, validation, constants
│   │   ├── src/
│   │   │   ├── types/          # Generated from OpenAPI
│   │   │   ├── constants/      # Enums, configs
│   │   │   └── index.ts        # Barrel exports
│   │   ├── openapi/            # OpenAPI schema (source of truth)
│   │   └── scripts/            # Type generation scripts
│   ├── backend/                # Express + TypeScript API
│   │   ├── src/
│   │   │   ├── config/         # App configuration
│   │   │   ├── controllers/    # HTTP handlers
│   │   │   ├── db/             # Models, schemas, types
│   │   │   ├── middlewares/    # Express middlewares
│   │   │   ├── routes/         # Route definitions
│   │   │   ├── services/       # Business logic
│   │   │   ├── types/          # TypeScript types
│   │   │   └── utils/          # Helpers, errors, validation
│   │   └── firebaseService.json # (gitignored, see .example)
│   └── frontend/               # [Not started]
├── .claude/                    # Claude Code memory files
├── node_modules/               # Hoisted dependencies
└── package.json                # Root workspace config
```
