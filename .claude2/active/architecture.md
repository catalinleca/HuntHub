# HuntHub Architecture

**THE MOST IMPORTANT FILE.** This is the mental model of the entire system.

---

## What We're Building

**HedgeHunt** - A location-based treasure hunt platform.

**Domain:** `hedgehunt.app`
- `build.hedgehunt.app` → Editor app (create hunts)
- `play.hedgehunt.app` → Player app (play hunts)

**User Flow:**
1. **Creator** builds a hunt in the Editor (steps, challenges, locations)
2. **Creator** publishes and releases the hunt
3. **Players** scan QR code or visit link → play the hunt step by step
4. **Players** complete challenges (quizzes, find locations, take photos)

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        MONOREPO                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐            │
│  │   EDITOR    │   │   PLAYER    │   │   BACKEND   │            │
│  │  (React)    │   │  (React)    │   │  (Express)  │            │
│  │             │   │             │   │             │            │
│  │ build.      │   │ play.       │   │ api.        │            │
│  │ hedgehunt   │   │ hedgehunt   │   │ hedgehunt   │            │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘            │
│         │                 │                 │                    │
│         └────────┬────────┴────────┬────────┘                    │
│                  │                 │                             │
│         ┌───────┴───────┐  ┌──────┴──────┐                      │
│         │    SHARED     │  │   COMPASS   │                      │
│         │ types/schemas │  │ MUI themes  │                      │
│         └───────────────┘  └─────────────┘                      │
│                                                                  │
│         ┌───────────────┐                                       │
│         │  PLAYER-SDK   │                                       │
│         │ iframe comms  │                                       │
│         └───────────────┘                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Applications

### Backend API (`apps/backend/api/`)

**Status:** ✅ Complete (217 tests passing)

**Tech:** Node.js + Express + TypeScript + MongoDB + Firebase Auth + AWS S3

**Features:**
- Hunt CRUD with versioning (Hunt + HuntVersion separation)
- Step CRUD with optimistic locking
- Asset management (S3 presigned URLs, CloudFront CDN)
- Publishing workflow (draft → publish → release)
- Hunt sharing (Owner > Admin > View permissions)
- Play API (sessions, validation, progress tracking)

**Layers:** Router → Middleware → Controller → Service → Model

**DI:** InversifyJS (`@injectable()`, `@inject()`)

### Editor App (`apps/frontend/editor/`)

**Status:** 🚧 In Progress

**Tech:** React 19 + Vite + TypeScript + MUI v6 + styled-components

**Purpose:** Create and manage treasure hunts
- Dashboard (hunt library)
- Hunt editor (steps, challenges, settings)
- Preview (embedded player)
- Publishing and release management

**State:**
- Server state → React Query
- UI state → Zustand
- Form state → React Hook Form + Zod

### Player App (`apps/frontend/player/`)

**Status:** 🚧 Started

**Tech:** React 19 + Vite + TypeScript + MUI v6 + styled-components

**Purpose:** Play treasure hunts (mobile-first)
- Step-by-step challenge progression
- Location verification (GPS)
- Photo/audio capture
- AI validation for creative tasks

**Architecture Pattern: Layer Separation**
```
PlayPage
    ↓
PlaySessionProvider (React Context)
    ↓
┌───────────────┬───────────────┬───────────────┐
│ SessionLayer  │  StepLayer    │ ValidationHook│
│ (session mgmt)│ (step fetch)  │ (answers)     │
└───────┬───────┴───────┬───────┴───────┬───────┘
        │               │               │
        └───────────────┼───────────────┘
                        ↓
              React Query Cache
                        ↓
                   Backend API
```

**Key Patterns:**
- **HATEOAS** - Server provides `_links` for navigation, client follows them
- **Prefetching** - Fetch next step while playing current → instant transitions
- **Session persistence** - localStorage saves sessionId for resume
- **Version lock** - Session locks to hunt version at start (creator changes don't affect active players)

---

## Packages (CRITICAL)

### @hunthub/shared (`packages/shared/`)

**THE MOST IMPORTANT PACKAGE.** Single source of truth for types.

**Structure:**
```
shared/
├── openapi/
│   └── hunthub_models.yaml    ← OpenAPI schema (SOURCE OF TRUTH)
├── src/
│   ├── types/                 ← Generated TypeScript types
│   ├── schemas/               ← Generated Zod schemas
│   ├── constants/             ← Enums, configs
│   └── exporters/             ← Data transformers for player
└── package.json
```

**Imports:**
```typescript
// Types
import { Hunt, Step, Challenge } from '@hunthub/shared';

// Zod schemas (separate to avoid naming conflicts)
import { HuntCreate, StepUpdate } from '@hunthub/shared/schemas';

// Constants
import { ChallengeType, HuntStatus } from '@hunthub/shared';
```

**Generation:**
```bash
npm run generate           # Generate types + Zod from OpenAPI
npm run generate:types     # Types only
npm run generate:zod       # Zod schemas only
```

**RULE:** When adding new API types:
1. Add to `packages/shared/openapi/hunthub_models.yaml`
2. Run `npm run generate`
3. Import from `@hunthub/shared`

### @hunthub/compass (`packages/compass/`)

**MUI theme library** - design system for both frontend apps.

**Provides:**
- Theme presets (treasure-map, etc.)
- Design tokens
- MUI overrides
- Mixins and utilities
- Type-safe selectors

**Imports:**
```typescript
import { createTheme } from '@hunthub/compass';
import { tokens } from '@hunthub/compass/tokens';
import { stateSelector } from '@hunthub/compass/selectors';
```

### @hunthub/player-sdk (`packages/player-sdk/`)

**Communication layer** between Editor and embedded Player iframe.

**Used for:** Preview mode in Editor - Editor embeds Player in iframe and communicates hunt data.

---

## Data Architecture

### Hunt Versioning

```
Hunt (master record)
├── huntId (numeric)
├── creatorId
├── latestVersion (draft)
└── liveVersion (published, nullable)

HuntVersion (content snapshot)
├── huntId + version (compound key)
├── name, description, stepOrder
├── isPublished, publishedAt
└── steps[]

Step
├── stepId (numeric)
├── huntId + huntVersion (FK)
└── challenge data
```

**Workflow:**
1. Edit draft (latestVersion)
2. Publish → creates immutable version snapshot
3. Release → points liveVersion to published version
4. Players always see liveVersion

### Challenge Types

| Type | Purpose | Validation |
|------|---------|------------|
| **Clue** | Information/guidance | Auto-complete |
| **Quiz** | Multiple choice or text input | Server validates answer |
| **Mission** | Location, photo, or audio | GPS/AI validation |
| **Task** | Free-form AI-validated text | AI validation |

---

## Authentication & Authorization

**Auth:** Firebase Authentication
- Frontend gets Firebase token
- Backend verifies via Firebase Admin SDK
- `authMiddleware` attaches `req.user`

**Permissions (Hunt Sharing):**
| Role | Can Do |
|------|--------|
| **Owner** | Everything (immutable) |
| **Admin** | Edit, publish, share (no delete) |
| **View** | Read-only |

---

## Key Patterns

### Type Flow

```
OpenAPI YAML → Generate → TypeScript Types → @hunthub/shared
                                ↓
                    Backend imports ← → Frontend imports
```

**Never duplicate types.** Always import from `@hunthub/shared`.

### Backend Layers

```
Request → Router → Middleware → Controller → Service → Model → Response
                     (auth)      (HTTP)     (logic)   (DB)
```

- Controllers: HTTP only, delegate to services
- Services: Business logic, return API types (not DB types)
- Models: Mongoose, use `toJSON()` for serialization

### Frontend State

```
Server State → React Query (useQuery, useMutation)
UI State     → Zustand (minimal, only what's needed)
Form State   → React Hook Form + Zod
```

### Player HATEOAS Pattern

Server responses include `_links` - client doesn't hardcode navigation:

```typescript
// Step response
{
  step: { stepId: 1, type: "clue", ... },
  _links: {
    self: { href: "/sessions/abc/step/current" },
    next: { href: "/sessions/abc/step/next" },    // Not present on last step!
    validate: { href: "/sessions/abc/validate" }
  }
}
```

- **Has `next` link** → not last step, prefetch it
- **No `next` link** → last step, show "Finish Hunt"
- **After correct answer** → invalidate cache, UI instantly shows prefetched next step

### Editor Preview Pattern

Editor embeds Player in iframe for preview:
```
Editor                    Player (iframe)
   │                           │
   │ ─── player-sdk ──────────▶│
   │     (hunt data)           │
   │                           │
   │◀── player-sdk ───────────│
   │     (step events)         │
```

---

## Folder Structure

```
HuntHub/
├── apps/
│   ├── backend/
│   │   └── api/                  # Express API
│   │       ├── src/
│   │       │   ├── config/       # DI, Firebase config
│   │       │   ├── controllers/
│   │       │   ├── services/
│   │       │   ├── database/
│   │       │   │   ├── models/
│   │       │   │   └── types/    # DB interfaces (IHunt)
│   │       │   ├── routes/
│   │       │   ├── middlewares/
│   │       │   └── features/     # Feature modules (publishing, play)
│   │       └── tests/
│   └── frontend/
│       ├── editor/               # Hunt creation app
│       │   └── src/
│       │       ├── components/
│       │       ├── pages/
│       │       ├── hooks/        # React Query hooks
│       │       ├── stores/       # Zustand stores
│       │       └── theme/
│       └── player/               # Hunt playing app
│           └── src/
│               ├── api/play/         # React Query hooks for play API
│               ├── context/
│               │   └── PlaySession/  # Session provider + layers
│               ├── components/
│               │   └── challenges/   # ClueChallenge, QuizChallenge, etc.
│               ├── pages/
│               │   └── PlayPage/
│               └── hooks/            # useStepValidation, etc.
├── packages/
│   ├── shared/                   # Types, schemas (MOST IMPORTANT)
│   ├── compass/                  # MUI theme library
│   └── player-sdk/               # Editor-Player communication
└── .claude2/                     # Documentation
```

---

## NPM Scripts

**From root:**
```bash
npm run dev:api          # Start backend
npm run dev:editor       # Start editor
npm run dev:player       # Start player
npm run build:shared     # Build shared package
npm run generate         # Generate types from OpenAPI
npm run test             # Run all tests
```

**From apps/backend/api:**
```bash
npm run dev              # Dev server with hot reload
npm run test             # Run tests
npm run type-check       # Type checking
```

---

## Current State (January 2026)

| Component | Status | Notes |
|-----------|--------|-------|
| Backend API | ✅ Complete | 217 tests, all features |
| @hunthub/shared | ✅ Complete | Types, schemas, exporters |
| @hunthub/compass | ✅ Complete | Theme library |
| @hunthub/player-sdk | ✅ Complete | Iframe communication |
| Editor App | 🚧 In Progress | Core features working |
| Player App | 🚧 Started | Basic structure |

---

## Key Files to Know

| What | Where |
|------|-------|
| OpenAPI schema | `packages/shared/openapi/hunthub_models.yaml` |
| Generated types | `packages/shared/src/types/` |
| Generated Zod | `packages/shared/src/schemas/gen/` |
| Backend routes | `apps/backend/api/src/routes/` |
| DI container | `apps/backend/api/src/config/inversify.ts` |
| Editor pages | `apps/frontend/editor/src/pages/` |
| Player challenges | `apps/frontend/player/src/components/challenges/` |
| Theme presets | `packages/compass/src/presets/` |
