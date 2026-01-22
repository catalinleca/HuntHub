# Codebase Guide

Complete location reference. No searching needed.

---

## Monorepo Structure

```
apps/
├── backend/api/          # Express API (Node.js + TypeScript)
├── frontend/editor/      # Hunt creation app (React + Vite)
└── frontend/player/      # Hunt playing app (React + Vite)

packages/
├── shared/               # Types, schemas, constants, exporters
└── compass/              # UI component library + theme
```

---

## Backend (`apps/backend/api/src/`)

### Entry Points
| File | Purpose |
|------|---------|
| `server.ts` | Express app setup, middleware chain |
| `config/inversify.ts` | DI container, service bindings |
| `config/env.config.ts` | Environment variables |

### modules/ (Core CRUD)
```
modules/
├── hunts/
│   ├── hunt.service.ts      # Hunt CRUD, getUserHunts
│   ├── hunt.controller.ts   # HTTP handlers
│   ├── hunt.routes.ts       # Route definitions
│   └── hunt.validation.ts   # Zod schemas
├── steps/
│   ├── step.service.ts      # Step CRUD with transactions
│   ├── step.controller.ts
│   └── step.routes.ts
├── assets/
│   ├── asset.service.ts     # S3 upload, asset CRUD
│   └── asset.controller.ts
├── auth/
│   └── auth.middleware.ts   # Firebase token verification
└── users/
    └── user.service.ts      # User lookup/creation
```

### features/ (Domain Workflows)
```
features/
├── play/
│   ├── play.service.ts      # Session management, validation
│   ├── play.controller.ts
│   ├── play.routes.ts
│   └── helpers/
│       ├── validators/      # Quiz, Clue, Mission, Task validators
│       └── answer-validator.helper.ts
├── publishing/
│   ├── publishing.service.ts
│   └── helpers/
│       ├── version-validator.ts
│       ├── version-publisher.ts
│       ├── step-cloner.ts
│       └── release-manager.ts
├── sharing/
│   └── sharing.service.ts   # Hunt collaboration
├── preview/
│   └── preview.service.ts   # Author preview with signed URLs
├── ai-generation/
│   └── ai-generation.service.ts
└── cloning/
    └── cloning.service.ts   # Hunt duplication
```

### services/ (Cross-Cutting)
```
services/
├── authorization/
│   └── authorization.service.ts  # Permission checks, AccessContext
├── storage/
│   └── storage.service.ts        # S3 presigned URLs
├── ai-validation/
│   └── ai-validation.service.ts  # OpenAI validation
└── asset-usage/
    └── asset-usage.service.ts    # Track asset references
```

### shared/ (Internal Utilities)
```
shared/
├── mappers/          # DB ↔ API transformers (HuntMapper, StepMapper)
├── errors/           # Custom errors (NotFoundError, ForbiddenError)
├── middlewares/      # Auth, validation, error handling
├── validation/       # validateRequest helper
└── types/            # TYPES symbols for DI
```

### database/
```
database/
├── models/           # Mongoose models (Hunt.ts, Step.ts, HuntVersion.ts)
├── types/            # DB interfaces (IHunt, IStep, IHuntVersion)
└── schemas/          # Embedded schemas (location, challenge)
```

### tests/
```
tests/
└── integration/      # All integration tests by feature
```

---

## Editor (`apps/frontend/editor/src/`)

### Entry Points
| File | Purpose |
|------|---------|
| `main.tsx` | React app bootstrap |
| `App.tsx` | Router, providers |
| `config/queryClient.ts` | React Query setup |

### pages/
```
pages/
├── Dashboard/
│   ├── DashboardPage.tsx
│   └── components/
│       ├── HuntActionCard/
│       ├── DashboardHero/
│       ├── RecentHunts/
│       └── AllHunts/
└── Hunt/
    ├── HuntPage.tsx              # Main hunt editor page
    ├── context/                  # Hunt page context
    ├── hooks/                    # Hunt-specific hooks
    ├── HuntHeader/               # Top bar with actions
    │   └── components/
    ├── HuntForm/                 # Hunt metadata form
    ├── HuntStepTimeline/         # Step list/timeline
    │   └── components/
    ├── HuntSteps/                # Step editing
    │   ├── StepSettings/         # Challenge type config
    │   └── components/
    └── HuntPreview/              # Preview iframe
```

### api/ (React Query)
```
api/
├── Hunt/
│   ├── useGetHunt.ts
│   ├── useGetHunts.ts
│   ├── useCreateHunt.ts
│   ├── useUpdateHunt.ts
│   ├── useDeleteHunt.ts
│   ├── usePublishHunt.ts
│   ├── useReleaseHunt.ts
│   └── sharing/              # Collaboration hooks
├── Step/
│   ├── useCreateStep.ts
│   ├── useUpdateStep.ts
│   └── useDeleteStep.ts
└── Asset/
    ├── useUploadAsset.ts
    └── useGetAssets.ts
```

### components/
```
components/
├── form/                     # Form primitives
│   ├── core/                 # Base inputs
│   ├── components/           # Composed form fields
│   └── ArrayInput/           # Dynamic arrays
├── asset/                    # Asset management
│   ├── AssetPreview/
│   ├── ImagePreview/
│   ├── AudioPreview/
│   ├── VideoPreview/
│   ├── AssetLibraryDrawer/
│   └── CreateAssetModal/
├── common/                   # Shared UI
│   ├── SimpleModal/
│   ├── ToggleButton/
│   └── Select/
├── HuntCard/
├── HuntCardMenu/
├── HuntDialog/
├── ConfirmationDialog/
├── NavBar/
└── UserMenu/
```

### Other
```
stores/               # Zustand stores (UI state)
contexts/             # React contexts
utils/
├── transformers/     # Form ↔ API data transforms
├── factories/        # Default object creators
└── stepSettings/     # Step type configurations
types/                # Local TypeScript types
```

---

## Player (`apps/frontend/player/src/`)

### Entry Points
| File | Purpose |
|------|---------|
| `main.tsx` | React app bootstrap |
| `App.tsx` | Router, providers |
| `router/` | Route definitions |

### pages/
```
pages/
├── PlayPage/
│   ├── PlayPage.tsx          # Main play page
│   ├── challenges/           # Challenge type renderers
│   └── components/           # Play UI components
├── PreviewPage/
│   ├── PreviewPage.tsx       # Editor preview (iframe)
│   └── components/
├── AuthorPreviewPage/        # Author preview with signed URLs
└── NotFoundPage/
```

### context/ (State Management)
```
context/
├── PlaySession/
│   ├── PlaySessionProvider.tsx       # Main session provider
│   ├── EditorPreviewSessionProvider.tsx
│   ├── SessionContexts.ts            # Types, contexts
│   ├── hooks.ts                      # Selector hooks
│   └── internal/
│       ├── deriveStatus.ts
│       └── sessionStorage.ts
└── Validation/
    ├── ApiValidationProvider.tsx     # Real validation
    └── EditorPreviewProvider.tsx     # Mock validation
```

### api/
```
api/
├── play/
│   ├── useStartSession.ts
│   ├── useGetSession.ts
│   ├── useValidateAnswer.ts
│   └── useRequestHint.ts
└── asset/
    └── useUploadPlayerAsset.ts
```

### components/
```
components/
├── step/             # Step rendering components
├── media/            # Media capture/display
├── preview/          # Preview-specific components
└── core/
    ├── ErrorFallback/
    └── Spinner/
```

### Other
```
hooks/
├── preview/          # Preview-specific hooks
services/             # Non-React services
styles/               # Global styles
constants/            # App constants
types/                # Local types
```

---

## Shared Package (`packages/shared/src/`)

### Source of Truth
| File | Purpose |
|------|---------|
| `openapi/hunthub_models.yaml` | API type definitions (edit this) |
| `types/index.ts` | Generated TypeScript types |
| `schemas/gen/index.ts` | Generated Zod schemas |

### Structure
```
src/
├── types/            # Generated from OpenAPI
├── schemas/
│   ├── gen/          # Generated Zod schemas
│   └── validation/   # Manual validation helpers
├── constants/        # Enums, config values
└── exporters/        # PlayerExporter (strips answers)
```

---

## Compass Package (`packages/compass/src/`)

```
src/
├── presets/
│   └── treasure-map/
│       └── theme.ts      # MUI theme configuration
├── tokens/               # Design tokens
├── mixins/               # Reusable style mixins
└── utils/                # Theme utilities
```

---

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Backend service | `*.service.ts` | `hunt.service.ts` |
| Backend controller | `*.controller.ts` | `hunt.controller.ts` |
| Backend routes | `*.routes.ts` | `hunt.routes.ts` |
| DB model | `PascalCase.ts` | `Hunt.ts`, `HuntVersion.ts` |
| DB interface | `I{Model}` | `IHunt`, `IStep` |
| Mapper | `*.mapper.ts` | `hunt.mapper.ts` |
| React Query hook | `use*.ts` | `useGetHunt.ts` |
| React context | `*Provider.tsx` | `PlaySessionProvider.tsx` |
| Styled component | `*.styles.ts` | `HuntCard.styles.ts` |
| Zod schema | `*Schema` | `StepFormSchema` |
