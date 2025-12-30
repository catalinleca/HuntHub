# Getting Started with HuntHub

**Quick setup guide for new developers or returning after a break.**

---

## Prerequisites

- Node.js 22.13.1 (use nvm for version management)
- MongoDB (local or MongoDB Atlas)
- Firebase project (for authentication)
- AWS account (for S3 storage)
- Git

---

## Initial Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd HuntHub
npm install
```

This installs all dependencies for the monorepo (root + all workspaces).

### 2. Firebase Configuration

**Create Firebase service account:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save as `apps/backend/api/src/firebaseService.json`

**Example file structure:**
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  // ... other fields
}
```

**⚠️ Never commit this file!** (already in .gitignore)

### 3. Environment Variables

Create `apps/backend/api/.env.local`:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/hunthub
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/hunthub

# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=./firebaseService.json

# AWS S3 (for asset uploads)
AWS_REGION=eu-west-1
AWS_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Server
PORT=3000
NODE_ENV=development
```

**See:** `apps/backend/api/.env.example` for full template

### 4. AWS S3 Setup

**Create S3 bucket:**
1. Go to AWS Console → S3
2. Create bucket (e.g., `hunthub-assets-dev`)
3. Enable CORS for uploads
4. Create CloudFront distribution (optional, for CDN)

**IAM User:**
1. Create IAM user with S3 access
2. Generate access keys
3. Add to `.env.local`

**See:** `deployment/aws-deployment-complete.md` for detailed AWS setup

---

## Build Shared Package

**Before running the API for the first time**, you must build the shared package:

```bash
npm run build:shared
```

This compiles TypeScript in `packages/shared/` to the `dist/` folder that the API imports from.

**When to rebuild:**
- After `npm install` or fresh clone
- After modifying files in `packages/shared/`
- If you see "Cannot find module '@hunthub/shared'" errors

---

## Running the Application

### Development Mode

**Backend API:**
```bash
# From root
npm run dev:api

# Or from apps/backend/api
cd apps/backend/api
npm run dev
```

Server starts at `http://localhost:3000`

**Watch mode for types:**
```bash
# Terminal 1: Watch backend TypeScript
cd apps/backend/api
npm run type-check

# Terminal 2: Run dev server
npm run dev
```

### Generate Types from OpenAPI

**When you update OpenAPI schema:**
```bash
# From root
npm run generate

# This runs:
# 1. Generate TypeScript types from OpenAPI
# 2. Generate Zod schemas (if configured)
```

**OpenAPI schema location:** `packages/shared/openapi/hunthub_models.yaml`

---

## Running Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Specific test file
npm test huntCrud.test.ts

# With coverage
npm test -- --coverage
```

**Current test status:** 185/185 tests passing

---

## Common Development Tasks

### Create a New Feature

1. **Update OpenAPI schema** (if adding new endpoints)
   - Edit `packages/shared/openapi/hunthub_models.yaml`
   - Run `npm run generate`

2. **Create model** (if new entity)
   - Add to `apps/backend/api/src/database/models/`
   - Follow existing patterns (see `backend/patterns.md`)

3. **Create service**
   - Add to `apps/backend/api/src/services/` or `apps/backend/api/src/features/`
   - Implement interface + class with `@injectable()`

4. **Create controller**
   - Add to `apps/backend/api/src/controllers/`
   - Use dependency injection

5. **Create routes**
   - Add to `apps/backend/api/src/routes/`
   - Wire up controller from DI container

6. **Add tests**
   - Integration tests in `apps/backend/api/tests/integration/`
   - Use test factories from `tests/setup/factories/`

7. **Update documentation**
   - Update `backend/current-state.md`
   - Update `core/PROJECT.md` (if major feature)
   - Document decisions in `decisions/` (if architectural change)

**See:** `backend/patterns.md` for code patterns and conventions

### Update Documentation

**After completing work:**
```bash
# Update current state
vim .claude/backend/current-state.md

# Update project state
vim .claude/core/PROJECT.md

# Update roadmap
vim .claude/core/ROADMAP.md
```

**Hot docs (auto-loaded):** core/, decisions/, features/, backend/
**Cold docs (reference only):** guides/, deployment/, reference/

**See:** `.claude/README.md` for documentation structure

---

## Troubleshooting

### MongoDB Connection Issues

**Error:** "MongooseServerSelectionError"

**Fix:**
1. Ensure MongoDB is running: `mongod`
2. Check connection string in `.env.local`
3. For Atlas: Check IP whitelist

### Firebase Authentication Errors

**Error:** "Firebase service account not found"

**Fix:**
1. Check `firebaseService.json` exists in `apps/backend/api/`
2. Verify path in `.env.local` is correct
3. Ensure file is not corrupted (valid JSON)

### Type Generation Fails

**Error:** "Cannot generate types from OpenAPI"

**Fix:**
1. Validate OpenAPI schema: Use Swagger Editor
2. Check `packages/shared/scripts/generate.ts`
3. Clear cache: `rm -rf packages/shared/dist`

### Tests Failing

**Common issues:**
1. MongoDB Memory Server not starting → Increase timeout in jest.config.js
2. Firebase auth mocking → Check `tests/helpers/authHelper.ts`
3. Stale data → Tests should clean database in beforeEach

---

## Project Structure Quick Reference

```
HuntHub/
├── apps/backend/api/          # Backend API
│   ├── src/
│   │   ├── controllers/       # HTTP handlers
│   │   ├── services/          # Business logic
│   │   ├── features/          # Feature modules
│   │   ├── database/models/   # Mongoose models
│   │   └── routes/            # Express routes
│   └── tests/                 # Integration tests
├── packages/shared/           # Shared types
│   ├── openapi/               # OpenAPI schema
│   └── src/types/             # Generated types
└── .claude/                   # Documentation
    ├── core/                  # Hot docs (auto-loaded)
    ├── backend/               # Backend-specific
    ├── decisions/             # Architectural decisions
    └── features/              # Feature documentation
```

---

## Useful Commands

```bash
# Lint all packages
npm run lint

# Format all packages
npm run format

# Build shared package
npm run build:shared

# Build backend
npm run build:api

# Clean install (if having issues)
rm -rf node_modules package-lock.json
npm install

# Check for outdated dependencies
npm outdated
```

---

## Next Steps

1. Read `core/PROJECT.md` - Understand what HuntHub is
2. Read `core/ROADMAP.md` - See development timeline
3. Read `backend/architecture.md` - Understand technical architecture
4. Read `backend/patterns.md` - Learn code conventions
5. Pick a task from `core/ROADMAP.md` and start coding!

---

**Questions?** Check `.claude/README.md` for documentation navigation.

**Updated:** 2025-11-08
