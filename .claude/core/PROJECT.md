# HuntHub Project Overview

**Last updated:** 2025-11-08

---

## What is HuntHub?

**A location-based treasure hunt creation and playing platform** that allows users to design scavenger hunts and share them via QR codes.

**Key Goal:** Portfolio showcase - fully developed product, simple yet high quality, demonstrating production-grade patterns.

**See:** `core/ROADMAP.md` for development timeline and progress tracking.

---

## 🎯 Project Meta-Goal

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

---

## Target Users

**Primary Users:**
- Individuals creating treasure hunts for friends/family
- Event organizers creating interactive experiences
- (Future) NGOs and organizations creating recurring hunts

**User Personas:**
1. **Creator** - Designs and publishes treasure hunts
2. **Player** - Participates in published hunts via mobile

---

## Core Value Proposition

- **Easy hunt creation** - Intuitive editor for creating multi-step treasure hunts
- **QR code sharing** - Simple distribution via scannable codes
- **Version control** - Manage drafts, publish versions, release to players
- **Collaboration** - Share hunts with team members (Owner/Admin/View permissions)
- **Play anywhere** - Mobile-friendly player interface

---

## Application Structure

### Two Main Parts

**1. Editor App** (authenticated users)
- Create, edit, and manage hunts
- Preview hunts before publishing
- Version management and publishing workflow
- Hunt sharing and collaboration
- Hunt analytics and results

**2. Player App** (public, accessed via QR code)
- Play published hunts step-by-step
- Location-based challenge verification
- Progress tracking
- Completion screen

**Same domain, different routes:**
```
hunthub.com/          → Home/landing page
hunthub.com/auth      → Authentication
hunthub.com/dashboard → Hunt management (editor)
hunthub.com/edit/:id  → Hunt editor
hunthub.com/play/:id  → Hunt player (public)
```

---

## Technical Stack

**Frontend:** React + Material-UI (planned)
**Backend:** Node.js + Express + TypeScript + MongoDB + Mongoose
**Auth:** Firebase Authentication
**Storage:** AWS S3 + CloudFront CDN
**Payment:** Stripe (future)
**DI:** InversifyJS
**Validation:** Zod + OpenAPI

**Key Technical Challenge:**
Schema sharing between backend and frontend while maintaining proper validation at all layers (UI, API, DB)

**See:** `decisions/schema-sharing-final-strategy.md` for type sharing approach

---

## What's Working Now

### Infrastructure ✅

- Monorepo structure with npm workspaces
- Shared package for types and constants (@hunthub/shared)
- OpenAPI → TypeScript type generation
- Runtime module resolution with tsconfig-paths
- Backend server with production-grade patterns
- Firebase authentication

### Core Backend Features ✅

**Hunt Versioning System:**
- Hunt (master) + HuntVersion (content) separation
- Atomic transaction support (MongoDB replica set)
- Draft version editing with protection
- Cascade delete for data integrity
- Cross-version validation

**Publishing & Release Workflow:**
- Full publishing system with optimistic locking
- POST /api/publishing/hunts/:id/publish endpoint
- PUT/DELETE /api/publishing/hunts/:id/release endpoints
- Helper modules (VersionValidator, VersionPublisher, StepCloner, ReleaseManager)
- Hunt DTO with version metadata
- Transaction safety throughout
- Race condition prevention
- Delete protection for live hunts

**Hunt Sharing & Collaboration:**
- Three-tier permission model (Owner > Admin > View)
- HuntAccess model with separate table design
- AuthorizationService with rich AccessContext
- Share/update/revoke/list collaborators endpoints (4/4)
- Query optimization (N+1 prevention)
- Security guarantees (cannot escalate permissions, owner immutable)

**Complete CRUD Operations:**
- Hunt CRUD (6/6 endpoints)
- Step CRUD (3/3 endpoints) with optimistic locking
- Asset CRUD (5/5 endpoints) with AWS S3 integration
- Publishing (1/1 endpoint)
- Release (2/2 endpoints)
- Hunt Sharing (4/4 endpoints)

**Testing Infrastructure:**
- MongoDB Memory Replica Set
- **185/185 tests passing** across all features:
  - Hunt CRUD (23 tests)
  - Step CRUD (20 tests)
  - Asset Management (26 tests)
  - Publishing Workflow (34 tests)
  - Authorization Service (46 tests)
  - Hunt Sharing (36 tests)

---

## Implementation Status

**See:** `backend/current-state.md` for detailed backend implementation tracking.

**Completed Work:**
- ✅ Week 1: Hunt CRUD + Step CRUD
- ✅ Week 2-3: Asset Management with AWS S3
- ✅ Week 3-4: Hunt Versioning System
- ✅ Week 4-5: Publishing Workflow
- ✅ Week 5: Release Workflow
- ✅ Week 5: Hunt Sharing & Collaboration

**Current Priority: Player API** (Weeks 5-6)

Publishing, Release, and Sharing are complete - now enable hunt playing!

1. **PlaySession model** - Track active gameplay sessions
2. **Start hunt endpoint** - POST /api/play/:huntId/start (create session)
3. **Submit answer endpoint** - POST /api/play/sessions/:sessionId/submit (validate answers)
4. **Hint endpoint** - POST /api/play/sessions/:sessionId/hint (request hints)
5. **Challenge validation by type** - Clue, Quiz, Mission, Task validators
6. **Progress tracking** - Update Progress model with session tracking

**See:** `core/ROADMAP.md` for complete development timeline and priorities.

---

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

---

## Repository Structure

```
HuntHub/
├── apps/
│   ├── backend/
│   │   └── api/                # Express + TypeScript API (@hunthub/api)
│   │       ├── src/
│   │       │   ├── config/     # App configuration
│   │       │   ├── controllers/ # HTTP handlers
│   │       │   ├── database/   # Models, schemas, types
│   │       │   ├── middlewares/ # Express middlewares
│   │       │   ├── routes/     # Route definitions
│   │       │   ├── services/   # Business logic
│   │       │   ├── features/   # Feature modules
│   │       │   └── utils/      # Helpers, errors, validation
│   │       ├── tests/          # Integration tests
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
│       └── package.json        # @hunthub/shared
├── .claude/                    # Claude Code memory files
└── package.json                # Root workspace config
```

---

## Success Metrics

**As a portfolio piece:**
- Clean, professional UI
- Working end-to-end
- Deployed and accessible
- Good code quality
- Well-documented
- Production-grade patterns demonstrated

**For real usage (nice to have):**
- Number of hunts created
- Number of hunts played
- Completion rate
- User retention

---

## Major Decisions Made

- ✅ MongoDB (with production best practices) - See `decisions/mongodb-vs-postgres.md`
- ✅ Monorepo with shared types (production standard) - See `decisions/schema-sharing-final-strategy.md`
- ✅ OpenAPI as source of truth
- ✅ Separate steps collection (better for progress tracking)
- ✅ Skip Review state for MVP (add later with OCP)
- ✅ Simplified publishing workflow (MVP)
- ✅ Single Hunt DTO with full metadata (optimize later with HuntCompact if needed)
- ✅ Three-tier permission model for collaboration (Owner > Admin > View)

**See:** `decisions/` folder for detailed decision documentation.

---

**Updated:** 2025-11-08
