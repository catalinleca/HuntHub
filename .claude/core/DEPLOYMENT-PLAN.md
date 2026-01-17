# Deployment & Observability Plan

**Created:** 2025-01-17
**Status:** Planning

---

## Overview

This document outlines the plan for:
1. Adding logging/observability to the application
2. Setting up database environments (dev/prod)
3. Deploying all services to production

---

## Current Architecture

```
HuntHub/
├── apps/
│   ├── backend/api       → @hunthub/api      (Node.js Express)
│   └── frontend/
│       ├── editor        → @hunthub/editor   (React Vite - CMS)
│       └── player        → @hunthub/player   (React Vite - Mobile)
│
└── packages/
    ├── shared            → @hunthub/shared   (Types, schemas)
    ├── compass           → @hunthub/compass  (Design system)
    └── player-sdk        → @hunthub/player-sdk (Editor↔Player communication)
```

**Key insight:** Packages don't need npm publishing. Vite bundles them at build time.

---

## Target Architecture

```
                    ┌─────────────────┐
                    │   Vercel        │
                    │  (Static Host)  │
                    ├─────────────────┤
┌──────────────┐    │ hunthub.vercel.app     │───→ @hunthub/editor
│   User       │───→│ hunthub-player.vercel.app│───→ @hunthub/player
└──────────────┘    └────────┬────────┘
                             │
                             │ API calls
                             ↓
                    ┌─────────────────┐
                    │   Railway       │
                    │  (Node.js API)  │
                    ├─────────────────┤
                    │ hunthub-api.railway.app │───→ @hunthub/api
                    └────────┬────────┘
                             │
                             ↓
                    ┌─────────────────┐
                    │  MongoDB Atlas  │
                    ├─────────────────┤
                    │ hunthub_dev     │ (existing)
                    │ hunthub_prod    │ (to create)
                    └─────────────────┘
```

---

## Phase 1: Logging & Observability

### Backend (@hunthub/api)

**Tools:**
- **Pino** - Structured JSON logging (open source)
- **pino-http** - Express request/response logging with correlation IDs
- **Sentry** - Error tracking and alerts

**Implementation:**
1. [ ] Install dependencies: `pino`, `pino-http`, `pino-pretty`, `@sentry/node`
2. [ ] Create `src/utils/logger.ts` with Pino configuration
3. [ ] Create `src/shared/middlewares/request-logger.middleware.ts`
4. [ ] Create `src/config/sentry.ts` for Sentry initialization
5. [ ] Update `src/shared/middlewares/error.middleware.ts` to report to Sentry
6. [ ] Replace all `console.log/error` with logger calls
7. [ ] Add environment variables: `SENTRY_DSN`, `LOG_LEVEL`

**Pino Logger Setup:**
```typescript
// src/utils/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
  base: {
    service: 'hunthub-api',
    env: process.env.NODE_ENV,
  },
});
```

**Sentry Setup:**
```typescript
// src/config/sentry.ts
import * as Sentry from '@sentry/node';

export const initSentry = () => {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    });
  }
};
```

### Frontend (@hunthub/editor + @hunthub/player)

**Tools:**
- **Sentry** - Error tracking only (no general logging needed)

**Implementation:**
1. [ ] Install `@sentry/react` in both frontend apps
2. [ ] Create Sentry initialization in each app's entry point
3. [ ] Add error boundary with Sentry reporting
4. [ ] Add environment variable: `VITE_SENTRY_DSN`

**Sentry React Setup:**
```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
});
```

### Cost

| Service | Free Tier |
|---------|-----------|
| Sentry | 5,000 errors/month |
| Pino | Open source (free) |

---

## Phase 2: Database Environments

**Current state:** Single MongoDB Atlas database (dev)

**Target state:**
- `hunthub_dev` - Development/local (existing)
- `hunthub_prod` - Production (to create)

**Implementation:**
1. [ ] Create new database in MongoDB Atlas: `hunthub_prod`
2. [ ] Create separate database user for production
3. [ ] Document connection strings in `.env.example`
4. [ ] Verify backend reads `MONGODB_URI` from environment

**Environment files:**
```bash
# .env.local (development)
MONGODB_URI=mongodb+srv://...hunthub_dev...
NODE_ENV=development

# .env.production (production - stored in deployment platform)
MONGODB_URI=mongodb+srv://...hunthub_prod...
NODE_ENV=production
```

---

## Phase 3: Secrets Strategy

### Environment Variables Required

**Backend (@hunthub/api):**
```bash
# Database
MONGODB_URI=mongodb+srv://...

# Firebase (Option A: Base64 encoded JSON)
FIREBASE_SERVICE_ACCOUNT_BASE64=eyJhbGciOiJSUzI1NiIs...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
S3_BUCKET_NAME=...

# AI Providers
GROQ_API_KEY=...
GOOGLE_AI_API_KEY=...
OPENAI_API_KEY=...

# Observability
SENTRY_DSN=https://...@sentry.io/...
LOG_LEVEL=info

# Server
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://hunthub.vercel.app,https://hunthub-player.vercel.app
```

**Frontend (Editor + Player):**
```bash
VITE_API_URL=https://hunthub-api.railway.app
VITE_SENTRY_DSN=https://...@sentry.io/...
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

### Firebase JSON → Base64

**How to encode:**
```bash
# Encode
cat firebase-service-account.json | base64 > firebase-base64.txt

# The content of firebase-base64.txt goes into FIREBASE_SERVICE_ACCOUNT_BASE64
```

**How to decode in code:**
```typescript
// src/config/firebase.ts
const getServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    return JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString()
    );
  }
  // Fallback for local development with JSON file
  return require('../../firebase-service-account.json');
};
```

**Implementation:**
1. [ ] Update `src/config/firebase.ts` to support base64 env var
2. [ ] Create `.env.example` documenting all required variables
3. [ ] Test locally with base64 encoded Firebase credentials

---

## Phase 4: Deploy Backend

**Platform:** Railway (recommended) or Render

**Railway Setup:**
1. [ ] Create Railway account
2. [ ] Connect GitHub repository
3. [ ] Configure service:
   - Root directory: `apps/backend/api`
   - Build command: `npm run build:shared && npm run build:api`
   - Start command: `npm run start`
4. [ ] Add all environment variables
5. [ ] Deploy and test endpoints

**Build Commands for Railway:**
```bash
# Install dependencies (from root)
npm install

# Build shared package first
npm run build:shared

# Build API
npm run build:api

# Start
cd apps/backend/api && npm run start
```

**Alternative Render Setup:**
1. [ ] Create Render account
2. [ ] New Web Service → Connect GitHub
3. [ ] Configure:
   - Root directory: (leave empty, use root)
   - Build command: `npm install && npm run build:shared && npm run build:api`
   - Start command: `node apps/backend/api/dist/server.js`
4. [ ] Add environment variables
5. [ ] Deploy

**Verification:**
- [ ] Health check endpoint responds
- [ ] API endpoints work with Postman/curl
- [ ] Logs appear in platform dashboard
- [ ] Sentry receives test error

---

## Phase 5: Deploy Frontends

**Platform:** Vercel (recommended)

### Editor Deployment

1. [ ] Create Vercel account
2. [ ] Import GitHub repository
3. [ ] Configure project:
   - Framework preset: Vite
   - Root directory: `apps/frontend/editor`
   - Build command: `cd ../../../ && npm install && npm run build:shared && npm run build:compass && npm run build:editor`
   - Output directory: `dist`
4. [ ] Add environment variables:
   - `VITE_API_URL`
   - `VITE_SENTRY_DSN`
   - `VITE_FIREBASE_*`
5. [ ] Deploy

### Player Deployment

1. [ ] Create second Vercel project
2. [ ] Import same GitHub repository
3. [ ] Configure project:
   - Framework preset: Vite
   - Root directory: `apps/frontend/player`
   - Build command: `cd ../../../ && npm install && npm run build:shared && npm run build:compass && npm run build:player`
   - Output directory: `dist`
4. [ ] Add environment variables
5. [ ] Deploy

**Verification:**
- [ ] Editor loads and can authenticate
- [ ] Player loads hunt correctly
- [ ] API calls work (check Network tab)
- [ ] Sentry receives frontend errors

---

## Phase 6: Custom Domain (Optional)

**Skip this initially.** Use platform default domains first.

**When ready:**
1. [ ] Purchase domain (Cloudflare, Namecheap, ~$10-12/year)
2. [ ] Configure DNS:
   - `hunthub.app` → Vercel (Editor)
   - `play.hunthub.app` → Vercel (Player)
   - `api.hunthub.app` → Railway
3. [ ] Update CORS settings in backend
4. [ ] Update `VITE_API_URL` in frontends
5. [ ] Update Firebase authorized domains

---

## Checklist Summary

### Phase 1: Logging
- [ ] Backend: Install Pino + Sentry
- [ ] Backend: Create logger utility
- [ ] Backend: Add request logging middleware
- [ ] Backend: Integrate Sentry in error handler
- [ ] Backend: Replace console.log with logger
- [ ] Frontend: Install Sentry in editor
- [ ] Frontend: Install Sentry in player
- [ ] Create Sentry project and get DSN

### Phase 2: Database
- [ ] Create `hunthub_prod` database in Atlas
- [ ] Create production database user
- [ ] Document connection strings

### Phase 3: Secrets
- [ ] Base64 encode Firebase JSON
- [ ] Update firebase.ts to support base64 env var
- [ ] Create .env.example with all required vars
- [ ] Test locally with production-like env vars

### Phase 4: Backend Deployment
- [ ] Create Railway/Render account
- [ ] Configure build and start commands
- [ ] Add all environment variables
- [ ] Deploy and verify

### Phase 5: Frontend Deployment
- [ ] Create Vercel account
- [ ] Deploy Editor
- [ ] Deploy Player
- [ ] Verify API integration

### Phase 6: Domain (Optional)
- [ ] Purchase domain
- [ ] Configure DNS
- [ ] Update CORS and env vars

---

## Platform Free Tiers

| Platform | Free Tier | Notes |
|----------|-----------|-------|
| Railway | $5 credit/month | Good for backend |
| Render | 750 hrs/month | Sleeps after 15 min |
| Vercel | Unlimited | Perfect for frontends |
| MongoDB Atlas | 512 MB | Enough for portfolio |
| Sentry | 5,000 events/month | Plenty for dev |

---

## Quick Reference URLs

- Sentry: https://sentry.io
- Railway: https://railway.app
- Render: https://render.com
- Vercel: https://vercel.com
- MongoDB Atlas: https://cloud.mongodb.com
- Pino docs: https://getpino.io

---

**Next action:** Start with Phase 1 (Logging) - self-contained, immediately useful.