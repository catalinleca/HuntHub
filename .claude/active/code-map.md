# Codebase Guide

Location reference. Shows WHERE things are and naming patterns.

---

## Monorepo Structure

```
apps/
├── backend/api/          # Express API
├── frontend/editor/      # Hunt creation (React)
└── frontend/player/      # Hunt playing (React)

packages/
├── shared/               # Types, schemas, constants
└── compass/              # Theme + design tokens
```

---

## Backend (`apps/backend/api/src/`)

### Entry Points
| Purpose | Location |
|---------|----------|
| Server setup | `server.ts` |
| DI container | `config/inversify.ts` |
| Environment | `config/env.config.ts` |

### Core Structure
```
modules/                  # CRUD resources
├── hunts/               # hunt.service.ts, hunt.controller.ts, hunt.routes.ts
├── steps/
├── assets/
├── auth/
└── users/

features/                 # Domain workflows
├── play/                # Session, validation
│   └── helpers/validators/
├── publishing/          # Publish, release
│   └── helpers/
├── sharing/             # hunt-share.*.ts
├── preview/
├── ai-generation/       # ai-hunt-generation.*.ts
├── cloning/             # clone.*.ts
└── player-invitations/

services/                 # Cross-cutting
├── authorization/
├── storage/
├── ai-validation/
└── asset-usage/

shared/
├── mappers/             # DB ↔ API transformers
├── errors/              # Custom error classes
├── middlewares/         # auth, validation, error, rate-limiter
└── types/               # DI symbols

database/
├── models/              # Mongoose models (Hunt.ts, Step.ts, etc.)
├── types/               # Interfaces (IHunt, IStep, etc.)
└── schemas/             # Embedded schemas
```

---

## Editor (`apps/frontend/editor/src/`)

### Entry Points
| Purpose | Location |
|---------|----------|
| App bootstrap | `main.tsx`, `App.tsx` |
| Query client | `config/queryClient.ts` |

### Core Structure
```
pages/
├── Dashboard/
│   └── components/
└── Hunt/
    ├── HuntPage.tsx
    ├── HuntLayout.tsx
    ├── context/
    ├── hooks/
    ├── HuntHeader/
    ├── HuntForm/
    ├── HuntStepTimeline/
    ├── HuntSteps/
    │   └── StepSettings/
    └── HuntPreview/

api/                      # React Query
├── Hunt/                # getHunt.ts, createHunt.ts, etc.
│   └── sharing/
├── Step/
└── Asset/

components/
├── form/                # Form primitives
├── asset/               # Asset management
├── common/              # Shared UI
└── ...                  # HuntCard, NavBar, etc.

stores/                   # Zustand (use*Store.ts)
contexts/                 # AuthContext.tsx
utils/
├── transformers/
├── factories/
└── stepSettings/
```

---

## Player (`apps/frontend/player/src/`)

### Entry Points
| Purpose | Location |
|---------|----------|
| App bootstrap | `main.tsx`, `App.tsx` |
| Routes | `router/` |

### Core Structure
```
pages/
├── PlayPage/
│   ├── challenges/
│   └── components/
├── PreviewPage/
├── AuthorPreviewPage/
└── NotFoundPage/

context/
├── PlaySession/         # *SessionProvider.tsx, hooks.ts
│   └── internal/
└── Validation/          # *ValidationProvider.tsx

api/
├── play/                # useStartSession.ts, useValidateAnswer.ts, etc.
└── asset/

components/
├── step/
├── media/
├── preview/
└── core/

hooks/
services/
```

---

## Shared Package (`packages/shared/`)

| Purpose | Location |
|---------|----------|
| API types (source) | `openapi/hunthub_models.yaml` |
| Generated types | `src/types/index.ts` |
| Generated Zod | `src/schemas/gen/index.ts` |
| Constants | `src/constants/` |
| PlayerExporter | `src/exporters/` |

---

## Compass Package (`packages/compass/src/`)

| Purpose | Location |
|---------|----------|
| MUI theme | `presets/treasure-map/theme.ts` |
| Design tokens | `tokens/` |
| Style mixins | `mixins/` |
| Component overrides | `overrides/` |

---

## Naming Patterns

| Type | Pattern | Example |
|------|---------|---------|
| Backend service | `*.service.ts` | `hunt.service.ts` |
| Backend controller | `*.controller.ts` | `hunt.controller.ts` |
| Backend routes | `*.routes.ts` | `hunt.routes.ts` |
| Backend helper | `*.helper.ts` | `step-cloner.helper.ts` |
| DB model | `PascalCase.ts` | `Hunt.ts` |
| DB interface | `I{Model}` | `IHunt` |
| Mapper | `*.mapper.ts` | `hunt.mapper.ts` |
| React Query hook | `use*.ts` | `useGetSession.ts` |
| React Query fn | `camelCase.ts` | `getHunt.ts` |
| Context provider | `*Provider.tsx` | `PlaySessionProvider.tsx` |
| Styled component | `*.styles.ts` | `HuntCard.styles.ts` |
| Zustand store | `use*Store.ts` | `useDialogStore.ts` |
