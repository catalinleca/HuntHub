# React 19 Usage Guide for HuntHub

**Stack:** React Query, React Hook Form, Express/MongoDB  
**Features:** Auth, Hunt Sharing, Map Visualization

---

## ✅ ALWAYS USE - Automatic Improvements

### 1. ref as prop (use everywhere)

**Where:** Any component that needs refs (map components, form inputs, modals)

```jsx
// ❌ OLD (React 18) - delete all forwardRef
const MapMarker = forwardRef((props, ref) => {
  return <div ref={ref}>...</div>;
});

// ✅ NEW (React 19) - just do this
function MapMarker({ ref, ...props }) {
  return <div ref={ref}>...</div>;
}
```

**Your use cases:**
- Map marker components (Leaflet/Mapbox refs)
- Custom form inputs with RHF
- Modals/dropdowns with focus management
- Any compound component pattern

---

### 2. Document metadata (use for SEO pages)

**Where:** Hunt detail pages, landing page, public profiles

```jsx
// Remove react-helmet dependency
function HuntDetailPage({ hunt }) {
  return (
    <>
      <title>{hunt.name} - HuntHub</title>
      <meta name="description" content={hunt.description} />
      <meta property="og:title" content={hunt.name} />
      <meta property="og:description" content={hunt.description} />
      
      <div>
        {/* your hunt content */}
      </div>
    </>
  );
}
```

**Your use cases:**
- `/hunt/:id` - dynamic hunt titles
- Landing page - SEO meta tags
- Shared hunt links - OG tags for social media

---

## 🤔 CONSIDER USING - Where It Adds Value

### 3. useOptimistic (for specific interactions)

**Where:** Quick user interactions where React Query cache update feels slow

```jsx
// Example: Collecting a treasure item in a hunt
function TreasureItem({ item, huntId }) {
  const queryClient = useQueryClient();
  const currentItems = queryClient.getQueryData(['hunt', huntId, 'items']);
  
  const [optimisticItems, markCollected] = useOptimistic(
    currentItems,
    (state, itemId) => state.map(i => 
      i._id === itemId ? { ...i, collected: true } : i
    )
  );

  const collectMutation = useMutation({
    mutationFn: collectItem,
    onMutate: (itemId) => markCollected(itemId), // instant feedback
    onSuccess: () => queryClient.invalidateQueries(['hunt', huntId])
  });

  return (
    <button onClick={() => collectMutation.mutate(item._id)}>
      {optimisticItems.find(i => i._id === item._id).collected ? '✓' : 'Collect'}
    </button>
  );
}
```

**Your use cases:**
- ✅ Collecting treasure items (instant checkmark)
- ✅ Joining/leaving a hunt (immediate UI feedback)
- ✅ Liking/favoriting hunts
- ❌ DON'T use for: Complex forms, data fetching, anything React Query handles well

**When to skip:** If React Query's optimistic updates work fine, stick with that.

---

### 4. useActionState (maybe skip for now)

**Where:** Simple forms without validation

```jsx
// Only worth it for very simple forms
function QuickCommentForm({ huntId }) {
  const [state, submitAction, isPending] = useActionState(
    async (prevState, formData) => {
      const comment = formData.get('comment');
      return await postComment(huntId, comment);
    },
    null
  );

  return (
    <form action={submitAction}>
      <textarea name="comment" />
      <button disabled={isPending}>Post</button>
      {state?.error && <p>{state.error}</p>}
    </form>
  );
}
```

**Your use cases:**
- ✅ Quick comment/note forms
- ✅ Simple settings toggles
- ❌ DON'T use for: Anything with validation → use RHF instead

**Honest take:** RHF is better 90% of the time. Only use this for trivial forms.

---

## ❌ DON'T USE - Stick With Current Tools

### 5. use() hook - Skip it

**Why:** React Query is superior for data fetching

```jsx
// ❌ DON'T do this
const hunt = use(fetchHunt(id));

// ✅ DO this (React Query)
const { data: hunt } = useQuery({
  queryKey: ['hunt', id],
  queryFn: () => fetchHunt(id)
});
```

**React Query gives you:**
- Caching
- Background refetching
- Error handling
- Loading states
- Optimistic updates
- Infinite queries

`use()` gives you... a promise. Not worth it.

---

### 6. useOptimistic with React Query - Usually redundant

React Query's built-in optimistic updates are more powerful for most cases:

```jsx
// React Query's way is better for complex updates
const mutation = useMutation({
  mutationFn: updateHunt,
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['hunts']);
    const previous = queryClient.getQueryData(['hunts']);
    
    // Update cache optimistically
    queryClient.setQueryData(['hunts'], old => 
      old.map(h => h._id === newData._id ? newData : h)
    );
    
    return { previous };
  },
  onError: (err, vars, context) => {
    // Rollback on error
    queryClient.setQueryData(['hunts'], context.previous);
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['hunts']);
  }
});
```

**When to use React 19's useOptimistic instead:**
- UI-only updates that don't need to affect query cache
- Very simple toggle states
- Instant visual feedback before mutation

---

## 📋 Quick Decision Tree

```
Need refs? 
  → Use ref as prop (always)

Need SEO/meta tags?
  → Use document metadata (always)

Form with validation?
  → Use RHF (not useActionState)

Simple form without validation?
  → Consider useActionState (optional)

Fetching data?
  → Use React Query (not use() hook)

Need instant UI feedback on user action?
  → Consider useOptimistic (if React Query's optimistic updates aren't enough)

Everything else?
  → Write normal React 18 code, works perfectly
```

---

## 🎯 For HuntHub Specifically

### High value React 19 features:

1. **ref as prop** - clean up all your map component refs
2. **Document metadata** - SEO for hunt pages
3. **useOptimistic** - treasure collection interactions (experiment first)

### Skip these:

1. **useActionState** - RHF is better for your forms
2. **use() hook** - React Query is better for data fetching

### Your codebase ratio:

- **95%** normal React code (hooks, components, state management)
- **5%** React 19 specific features (refs, metadata, maybe useOptimistic)

---

## 🚀 Migration Strategy

### Phase 1: Initial upgrade (Day 1)
```bash
npm install react@19 react-dom@19
npm install -D @vitejs/plugin-react@latest
```

Everything still works. No code changes needed.

### Phase 2: Low-hanging fruit (Week 1)
1. Replace all `forwardRef` with ref as prop
2. Add document metadata to hunt pages
3. Remove react-helmet dependency

### Phase 3: Experiment (Week 2+)
1. Try `useOptimistic` for one treasure collection feature
2. Measure if it feels better than React Query's optimistic updates
3. Expand if beneficial, otherwise stick with React Query

### Phase 4: Ongoing
- Keep using RHF for all forms
- Keep using React Query for all data fetching
- Write normal React code for everything else

---

## 🔧 Vite Configuration

No changes needed! Your existing config works:

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()], // works with React 18 & 19
  server: {
    proxy: {
      '/api': 'http://localhost:3000' // your Express backend
    }
  }
})
```

Build command stays the same:
```bash
npm run build
```

---

## 📦 Bundle & Build

**No differences:**
- Same build output
- Same bundle size (actually slightly smaller)
- Same deployment process
- Same Express integration

React 19 is a drop-in replacement for bundling purposes.

---

## ⚠️ Things That DON'T Change

All these work identically in React 19:

```jsx
// Core hooks - unchanged
useEffect(() => {}, [])
useMemo(() => {}, [])
useCallback(() => {}, [])
useState()
useReducer()
useContext()

// Your libraries - unchanged
const { register, handleSubmit } = useForm()
const { data } = useQuery(...)
const mutation = useMutation(...)

// Patterns - unchanged
Context API
Error Boundaries
Suspense
Lazy loading
Code splitting
```

---

## 💡 Key Takeaway

**Use React 19, write React 18 code.**

Upgrade the version, get the automatic improvements (refs, performance), and only adopt new features where they genuinely add value. Don't force React 19 patterns where your existing tools (RHF, React Query) already excel.

Your HuntHub codebase will be 95% "normal React" - and that's exactly right.
