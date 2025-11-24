# Hunt Transformers

Data transformation layer between API and React Hook Form.

## File Structure

```
/utils/transformers/
├── huntInput.ts        # API → Form (loading data)
├── huntOutput.ts       # Form → API (saving data)
└── editorTransformers.ts  # Legacy (deprecated)
```

---

## huntInput.ts (API → Form)

**Direction:** Backend response → RHF form

**Function:** `transformHuntToFormData(hunt: Hunt): HuntFormData`

**What it does:**
- Takes `Hunt` from API response
- Adds `_id` to each step for RHF useFieldArray tracking
- Returns `HuntFormData` ready for form initialization

**Usage:**
```typescript
const formMethods = useForm<{ hunt: HuntFormData }>({
  values: { hunt: transformHuntToFormData(apiHunt) }
});
```

---

## huntOutput.ts (Form → API)

**Direction:** RHF form → Backend request

**Function:** `prepareHuntForSave(huntFormData: HuntFormData): Hunt`

**What it does:**
- Takes `HuntFormData` from RHF form submission
- Strips `_id` from each step (UI-only field)
- Removes readonly/computed fields (`createdAt`, `isLive`, etc.)
- Returns clean `Hunt` ready for API request

**Usage:**
```typescript
const onSubmit = async (data: { hunt: HuntFormData }) => {
  const huntData = prepareHuntForSave(data.hunt);
  await saveHuntMutation.mutateAsync(huntData);
};
```

---

## Data Flow

```
Load Hunt
  ↓
API Response (Hunt)
  ↓
huntInput.ts → transformHuntToFormData()
  ↓
HuntFormData (Hunt + steps with _id)
  ↓
RHF form initialized
  ↓
User edits...
  ↓
Form submits
  ↓
huntOutput.ts → prepareHuntForSave()
  ↓
Hunt (clean, ready for API)
  ↓
API Request
```

---

## Key Types

```typescript
// What RHF stores
type HuntFormData = Omit<Hunt, 'steps'> & {
  steps: StepFormData[];  // Steps with _id added
};

// Step with RHF tracking
type StepFormData = Omit<Step, 'stepId'> & {
  stepId?: number;  // Optional - backend assigns
  huntId: number;   // Required - we populate in FE
} & WithRHFInternalId<{}>;

// Generic for RHF tracking
type WithRHFInternalId<T> = T & {
  _id: string;  // RHF useFieldArray tracking (UI-only)
};
```

---

## Why This Structure?

**Problem:** It's not obvious which direction data flows.

**Solution:** File names indicate direction:
- `huntInput.ts` = data coming IN from API
- `huntOutput.ts` = data going OUT to API

**Benefits:**
- ✅ Direction is obvious from filename
- ✅ Easy to find the right transformer
- ✅ Clear separation of concerns
- ✅ Self-documenting code

---

**Pattern:** Inspired by Efekta's activity transformers
**Last updated:** 2025-01-15