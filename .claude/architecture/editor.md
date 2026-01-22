# Editor App Architecture

Hunt creation and management app. This document covers forms, state management, and unique patterns.

---

## Overview

```
User opens /editor/:huntId
        ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         Provider Stack                               │
│                                                                      │
│   React Query (server state)                                        │
│       ↓                                                              │
│   FormProvider (form state - React Hook Form)                       │
│       ↓                                                              │
│   HuntStepsProvider (step array management)                         │
│       ↓                                                              │
│   HuntLayout → StepEditor                                           │
└─────────────────────────────────────────────────────────────────────┘
```

**State layers:**
| Layer | Tool | Purpose |
|-------|------|---------|
| Server state | React Query | API data, caching, mutations |
| Form state | React Hook Form | Hunt + steps editing |
| UI state | Zustand | Dialogs, snackbars, preferences |

---

## Form Architecture

### Nested Form Structure

Single `FormProvider` at layout level wraps entire hunt + all steps:

```typescript
EditorFormData {
  hunt: HuntFormData {
    name, description, ...
    steps: StepFormData[]
  }
}
```

**Why single FormProvider:**
- Unified validation across hunt + all steps
- Single submit button saves everything
- `useFieldArray` manages steps array
- Type-safe field paths with autocomplete

### Data Flow

```
API Data (Hunt)
    ↓
Input Transformer (huntInput.ts)
    ↓
Form Data (HuntFormData)
    ↓
FormProvider manages state
    ↓
Output Transformer (huntOutput.ts)
    ↓
API Data (Hunt) → save
```

---

## React Hook Form Patterns

### Bridge Components

Wrap MUI components with RHF integration:

| Component | RHF Method | Use Case |
|-----------|------------|----------|
| FormInput | `register()` | Text fields |
| FormTextArea | `register()` | Multi-line text |
| FormNumberInput | `register()` + `setValueAs` | Numbers |
| FormSelect | `useController()` | Dropdowns |
| FormToggleButtonGroup | `useController()` | Option groups |
| FormCheckbox | `register()` | Checkboxes |
| FormLocationPicker | `useController()` | Complex multi-field |
| FormMediaInput | `useWatch()` + `setValue()` | Drawer-based editor |

**Pattern:**
- Simple fields (text, number) → `register()` directly
- Complex fields (select, toggle) → `useController()` for full control
- All use `useFieldError()` for error display

### useFieldError Hook

Gets field error from form context:

```typescript
const error = useFieldError('hunt.steps.0.challenge.quiz.title');
// Returns error message string or undefined
```

Handles both direct field errors and array root errors from `superRefine`.

### getFieldPath() - Type-Safe Paths

**Problem:** TypeScript loses inference with dynamic array indices.

```typescript
// BAD - loses type info, no autocomplete
const path = `hunt.steps.${stepIndex}.challenge.clue.title`;

// GOOD - full autocomplete and type checking
const path = getFieldPath((h) => h.hunt.steps[stepIndex].challenge.clue.title);
```

**How it works:** Uses JavaScript Proxy to intercept property access and build path string.

**Usage in step components:**
```typescript
const getClueFieldNames = (stepIndex: number) => ({
  title: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.clue.title),
  description: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.clue.description),
});

const fields = getClueFieldNames(stepIndex);
<FormInput name={fields.title} label="Title" />
```

### useArrayInput Hook

Wrapper around `useFieldArray()`:

```typescript
const { fields, arrayActions, append } = useArrayInput<QuizOptionFormData>(optionsPath);

// fields: FieldArrayItem<T>[] with stable _id
// arrayActions: { swap, remove, move }
```

**Custom key:** Uses `_id` (Mongo-style) instead of `id`.

---

## Form Data Transformers

### Input Transformer (API → Form)

**File:** `utils/transformers/huntInput.ts`

Converts API data to form data, enabling disabled state representation:

```typescript
// API: Location | null
// Form: LocationFormData (all fields nullable for disabled state)
const transformLocationToFormData = (location?: Location | null): LocationFormData => {
  if (!location) {
    return { lat: null, lng: null, radius: null, address: null };
  }
  return { lat: location.lat, lng: location.lng, ... };
};

// Adds formKey for reconciliation
export const transformHuntToFormData = (hunt: Hunt): HuntFormData => {
  const steps = hunt.steps.map((step) => ({
    ...step,
    formKey: step.stepId?.toString() ?? crypto.randomUUID(),
  }));
  return { ...hunt, steps };
};
```

### Output Transformer (Form → API)

**File:** `utils/transformers/huntOutput.ts`

Strips form-specific data, converts null settings to undefined:

```typescript
export const prepareHuntForSave = (huntFormData: HuntFormData): Hunt => {
  // Strip server-managed fields (createdAt, updatedAt, isLive, etc.)
  // Strip formKey from steps
  // Convert null settings to undefined (not sent to API)
  return cleanedHunt;
};
```

### Null vs Undefined Strategy

| Context | Value | Meaning |
|---------|-------|---------|
| Form field | `null` | Setting disabled/empty |
| Form field | `undefined` | Never (use null) |
| API output | `undefined` | Not sent in payload |
| API output | `null` | Explicit absent value |

---

## Validation Patterns

### Schema Structure

```
@hunthub/shared/schemas (API contracts)
        ↓ (imported and extended)
validation/schemas/* (form-specific rules)
        ↓ (composed into)
HuntFormSchema (root schema)
```

### Conditional Validation with superRefine

Quiz validation adapts based on type:

```typescript
export const QuizFormSchema = z.object({
  type: z.enum(['choice', 'input']),
  options: z.array(Option).nullish(),
  targetId: z.string().nullish(),
  expectedAnswer: z.string().nullish(),
}).superRefine((data, ctx) => {
  if (data.type === 'choice') {
    // Validate options array exists and has 2+ items
    // Validate each option has text
    // Validate targetId exists and is in options
  }
  if (data.type === 'input') {
    // Validate expectedAnswer exists
  }
});
```

### Form Submission Flow

```typescript
const onSubmit = async (data: { hunt: HuntFormData }) => {
  const savedHunt = await saveHuntMutation.mutateAsync(prepareHuntForSave(data.hunt));
  const newFormData = transformHuntToFormData(savedHunt);
  reset({ hunt: newFormData });  // Reset with server data (gets stepIds)
  snackbar.success('Changes saved');
};

const onInvalid = (errors: FieldErrors) => {
  // Auto-select first step with error
  const errorIndex = findFirstStepIndexWithError(errors);
  if (errorIndex >= 0) {
    setSelectedFormKey(steps[errorIndex]?.formKey);
  }
};
```

---

## RHF Caveats & Troubleshooting

### 1. useWatch requires explicit effect dependencies

```typescript
const validationMode = useWatch({ name: fields.validationMode });

// WRONG - effect won't re-run
useEffect(() => {
  if (!validationMode) setValue(fields.validationMode, 'exact');
}, []);

// CORRECT - include watched value
useEffect(() => {
  if (!validationMode) setValue(fields.validationMode, 'exact');
}, [validationMode, fields.validationMode, setValue]);
```

### 2. register() spread order matters

```typescript
// WRONG - props override register
<TextField {...props} {...register(name)} />

// CORRECT - register last
<TextField {...register(name)} {...props} />
```

### 3. Number fields need setValueAs

```typescript
const numberRegisterOptions = {
  setValueAs: (value: string | number): number | undefined => {
    if (value === '' || value == null) return undefined;
    const numValue = Number(value);
    return isNaN(numValue) ? undefined : numValue;
  },
};

<input {...register(name, numberRegisterOptions)} type="number" />
```

### 4. formKey reconciliation after save

- New steps have `formKey: UUID` (not saved yet)
- After save, server returns `stepId`
- `reset()` with new form data updates `formKey` to match `stepId`
- This enables stable React keys for reconciliation

**Selection preservation:** When saving with an unsaved step selected, the code tracks its position and re-selects by position after save (since formKey changes from UUID to stepId).

### 5. Syncing external data - use values prop

```typescript
// CORRECT - values prop auto-syncs
const methods = useForm<FormData>({
  resolver: zodResolver(schema),
  values: hunt ? { name: hunt.name } : undefined,
  defaultValues: { name: '' },
});

// WRONG - useEffect is unnecessary
useEffect(() => {
  if (hunt) reset({ name: hunt.name });
}, [hunt, reset]);
```

### 6. Array validation errors display

For `superRefine` errors on arrays, check the root path:

```typescript
const optionsError = useFieldError(optionsPath);  // Gets root array error
// Displays: "At least 2 options required"
```

---

## State Management

**See `frontend-standards.md` for React Query and Zustand patterns.**

Editor-specific state:
- **React Query** - Hierarchical keys (`huntKeys`), `initialData` seeding from list cache
- **Zustand** - `useDialogStore` (confirmations), `useSnackbarStore` (notifications)
- **HuntStepsContext** - Form array management (below)

### HuntStepsContext (Form Array State)

Manages step collection within FormProvider:

```typescript
const {
  steps,              // Current steps array
  selectedFormKey,    // Currently selected step
  handleCreateStep,   // (type) => void
  handleDeleteStep,   // (formKey) => void
  handleMoveStep,     // (from, to) => void
  setSelectedFormKey  // (formKey) => void
} = useHuntStepsContext();
```

**Features:**
- Uses `useFieldArray()` internally
- Prevents deleting last step
- Auto-selects adjacent step when deleting selected

---

## Complex Form Patterns

### Conditional Sections
Use `useWatch` to show/hide fields based on other field values:
```typescript
const quizType = useWatch({ name: fields.type });
{quizType === 'choice' ? <MultipleChoiceEditor /> : <FormInput name={fields.expectedAnswer} />}
```

### Drawer-Based Sub-Editor
For complex fields (media, location), use drawer pattern:
- `useWatch` to read current value
- `setValue(name, newValue, { shouldDirty: true })` to update
- Separate drawer component handles editing

See: `FormMediaInput`, `FormLocationPicker`

### Array with Drag-and-Drop
Multiple choice options combine `useFieldArray()` + `@dnd-kit`:
- `useArrayInput` wrapper for typed array management
- Custom hook handles business logic (mark target, remove with fallback)

See: `useMultipleChoiceOptions` in `pages/Hunt/HuntSteps/components/Quiz/`

---

## Key Files

| Need | Location |
|------|----------|
| Form bridge components | `components/form/components/` |
| RHF utilities | `components/form/utils.ts` (getFieldPath, nameToId) |
| Transformers | `utils/transformers/huntInput.ts`, `huntOutput.ts` |
| Validation schemas | `validation/schemas/` |
| Step type forms | `pages/Hunt/HuntSteps/` |
| Form context | `pages/Hunt/context/HuntStepsContext.tsx` |
| Editor types | `types/editor.ts` |

**See `codebase.md` for full navigation guide.**

---

## Key Design Decisions

### Single FormProvider for Hunt + Steps
All steps are in one form. Enables unified validation and single save button.

### Real-Time Preview
Uses `useWatch` to get live form data, then `prepareHuntForSave()` to transform for preview:

```typescript
const watchedFormData = useWatch({ control, name: 'hunt' });
const previewHunt = useMemo(() => prepareHuntForSave(watchedFormData), [watchedFormData]);
```

Preview component (iframe with player app) receives transformed data.

### Transformers at Boundaries
`huntInput.ts` and `huntOutput.ts` handle all API ↔ Form conversions. Components work with form types only.

### formKey for Reconciliation
Steps use `formKey` (UUID before save, stepId after). Enables stable React keys across saves.

### Bridge Component Pattern
MUI components wrapped with RHF integration. Consistent error display. Components don't know about form internals.

### Null = Disabled Setting
Form uses `null` for disabled settings. Transformer converts to `undefined` for API (not sent).

### getFieldPath for Type Safety
Proxy-based utility provides full TypeScript autocomplete for nested field paths.

### superRefine for Cross-Field Validation
Zod's `superRefine` enables validation that depends on other field values (e.g., quiz type determines which fields are required).

### Media Data Layer
Complex domain logic separated from components:

```
components/media/data/
├── helper.ts     # Validation (isMediaValid, hasContent)
├── parser.ts     # Extract data from Media objects
├── updater.ts    # Transform form → API (toMedia)
├── generator.ts  # Create default Media objects
└── types.ts      # MediaFormData types
```

Components stay clean; domain logic lives in data layer.
