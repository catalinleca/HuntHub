# Project State & Context

**Last updated:** 2025-02-05

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

✅ Backend server runs and connects to MongoDB
✅ Firebase authentication integrated
✅ User registration and login
✅ Hunt creation and retrieval
✅ Basic error handling and validation

## Immediate Next Steps

**Updated: 2025-02-05 after completing requirements session**

**All critical decisions made. Ready to build.**

**Priority 1: Set up monorepo** (~4-5 hours)
- Create packages/shared, packages/backend, packages/frontend
- Configure npm workspaces
- Set up OpenAPI → TypeScript → Zod generation
- Update imports to @hunthub/shared
- See: `schema-sharing-final-strategy.md`

**Priority 2: Complete Hunt CRUD** (~1 week)
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
cd /Users/catalinleca/leca/HuntHub/backend
claude  # Boot Claude Code - context auto-loads
```

**Common tasks:**
```bash
npm run dev          # Start development server
npm run type-check   # Type checking
npm run lint         # Lint code
npm run format       # Format code
```

## Repository Structure

```
HuntHub/
├── backend/         # Express + TypeScript API (current work)
├── frontend/        # [Not started]
└── .claude/         # Claude Code memory files
```
