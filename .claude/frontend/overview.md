# Frontend Overview

**Status:** Not yet started

## Tech Stack

**Core:**
- React (library)
- TypeScript (type safety)
- Material-UI (component library)
- styled-components (styling - ⚠️ see note below)

**⚠️ Styling Decision Needed:**

Current plan: MUI + styled-components

**Potential issue:** MUI uses Emotion for styling. Adding styled-components means:
- Two CSS-in-JS runtimes
- Larger bundle size
- Potential style conflicts

**Options:**
- a) Use MUI's built-in styling (Emotion + sx prop)
- b) Use MUI with styled-components (requires adapter)
- c) Drop MUI, use styled-components only

**Recommendation:** Use MUI's built-in styling (sx prop is powerful)

See: `decisions-needed.md` (Decision 10)

## Planned Architecture

**State Management:** [TO BE DECIDED]
- Options: Redux, Zustand, Context, Jotai, React Query

**Routing:**
- React Router v6

**Build Tool:**
- Vite (fast) or Create React App

**API Client:**
- Axios or fetch
- React Query (recommended for caching)

## Application Routes

```
/                    → Landing/marketing page
/auth                → Login/signup
/dashboard           → Hunt library (list of user's hunts)
/hunts/:id           → Hunt details page
/edit/:id            → Hunt editor
/play/:id            → Hunt player (public)
/settings            → User settings
/premium             → Upgrade to premium (Stripe)
```

## Key Pages

### 1. Landing Page
- Marketing content
- "Get Started" CTA
- Feature highlights
- Example hunt showcase

### 2. Auth Page
- Firebase authentication UI
- Login/signup forms
- Social auth (Google, etc.)

### 3. Dashboard
- List of user's hunts
- "Create Hunt" button
- Filter/sort options
- Quick stats (hunts created, plays, etc.)

### 4. Hunt Details
- Hunt info (name, description, status)
- QR code display
- Version selector (if versions implemented)
- Edit button → Opens editor
- Play button → Preview hunt
- Analytics/results

### 5. Hunt Editor
- Step-by-step builder
- Add/remove/reorder steps
- Configure each step:
  - Challenge type (clue, quiz, mission, task)
  - Location (if required)
  - Content (questions, hints, etc.)
- Preview mode
- Save draft / Publish buttons

### 6. Hunt Player (Public)
- Mobile-optimized
- Step-by-step progression
- Location verification
- Challenge completion UI
- Progress indicator
- Completion screen

## Component Structure (Proposed)

```
src/
├── components/
│   ├── common/
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Input/
│   │   └── ...
│   ├── hunt/
│   │   ├── HuntCard/
│   │   ├── HuntList/
│   │   ├── StepEditor/
│   │   └── ...
│   ├── player/
│   │   ├── StepDisplay/
│   │   ├── LocationCheck/
│   │   ├── ChallengeUI/
│   │   └── ...
│   └── layout/
│       ├── Header/
│       ├── Footer/
│       └── Sidebar/
├── pages/
│   ├── Landing/
│   ├── Dashboard/
│   ├── HuntEditor/
│   ├── HuntPlayer/
│   └── ...
├── hooks/
│   ├── useAuth.ts
│   ├── useHunt.ts
│   └── ...
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── hunts.ts
├── types/
│   └── (imported from shared or backend)
├── utils/
│   └── validation.ts
└── App.tsx
```

## Integration with Backend

**API Communication:**
```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**Type Safety:**
```typescript
// Using types from backend
import { Hunt, HuntCreate } from '@hunthub/shared/types';

const createHunt = async (hunt: HuntCreate): Promise<Hunt> => {
  const response = await api.post('/hunts', hunt);
  return response.data;
};
```

## Firebase Integration

**Frontend needs:**
- Firebase SDK for auth
- Sign in/sign up flows
- Token management
- Token refresh

**Pattern:**
```typescript
// src/services/auth.ts
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

export const login = async (email: string, password: string) => {
  const auth = getAuth();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const token = await userCredential.user.getIdToken();

  // Send token to backend
  return token;
};
```

## Form Validation

**Use Zod schemas (shared from backend):**
```typescript
import { createHuntSchema } from '@hunthub/shared/validation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const HuntForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(createHuntSchema)
  });

  // Form handles validation automatically
};
```

## Mobile Considerations

**Hunt Player MUST be mobile-friendly:**
- Responsive design
- Touch-friendly UI
- GPS/location access
- Camera access (for photo missions)
- Offline capability? (optional)

**Progressive Web App:**
- Service worker for offline
- Add to home screen
- Push notifications (future)

## Current State

- [ ] No frontend code yet
- [ ] Need to decide on state management
- [ ] Need to design UI/UX (mockups?)
- [ ] Need to decide on build tool (Vite vs CRA)
- [ ] Need to set up type sharing with backend

## Next Steps (When Ready)

1. Set up React project (Vite + TypeScript)
2. Install MUI and dependencies
3. Configure routing
4. Set up Firebase auth
5. Create shared types package
6. Build authentication flow
7. Build dashboard page
8. Build hunt editor (complex)
9. Build hunt player (mobile-first)
10. Connect to backend API
