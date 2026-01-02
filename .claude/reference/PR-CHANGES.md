# PR Changes: Publishing Feature Refactoring

**Files changed:** 30 | **+748 / -175 lines**

---

## TL;DR

Refactored the Hunt editor to eliminate prop drilling, extract business logic into hooks, and add a snackbar notification system. The code is now organized by feature with clear separation of concerns.

---

## Architecture Overview

### Before: Prop Drilling Hell

```mermaid
graph TD
    subgraph "Before Refactoring"
        HL[HuntLayout<br/>15+ props managed here]
        HH[HuntHeader<br/>receives 15 props]
        HT[HuntTitle<br/>8 props]
        AB[ActionBar<br/>6 props]
        VP[VersionPanel<br/>10 props]
        HST[HuntStepTimeline<br/>5 props]

        HL -->|"huntName, version, latestVersion,<br/>liveVersion, isLive, isPublished,<br/>onPublish, onRelease, onTakeOffline,<br/>isPublishing, isReleasing..."| HH
        HH -->|"version, isLive..."| HT
        HH -->|"onSave, onPublish..."| AB
        HH -->|"versions, liveVersion,<br/>onRelease, onTakeOffline..."| VP
        HL -->|"steps, selectedFormKey,<br/>onSelect, onCreate, onMove"| HST
    end
```

**Problems:**
- HuntLayout was bloated (form + steps + publishing logic)
- Props passed through multiple layers
- Hard to trace where data comes from
- Difficult to add new features

### After: Context + Hooks Pattern

```mermaid
graph TD
    subgraph "After Refactoring"
        HL[HuntLayout<br/>just providers]
        FP[FormProvider]
        PP[PublishingProvider]
        HSP[HuntStepsProvider]
        HLC[HuntLayoutContent]

        HL --> FP
        FP --> PP
        PP --> HSP
        HSP --> HLC

        subgraph "Consumers use context directly"
            HH[HuntHeader<br/>3 props]
            AB[ActionBar<br/>usePublishingContext]
            VP[VersionPanel<br/>usePublishingContext]
            HST[HuntStepTimeline<br/>useHuntStepsContext<br/>0 props!]
            SC[StepCard<br/>useHuntStepsContext]
        end

        HLC --> HH
        HLC --> HST
    end
```

**Benefits:**
- Each provider handles one concern
- Components grab what they need via hooks
- Easy to trace data flow
- Adding features = add to context, consumers opt-in

---

## Patterns Used

### 1. Provider + Hook Pattern (React Context)

```mermaid
graph LR
    subgraph "Pattern Structure"
        Hook[usePublishing<br/>Logic + Mutations]
        Provider[PublishingProvider<br/>Wraps hook in context]
        Consumer1[ActionBar<br/>usePublishingContext]
        Consumer2[VersionPanel<br/>usePublishingContext]

        Hook --> Provider
        Provider -.->|context| Consumer1
        Provider -.->|context| Consumer2
    end
```

**Why:** Separates logic (hook) from distribution (context). Hook can be tested independently. Context eliminates prop drilling.

**Files:**
- `usePublishing.ts` - the logic
- `PublishingContext.tsx` - the provider
- Consumers call `usePublishingContext()`

### 2. Feature-First Folder Structure

```
pages/Hunt/
├── context/           # Hunt-scoped contexts
│   ├── PublishingContext.tsx
│   └── HuntStepsContext.tsx
├── hooks/             # Hunt-scoped hooks
│   └── usePublishing.ts
├── HuntLayout.tsx
├── HuntHeader/
│   └── components/
│       ├── ActionBar/
│       └── VersionPanel/
└── HuntStepTimeline/
```

**Why:**
- Hunt is a feature module, not just a page
- Deleting Hunt deletes everything related
- Global stuff stays in `/src/stores/`, `/src/hooks/`

### 3. Zustand for Global UI State

```mermaid
graph TD
    subgraph "Global State (Zustand)"
        SS[useSnackbarStore]
        DS[useDialogStore]
    end

    subgraph "Any Component"
        C1[ActionBar]
        C2[usePublishing]
        C3[HuntLayoutContent]
    end

    SS -.-> C1
    SS -.-> C2
    DS -.-> C2
    SS -.-> C3
```

**Why Zustand vs Context:**
- No provider wrapping needed
- Works outside React (in callbacks)
- Selectors prevent unnecessary re-renders
- Perfect for truly global, UI-only state

### 4. Component Composition (VersionPanel)

```mermaid
graph TD
    VP[VersionPanel] --> VI[VersionItem]
    VP --> EVS[EmptyVersionState]

    VI -->|"Handles"| Release[Release button]
    VI -->|"Handles"| TakeOffline[Take offline]
    VI -->|"Shows"| Status[Live/Published badge]
```

**Before:** One 200-line component with complex conditionals
**After:** Small, focused components with single responsibility

---

## Data Flow

### Publishing Flow

```mermaid
sequenceDiagram
    participant User
    participant ActionBar
    participant usePublishing
    participant DialogStore
    participant API
    participant SnackbarStore

    User->>ActionBar: Click "Publish"
    ActionBar->>usePublishing: handlePublish()
    usePublishing->>DialogStore: confirm({...})
    DialogStore->>User: Show confirmation dialog
    User->>DialogStore: Confirm
    DialogStore->>usePublishing: onConfirm callback
    usePublishing->>API: publishMutation.mutateAsync()
    API-->>usePublishing: PublishResult
    usePublishing->>SnackbarStore: success("Published!")
    SnackbarStore->>User: Show toast
```

### Step Management Flow

```mermaid
sequenceDiagram
    participant User
    participant Timeline
    participant HuntStepsContext
    participant useFieldArray
    participant Form

    User->>Timeline: Click "Add Step"
    Timeline->>HuntStepsContext: handleCreateStep(type)
    HuntStepsContext->>useFieldArray: append(newStep)
    useFieldArray->>Form: Updates form state
    HuntStepsContext->>HuntStepsContext: setSelectedFormKey(newKey)
    Form-->>Timeline: Re-render with new step
```

---

## File Changes Grouped by Purpose

### New: Publishing API Hooks
| File | Purpose |
|------|---------|
| `api/Hunt/publishHunt.ts` | `usePublishHunt()` - React Query mutation |
| `api/Hunt/releaseHunt.ts` | `useReleaseHunt()` - React Query mutation |
| `api/Hunt/takeOfflineHunt.ts` | `useTakeOfflineHunt()` - React Query mutation |

### New: Contexts
| File | Purpose |
|------|---------|
| `context/PublishingContext.tsx` | Provides publishing state/actions to descendants |
| `context/HuntStepsContext.tsx` | Provides step management state/actions |

### New: Hooks
| File | Purpose |
|------|---------|
| `hooks/usePublishing.ts` | All publishing logic: handlers, mutations, dialogs |

### New: Snackbar System
| File | Purpose |
|------|---------|
| `stores/useSnackbarStore.ts` | Zustand store: `success()`, `error()`, `warning()` |
| `components/Snackbar/Snackbar.tsx` | MUI Snackbar + Alert component |

### New: VersionPanel Components
| File | Purpose |
|------|---------|
| `VersionPanel/VersionPanel.tsx` | Container with menu anchor logic |
| `VersionPanel/VersionItem.tsx` | Single version row (release, take offline actions) |
| `VersionPanel/EmptyVersionState.tsx` | "No versions yet" message |

### Modified: Simplified Components
| File | Before | After |
|------|--------|-------|
| `HuntLayout.tsx` | All logic here | Just providers wrapping |
| `HuntHeader.tsx` | 15+ props | 3 props |
| `HuntStepTimeline.tsx` | 5 props | 0 props (uses context) |
| `ActionBar.tsx` | Props for handlers | Uses `usePublishingContext()` |
| `StepCard.tsx` | Props for delete | Uses `useHuntStepsContext()` |

### Deleted: Old Patterns
| File | Why Removed |
|------|-------------|
| `context/StepFormContext.tsx` | Replaced by HuntStepsContext |
| `hooks/useHuntSteps.ts` | Logic moved into HuntStepsContext |

### Fixed: OpenAPI Schema
| File | Change |
|------|--------|
| `openapi/hunthub_models.yaml` | Added `nullable: true` to server-side fields |

Server fields (`releasedBy`, `releasedAt`, `publishedBy`, `publishedAt`) can be `null`. The fix was at the schema source, not hardcoded in form validation.

---

## Key Decisions

### Why Context instead of Zustand for Publishing?

| Zustand | Context |
|---------|---------|
| Global singleton | Scoped to provider |
| No React integration | Uses React Query mutations |
| Good for UI state | Good for feature state |

Publishing is scoped to a specific hunt instance and uses React Query. Context is the right choice.

### Why Zustand for Snackbar?

| Context | Zustand |
|---------|---------|
| Needs provider at root | No provider needed |
| Access only in components | Access anywhere (callbacks) |
| Re-renders all consumers | Selectors prevent re-renders |

Snackbar is truly global UI state with no server interaction. Zustand is simpler.

### Performance: Is Context OK?

Yes, because:
1. **Same subtree** - consumers would re-render with props anyway
2. **Infrequent changes** - only during user actions, not every keystroke
3. **No expensive computations** - just UI components

---

## Mental Model

```
┌─────────────────────────────────────────────────────────────┐
│ HuntLayout                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ FormProvider (React Hook Form)                          │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ PublishingProvider                                  │ │ │
│ │ │  - hunt object                                      │ │ │
│ │ │  - publish/release/takeOffline handlers             │ │ │
│ │ │  - loading states                                   │ │ │
│ │ │ ┌─────────────────────────────────────────────────┐ │ │ │
│ │ │ │ HuntStepsProvider                               │ │ │ │
│ │ │ │  - steps array (from useFieldArray)             │ │ │ │
│ │ │ │  - selectedFormKey                              │ │ │ │
│ │ │ │  - create/delete/move handlers                  │ │ │ │
│ │ │ │                                                 │ │ │ │
│ │ │ │   ┌───────────────────────────────────────┐    │ │ │ │
│ │ │ │   │ HuntLayoutContent                     │    │ │ │ │
│ │ │ │   │   - HuntHeader (uses publishing ctx)  │    │ │ │ │
│ │ │ │   │   - HuntStepTimeline (uses steps ctx) │    │ │ │ │
│ │ │ │   │   - HuntForm                          │    │ │ │ │
│ │ │ │   └───────────────────────────────────────┘    │ │ │ │
│ │ │ └─────────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Global (Zustand - no providers):
  - useSnackbarStore → success/error/warning toasts
  - useDialogStore → confirmation dialogs
```

---

## How to Trace Code Now

**"Where does publishing logic live?"**
→ `hooks/usePublishing.ts`

**"How do components get publishing state?"**
→ `usePublishingContext()` from `context/PublishingContext.tsx`

**"Where is step selection managed?"**
→ `context/HuntStepsContext.tsx` (has `selectedFormKey` state)

**"How do toasts work?"**
→ `useSnackbarStore().success("message")` from anywhere

**"Where are providers wired up?"**
→ `HuntLayout.tsx` - the entry point
