# Frontend Standards

Enforceable patterns for HuntHub frontend (Editor & Player apps).

**IMPORTANT: Also follow all rules in `common.md` (arrow functions, self-explanatory code, SOLID).**
**IMPORTANT: Do not miss any requirements in this file!.**

---

## MUI + Styled-Components Pattern

**Don't mix styling approaches on the same element.**

### Decision Order (ALWAYS follow)

1. Can I use component props? → Use props
2. Only need spacing? → Use sx with abbreviations
3. Need custom styles that props/sx can't handle? → ONLY THEN use styled()

### What Goes Where

| Situation | Approach |
|-----------|----------|
| Only need layout props | `<Stack direction="row" gap={2}>` |
| Props + simple spacing | `<Stack direction="row" sx={{ mt: 2 }}>` |
| Need custom styles (margin-top: auto, flex: 1, etc.) | `styled()` with ALL styles inside |

### Rules

- **Props** → layout behavior (direction, alignItems, justifyContent, gap)
- **sx** → spacing abbreviations only with numeric values (m, mt, mb, p, pt, pb, px, py, mx, my, gap)
- **styled()** → ONLY for custom styles that can't be expressed with props or sx

**IMPORTANT:** If a component only needs spacing (padding, margin), do NOT create a styles file. Just use sx.

### Never Mix styled() + sx

```tsx
// BAD - styles in two places
const Footer = styled(Stack)`
  margin-top: auto;
`;
<Footer sx={{ pt: 2 }}>{footer}</Footer>

// GOOD - all styles in styled component
const Footer = styled(Stack)`
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;
<Footer>{footer}</Footer>
```

### When Using styled()

- Use `styled(Box)` for neutral containers
- Use `styled(Stack)` only if you need Stack's flex defaults
- Use `styled(Paper)` when you need Paper's elevation/styling
- Put ALL styles in the styled component, not split between styled and sx

---

## NO Inline CSS in Components

### Only Allowed sx Props

`p`, `m`, `pt`, `pb`, `mt`, `mb`, `px`, `py`, `mx`, `my`, `gap`

### INTEGERS ONLY for Spacing

MUI theme.spacing is array-based. Never use decimals.

```tsx
// GOOD
<Stack gap={2}>

// BAD - decimals break with array-based spacing
<Stack gap={1.5}>
```

### Never Do This

```tsx
// BAD - any other style property inline
<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
<Box sx={{ backgroundColor: 'primary.main' }}>
<Box sx={{ textAlign: 'left' }}>
```

For anything beyond trivial spacing → create a styled component or use Stack props.

---

## Stack vs Box

**USE STACK, NOT BOX** for layout:

```tsx
// GOOD - Stack handles flex layout
<Stack direction="row" justifyContent="space-between" alignItems="center">

// BAD - Box with flex styles
<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
```

**Box is only for:**
- Wrapping a single element with spacing
- `component="form"` or `component="section"` semantic wrappers
- When you genuinely need a non-flex container

**Never write inline styled flex:**
```tsx
// BAD
export const Header = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing(2)};
`;

// GOOD - just use Stack
<Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
```

---

## MUI v6 Slots API

**Use `slotProps`, not deprecated `*Props`:**

```tsx
// DEPRECATED
<Dialog TransitionProps={{ onExited: fn }} PaperProps={{ elevation: 0 }} />

// CORRECT
<Dialog slotProps={{ transition: { onExited: fn }, paper: { elevation: 0 } }} />
```

---

## Styled Components Pattern

### Import Pattern

```tsx
import * as S from './Component.styles';

<S.Container>
  <S.Title>Hello</S.Title>
</S.Container>
```

### Using MUI Class Selectors (Type-Safe)

```tsx
import { toggleButtonClasses } from '@mui/material/ToggleButton';

export const ToggleButton = styled(MuiToggleButton)<{ $color?: string }>(
  ({ $color, theme }) => ({
    color: $color || theme.palette.text.secondary,
    [`&.${toggleButtonClasses.selected}`]: {
      color: $color || theme.palette.text.secondary,
    },
  })
);
```

---

## File Structure

**Component with styles → folder with barrel export:**
```
components/
└── ToggleButton/
    ├── index.ts              # barrel export
    ├── ToggleButton.tsx      # component + types
    └── ToggleButton.styles.ts
```

**Main page component → styles file alongside:**
```
pages/
└── Hunt/
    ├── HuntLayout.tsx
    └── HuntLayout.styles.ts
```

**Component props/types → same file as component (.tsx)**

---

## Theme Usage

**Always use theme system:**

```tsx
// GOOD - use theme values
background: ${({ theme }) => theme.palette.primary.main};
border-radius: ${({ theme }) => theme.shape.md}px;

// BAD - never hardcode
background: #B6591B;
```

---

## Form Data & Transformers Pattern

**Form holds "wider" data than UI needs.** Transformers prepare complete data structures once on load.

### Rules

- **Input transformer**: ALWAYS prepare full data shape (e.g., options[] exists even for Input type)
- **Output transformer**: Strip what API doesn't need
- **No useEffect for data initialization** - handle at the cause (factory, transformer, or explicit handler)
- **Single source of truth** - one field controls state (e.g., `targetId`), derived values computed in render

### Syncing External Data (NO useEffect)

Use the `values` prop to sync form with external data:

```tsx
// GOOD - values prop auto-syncs
const methods = useForm<FormData>({
  resolver: zodResolver(schema),
  values: hunt ? { name: hunt.name, description: hunt.description ?? '' } : undefined,
  defaultValues: { name: '', description: '' },
});

// BAD - useEffect is unnecessary
useEffect(() => {
  if (hunt) {
    reset({ name: hunt.name, description: hunt.description ?? '' });
  }
}, [hunt, reset]);
```

---

## React Query Patterns

### Seeding Detail from List Cache

Use `initialData` to seed detail queries from list cache:

```tsx
export const useGetHunt = (huntId?: number | null) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: huntKeys.detail(huntId!),
    queryFn: () => fetchHunt(huntId!),
    enabled: !!huntId,
    initialData: () => {
      if (!huntId) return undefined;
      const queries = queryClient.getQueriesData<PaginatedHuntsResponse>({
        queryKey: huntKeys.lists(),
      });
      for (const [, data] of queries) {
        const hunt = data?.data?.find((h) => h.huntId === huntId);
        if (hunt) return hunt;
      }
      return undefined;
    },
    initialDataUpdatedAt: () => {
      return queryClient.getQueryState(huntKeys.lists())?.dataUpdatedAt;
    },
  });
};
```

**When to use:**
- `initialData` - list item structure matches detail structure
- `placeholderData` - structures differ

### Disabling Queries: `queryFnOrSkip` Helper

**Always use `queryFnOrSkip`** for conditional queries - it handles skipToken with proper validation:

```tsx
import { useQuery } from '@tanstack/react-query';
import { queryFnOrSkip } from '@/utils/queryFnOrSkip';

export const useGetVersionHistory = (huntId: number | undefined) => {
  return useQuery<VersionHistoryResponse>({
    queryKey: huntKeys.versions(huntId ?? 0),
    queryFn: queryFnOrSkip(fetchVersionHistory, huntId),
  });
};
```

**Why use it:**
- Type-safe (no `!` assertions needed in queryFn)
- Validates numbers with `Number.isFinite()` (catches NaN, Infinity)
- Validates other types with `!= null` (catches null, undefined)
- Cleaner than manual ternary with skipToken

**Use `enabled: false`** only when you need manual `refetch()`:

```tsx
export const useGetHunt = (huntId?: number | null) => {
  return useQuery({
    queryKey: huntKeys.detail(huntId!),
    queryFn: () => fetchHunt(huntId!),
    enabled: !!huntId,  // allows refetch() to work
  });
};
```

| Pattern | Type-safe | `refetch()` works | Use when |
|---------|-----------|-------------------|----------|
| `queryFnOrSkip` | ✅ Yes | ❌ No | Default choice, conditional fetching |
| `enabled: false` | ❌ No (needs `!`) | ✅ Yes | Need manual trigger capability |

---

## React Patterns

### Red Flags (Frontend-Specific)

- useEffect with multiple dependencies (prefer imperative handlers at the cause)
- Inline returns in functions (always use explicit return with braces)
- Boolean soup for state (use enum/status instead)
- Deriving state client-side when source of truth exists elsewhere

### Predictable Render Flow

- No crazy optimization patterns that break reconciliation
- Use React by the book - consistent and predictable
- Avoid premature memoization unless there's a real perf issue

```tsx
// GOOD - simple, predictable
const Component = ({ items }) => (
  <S.List>
    {items.map(item => <S.Item key={item.id}>{item.name}</S.Item>)}
  </S.List>
);

// BAD - over-engineered
const Component = memo(({ items }) => {
  const memoizedItems = useMemo(() => items.map(...), [items]);
  const handleClick = useCallback(() => {}, []);
  // ...
});
```

### Small Components

**Container components** (pages, modals, popovers, panels) should compose smaller section components.

**Extract a section when:**
- It has its own state or handlers
- It's visually distinct (separated by Divider, Card, etc.)
- The parent component exceeds ~50 lines of JSX

**Don't over-extract:**
- A focused section component is the leaf - don't break it into section-sections
- Simple conditional rendering (ternary) doesn't need extraction
- If extraction adds prop-drilling complexity, reconsider

```tsx
// BAD - monolithic container with JSX soup
const SharePanel = () => (
  <Popover>
    <Stack p={2} gap={1}>
      <Typography>Share Hunt</Typography>
      <TextField ... />  {/* 15 lines of slotProps */}
    </Stack>
    <Divider />
    <Stack p={2} gap={1}>
      <Typography>Who can play</Typography>
      <ToggleButtonGroup ... />  {/* more inline JSX */}
    </Stack>
  </Popover>
);

// GOOD - container composes focused sections
const SharePanel = () => (
  <Popover>
    <LinkSection playUrl={playUrl} />
    <Divider />
    <AccessModeSection accessMode={accessMode} onChange={handleChange} />
  </Popover>
);

// LinkSection is a leaf - simple, focused, no further extraction needed
const LinkSection = ({ playUrl }: LinkSectionProps) => {
  const [copied, setCopied] = useState(false);
  // ... handlers
  return (
    <Stack p={2} gap={1}>
      <Typography>Share Hunt</Typography>
      {/* focused JSX */}
    </Stack>
  );
};
```

---

## State-Based Rendering Patterns

### Binary (2 States) → Ternary

```tsx
{hasPhoto ? <PhotoPreview src={preview} /> : <CapturePrompt />}
```

### Multiple States (3-5) → Enum Lookup

```tsx
type Status = 'idle' | 'loading' | 'error' | 'success';

const views: Record<Status, React.ReactNode> = {
  idle: <IdleView />,
  loading: <LoadingView />,
  error: <ErrorView />,
  success: <SuccessView />,
};

return <Container>{views[status]}</Container>;
```

### Booleans from Hook → Derive Status First

```tsx
const getStatus = (isLoading: boolean, error: string | null, hasData: boolean): Status => {
  if (error) return 'error';
  if (hasData) return 'ready';
  if (isLoading) return 'loading';
  return 'idle';
};

const status = getStatus(isLoading, error, !!data);
return <Container>{views[status]}</Container>;
```

### Key Principles

1. **Enumerate, Don't Booleanate** - Use status enum, not multiple booleans
2. **Derived Booleans Are OK** - `const isLoading = status === 'loading';`
3. **One Status, One UI** - Each status maps to exactly one UI configuration
4. **Compose, Don't Duplicate** - Extract shared UI pieces into components

---

## Phosphor Icons

**All Phosphor icons use the `Icon` suffix:**

```tsx
// CORRECT
import { MapTrifoldIcon, CameraIcon, TrophyIcon } from '@phosphor-icons/react';

// WRONG
import { MapTrifold, Camera, Trophy } from '@phosphor-icons/react';
```

**Weights for visual hierarchy:**
- **thin/light** - Secondary actions, subtle indicators
- **regular** - Default UI elements
- **bold** - Primary actions, emphasis
- **fill** - Active/selected states
- **duotone** - Feature highlights, step type indicators

---

## Semantic JSX (No className Spam)

```tsx
// GOOD - MUI components + Phosphor icons
<StyledCard>
  <Typography variant="h5">
    <MapTrifoldIcon size={24} weight="duotone" />
    Hunt Name
  </Typography>
  <GradientButton>Edit</GradientButton>
</StyledCard>

// BAD - className soup
<div className="card rounded-lg shadow-md p-4">
  <h2 className="text-xl font-bold">Hunt Name</h2>
</div>
```

---

## Single Source of Truth for State

**Get state from its source of truth. Don't derive it client-side if the source already tracks it.**

```tsx
// BAD - deriving attempt count by parsing feedback strings
const useAttemptTracking = (feedback) => {
  // Fragile! Parses feedback to count attempts
};

// GOOD - context/backend tracks attemptCount
const { attemptCount } = useValidation();
```
