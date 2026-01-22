# Frontend Standards

Applies to Editor & Player apps. Also follow `common-standards.md`.

---

## MUI + Styled-Components

**Don't mix styling approaches on the same element.**

### Decision Order

1. Can I use component props? → Use props
2. Only need spacing? → Use sx
3. Need custom styles? → ONLY THEN use styled()

### What Goes Where

| Situation | Approach |
|-----------|----------|
| Layout props only | `<Stack direction="row" gap={2}>` |
| Props + spacing | `<Stack direction="row" sx={{ mt: 2 }}>` |
| Custom styles | `styled()` with ALL styles inside |

### Rules

- **Props** → layout (direction, alignItems, justifyContent, gap)
- **sx** → spacing only: `m`, `mt`, `mb`, `p`, `pt`, `pb`, `px`, `py`, `mx`, `my`, `gap`
- **styled()** → custom styles (margin-top: auto, flex: 1, colors, transforms)

**INTEGERS ONLY for spacing.** Never `gap={1.5}`.

**If only spacing needed → NO styles file. Just use sx.**

### Never Mix styled() + sx

```tsx
// BAD
const Footer = styled(Stack)`margin-top: auto;`;
<Footer sx={{ pt: 2 }}>{footer}</Footer>

// GOOD - all in styled
const Footer = styled(Stack)`
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;
```

---

## Stack vs Box

**Use Stack for layout. Box is rarely needed.**

```tsx
// GOOD
<Stack direction="row" justifyContent="space-between" alignItems="center">

// BAD
<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
```

**Box only for:** semantic wrappers (`component="form"`), non-flex containers.

---

## MUI v6 Slots API

**Use `slotProps`, not deprecated `*Props`:**

```tsx
// BAD
<Dialog TransitionProps={{ onExited: fn }} PaperProps={{ elevation: 0 }} />

// GOOD
<Dialog slotProps={{ transition: { onExited: fn }, paper: { elevation: 0 } }} />
```

---

## Styled Components

### Import Pattern

```tsx
import * as S from './Component.styles';

<S.Container>
  <S.Title>Hello</S.Title>
</S.Container>
```

### File Structure

```
components/
└── ToggleButton/
    ├── index.ts              # barrel export
    ├── ToggleButton.tsx      # component + types
    └── ToggleButton.styles.ts
```

### Theme Usage

```tsx
// GOOD
background: ${({ theme }) => theme.palette.primary.main};

// BAD - never hardcode
background: #B6591B;
```

---

## Forms (React Hook Form)

### Sync External Data - NO useEffect

```tsx
// GOOD - values prop auto-syncs
const methods = useForm<FormData>({
  resolver: zodResolver(schema),
  values: hunt ? { name: hunt.name } : undefined,
  defaultValues: { name: '' },
});

// BAD
useEffect(() => {
  if (hunt) reset({ name: hunt.name });
}, [hunt, reset]);
```

### Transformers Pattern

- **Input transformer** - prepare full data shape on load
- **Output transformer** - strip what API doesn't need
- **Single source of truth** - one field controls state, derive in render

---

## React Query

### Conditional Queries: `queryFnOrSkip`

```tsx
import { queryFnOrSkip } from '@/utils/queryFnOrSkip';

export const useGetHunt = (huntId: number | undefined) => {
  return useQuery({
    queryKey: huntKeys.detail(huntId ?? 0),
    queryFn: queryFnOrSkip(fetchHunt, huntId),
  });
};
```

Use `enabled: false` only when you need manual `refetch()`.

### Mutation Hooks: Return Semantic Names

```tsx
// GOOD - hook returns semantic names
export const useInvitePlayer = () => {
  const { mutate, isPending, ...rest } = useMutation({ ... });
  return { invitePlayer: mutate, isInviting: isPending, ...rest };
};

// Consumer uses directly
const { invitePlayer, isInviting } = useInvitePlayer();
```

### Seed Detail from List Cache

Use `initialData` when list item matches detail structure.

---

## useEffect Avoidance

**useEffect is almost never the right answer.**

| Need | Instead of useEffect |
|------|---------------------|
| Data fetching | React Query |
| Derived state | Compute in render |
| Sync with props | `values` prop, derived state |
| Respond to event | Handle in event handler |
| Respond to mutation | `onSuccess` callback |

```tsx
// BAD - useEffect for derived state
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// GOOD - compute in render
const fullName = `${firstName} ${lastName}`;
```

```tsx
// BAD - useEffect to respond to data change
useEffect(() => {
  if (data) {
    doSomething(data);
  }
}, [data]);

// GOOD - handle in the mutation/query callback
const { mutate } = useMutation({
  onSuccess: (data) => doSomething(data),
});
```

**When useEffect IS needed:**
- Subscriptions to external systems (websockets, browser APIs)
- Manual DOM manipulation (rare with React)
- Cleanup on unmount

**If you're reaching for useEffect, stop and ask: "Can I handle this at the cause instead?"**

---

## React Patterns

### Red Flags

- useEffect for anything that can be derived or handled at the cause
- Boolean soup for state → use enum/status
- Deriving state when source of truth exists elsewhere
- Premature memoization (useMemo, useCallback, memo)

### Predictable Render

```tsx
// GOOD - simple
const Component = ({ items }) => (
  <S.List>
    {items.map(item => <S.Item key={item.id}>{item.name}</S.Item>)}
  </S.List>
);

// BAD - over-engineered
const Component = memo(({ items }) => {
  const memoizedItems = useMemo(() => items.map(...), [items]);
  const handleClick = useCallback(() => {}, []);
});
```

### Small Components

**Extract when:** own state/handlers, visually distinct, parent > 50 lines JSX.

**Don't over-extract:** section component is the leaf.

---

## State-Based Rendering

### 2 States → Ternary

```tsx
{hasPhoto ? <PhotoPreview /> : <CapturePrompt />}
```

### 3+ States → Enum Lookup

```tsx
type Status = 'idle' | 'loading' | 'error' | 'success';

const views: Record<Status, React.ReactNode> = {
  idle: <IdleView />,
  loading: <LoadingView />,
  error: <ErrorView />,
  success: <SuccessView />,
};

return <>{views[status]}</>;
```

**Enumerate, don't booleanate.**

---

## Phosphor Icons

**Use `Icon` suffix:**

```tsx
// GOOD
import { MapTrifoldIcon, CameraIcon } from '@phosphor-icons/react';

// BAD
import { MapTrifold, Camera } from '@phosphor-icons/react';
```

**Weights:** thin/light (secondary), regular (default), bold (primary), fill (active), duotone (highlights)

---

## Null vs Undefined

- **API/Backend** → uses `null`
- **Frontend internal** → uses `undefined`
- **Boundary (transformers)** → normalize `null` → `undefined`

```tsx
// Extractor normalizes
getTitle: (media) => media?.title ?? undefined

// Utility accepts both
const prettyBytes = (bytes?: number | null): string => {
  if (bytes == null) return '';  // catches both
};
```

| Location | Pattern |
|----------|---------|
| Extractors | Return `T \| undefined` |
| Utilities | Accept `T \| null \| undefined` |
| Interfaces | Use `T \| undefined` (no null) |
