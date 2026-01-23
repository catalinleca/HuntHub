# HuntHub

Location-based treasure hunt platform. Create hunts in the Editor, share via QR code, players complete challenges on their phones.

[![CI Pipeline](https://github.com/catalinleca/HuntHub/actions/workflows/ci.yml/badge.svg)](https://github.com/catalinleca/HuntHub/actions/workflows/ci.yml)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/catalinleca/HuntHub?utm_source=oss&utm_medium=github&utm_campaign=catalinleca%2FHuntHub&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

## Domains

| Environment | Editor | Player | API |
|-------------|--------|--------|-----|
| **Production** | build.hedgehunt.app | play.hedgehunt.app | api.hedgehunt.app |
| **Local** | build.hedgehunt.local | play.hedgehunt.local | api.hedgehunt.local |

---

## Quick Start (TL;DR)

```bash
# 1. Install prerequisites
brew install caddy mkcert node@22

# 2. Clone and install
git clone git@github.com:catalinleca/HuntHub.git
cd HuntHub
npm install

# 3. Run the one-time setup script (certificates, hosts, sudo)
npm run setup  # TODO: create this script, for now follow manual steps below

# 4. Get environment files from a team member, then:
npm start  # Runs all apps at https://build.hedgehunt.local
```

---

## Project Structure

```
HuntHub/
├── apps/
│   ├── backend/api/          # Express API (Node.js)
│   └── frontend/
│       ├── editor/           # Hunt creation app (React + Vite)
│       └── player/           # Hunt playing app (React + Vite)
├── packages/
│   ├── shared/               # Shared types, schemas, constants
│   ├── compass/              # MUI theme library
│   └── player-sdk/           # Editor ↔ Player iframe communication
├── Caddyfile                  # Local reverse proxy config
└── package.json               # Monorepo scripts
```

---

## Prerequisites

Before you begin, install these tools:

### 1. Node.js 22+

```bash
# Using Homebrew
brew install node@22

# Or using nvm
nvm install 22
nvm use 22
```

Verify: `node --version` should show v22.x.x

### 2. Homebrew (macOS)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 3. Caddy (reverse proxy)

```bash
brew install caddy
```

### 4. mkcert (local HTTPS certificates)

```bash
brew install mkcert
mkcert -install  # Installs the local CA (one time)
```

---

## Setup Guide

### Step 1: Clone the Repository

```bash
git clone git@github.com:catalinleca/HuntHub.git
cd HuntHub
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all dependencies for all workspaces (backend, editor, player, packages).

### Step 3: Generate Local HTTPS Certificates

```bash
# From the project root
mkcert build.hedgehunt.local play.hedgehunt.local api.hedgehunt.local
```

This creates two files in the project root:
- `build.hedgehunt.local+2.pem` (certificate)
- `build.hedgehunt.local+2-key.pem` (private key)

These files are gitignored. Each developer generates their own.

### Step 4: Configure Local Domains

Add these lines to your `/etc/hosts` file:

```bash
sudo nano /etc/hosts
```

Add at the bottom:

```
127.0.0.1 build.hedgehunt.local
127.0.0.1 play.hedgehunt.local
127.0.0.1 api.hedgehunt.local
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

### Step 5: Enable Passwordless Sudo for Caddy

To avoid typing your password every time you start the dev server:

```bash
echo "$USER ALL=(ALL) NOPASSWD: $(which caddy)" | sudo tee /etc/sudoers.d/caddy
```

This allows Caddy to bind to port 443 (HTTPS) without prompting for password.

### Step 6: Set Up Environment Files

Copy the example files and fill in the values:

**Backend** (`apps/backend/api/.env.local`):
```bash
cp apps/backend/api/.env.example apps/backend/api/.env.local
```

Required variables:
```env
PORT=3000
NODE_ENV=development

ALLOWED_ORIGINS=http://localhost:5174,http://localhost:5175,https://build.hedgehunt.local,https://play.hedgehunt.local

MONGODB_URI=mongodb+srv://...
PLAYER_URL=https://play.hedgehunt.local

FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...
FIREBASE_SERVICE_ACCOUNT=...

AWS_REGION=eu-west-1
AWS_S3_BUCKET=...
AWS_CLOUDFRONT_URL=...
AWS_PROFILE=...

OPENAI_API_KEY=...
PREVIEW_TOKEN_SECRET=...
```

**Editor** (`apps/frontend/editor/.env.local`):
```env
VITE_API_URL=https://api.hedgehunt.local/api
VITE_PLAYER_URL=https://play.hedgehunt.local

VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

VITE_GOOGLE_MAPS_API_KEY=...
VITE_GOOGLE_MAP_ID=...
```

**Player** (`apps/frontend/player/.env.local`):
```env
VITE_API_URL=https://api.hedgehunt.local/api

VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

VITE_GOOGLE_MAPS_API_KEY=...
VITE_GOOGLE_MAP_ID=...
```

Ask a team member for the actual values or check your password manager.

### Step 7: Build Shared Packages

The backend requires built packages:

```bash
npm run build:shared
npm run build:compass
```

### Step 8: Start Development

```bash
npm start
```

This starts **all apps** (Caddy + API + Editor + Player) in one terminal.

Open: **https://build.hedgehunt.local**

---

## Available Commands

### Development

| Command | Description |
|---------|-------------|
| `npm start` | Start all apps with local HTTPS domains |
| `npm run api` | Start only API + Caddy |
| `npm run editor` | Start only Editor + Caddy |
| `npm run player` | Start only Player + Caddy |
| `npm run dev:api` | Start API on localhost:3000 (no Caddy) |
| `npm run dev:editor` | Start Editor on localhost:5174 (no Caddy) |
| `npm run dev:player` | Start Player on localhost:5175 (no Caddy) |

### Build

| Command | Description |
|---------|-------------|
| `npm run build:shared` | Build shared package (required for backend) |
| `npm run build:compass` | Build compass package (required for backend) |
| `npm run build:api` | Build backend for production |
| `npm run build:editor` | Build editor for production |
| `npm run build:all` | Build all packages |

### Testing

| Command | Description |
|---------|-------------|
| `npm run test:api` | Run backend tests |
| `npm run test:api:watch` | Run tests in watch mode |
| `npm run test:api:coverage` | Run tests with coverage report |

### Code Quality

| Command | Description |
|---------|-------------|
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting without fixing |
| `npm run type-check` | Run TypeScript type checking |
| `npm run generate` | Regenerate types from OpenAPI schema |

---

## Architecture Overview

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js, Express, TypeScript, MongoDB, Firebase Auth |
| **Frontend** | React 19, Vite, TypeScript, MUI v6, styled-components |
| **State** | React Query (server), Zustand (UI), React Hook Form (forms) |
| **Infrastructure** | Fly.io (API), Vercel (Frontend), AWS S3 (Assets) |

### Data Flow

```
Editor (build.hedgehunt.app)
    │
    ├── Create/Edit hunts
    ├── Publish & Release
    └── Share via QR code
            │
            ▼
Player (play.hedgehunt.app)
    │
    ├── Play hunts step-by-step
    ├── Location verification (GPS)
    ├── Photo/Audio capture
    └── AI validation
            │
            ▼
API (api.hedgehunt.app)
    │
    ├── Hunt CRUD + Versioning
    ├── Session management
    ├── Answer validation
    └── Asset management (S3)
```

### Shared Packages

- **@hunthub/shared** - Types, Zod schemas, constants (generated from OpenAPI)
- **@hunthub/compass** - MUI theme, design tokens
- **@hunthub/player-sdk** - Editor ↔ Player iframe communication

---

## Troubleshooting

### "Cannot find module '@hunthub/shared'"

Build the shared package first:
```bash
npm run build:shared
```

### "Address already in use" (port 443)

Another Caddy instance or process is using port 443:
```bash
# Find and kill it
sudo lsof -i :443
sudo kill -9 <PID>
```

### CORS errors

Make sure your backend `.env.local` includes the local domains in `ALLOWED_ORIGINS`:
```env
ALLOWED_ORIGINS=http://localhost:5174,http://localhost:5175,https://build.hedgehunt.local,https://play.hedgehunt.local
```

Then restart the API.

### Certificate errors in browser

1. Make sure you ran `mkcert -install` (one time)
2. Regenerate certificates: `mkcert build.hedgehunt.local play.hedgehunt.local api.hedgehunt.local`
3. Restart Caddy

### Firebase Auth not working on local domains

Add your local domains to Firebase Console:
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add `build.hedgehunt.local` and `play.hedgehunt.local`

---

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `npm run format` and `npm run lint`
4. Push and create a PR
5. CodeRabbit will review automatically

---

## Status

| Component | Status |
|-----------|--------|
| Backend API | ✅ Complete (217 tests) |
| Editor | 🚧 In Progress |
| Player | 🚧 In Progress |
| @hunthub/shared | ✅ Complete |
| @hunthub/compass | ✅ Complete |
| @hunthub/player-sdk | ✅ Complete |
