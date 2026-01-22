# Codebase Quick Reference

**For full structure, see `architecture.md` → "Folder Structure" and "Key Files to Know".**

---

## Critical Entry Points

| Need | File |
|------|------|
| **API types (source)** | `packages/shared/openapi/hunthub_models.yaml` |
| **Generated types** | `packages/shared/src/types/index.ts` |
| **Zod schemas** | `packages/shared/src/schemas/gen/index.ts` |
| **DI container** | `apps/backend/api/src/config/inversify.ts` |
| **Backend server** | `apps/backend/api/src/server.ts` |
| **Editor main page** | `apps/frontend/editor/src/pages/Hunt/HuntPage.tsx` |
| **Player main page** | `apps/frontend/player/src/pages/PlayPage/PlayPage.tsx` |
| **Player session context** | `apps/frontend/player/src/context/PlaySession/` |
| **Theme** | `packages/compass/src/presets/treasure-map/theme.ts` |

---

## Backend: modules/ vs features/

```
src/
├── modules/          # Core CRUD (hunts, steps, assets, auth)
└── features/         # Domain features (play, publishing, sharing, preview)
```

**Rule:** Core resources → `modules/`. Business workflows → `features/`.

---

## How to Find Things

```bash
# Backend service/controller
ls apps/backend/api/src/modules/**/hunt*
ls apps/backend/api/src/features/**/play*

# Frontend component
ls apps/frontend/editor/src/**/*Card*

# React Query hooks
ls apps/frontend/*/src/api/**/use*.ts

# Styled components
ls apps/frontend/*/src/**/*.styles.ts

# Backend mappers (DB → API)
ls apps/backend/api/src/shared/mappers/

# Tests
ls apps/backend/api/tests/integration/
```

---

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Backend service | `*.service.ts` | `hunt.service.ts` |
| Backend controller | `*.controller.ts` | `hunt.controller.ts` |
| Backend routes | `*.routes.ts` | `hunt.routes.ts` |
| DB model | `PascalCase.ts` | `Hunt.ts` |
| DB type | `I{Model}` in `database/types/` | `IHunt` |
| React Query hook | `use*.ts` | `useGetHunt.ts` |
| Styled component | `*.styles.ts` | `HuntCard.styles.ts` |
| Zod schema | `*Schema.ts` | `StepFormSchema.ts` |
