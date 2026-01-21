We are in January 2026!!

# HuntHub Project - Claude Code Memory

This file auto-loads every time you start Claude Code in this project.

**What gets loaded:**
- Working style (how I think and interact)
- Code standards (enforceable patterns)
- Current project state

---

## 🎯 CURRENT FOCUS: Frontend (Editor App)

**Working on:** Building the Hunt Editor frontend (React 19 + MUI + Vite)

**Backend Summary (for context only):**
- ✅ **Production-ready** - 185/185 tests passing
- ✅ Hunt CRUD + Versioning (Hunt master + HuntVersion snapshots)
- ✅ Publishing & Release workflow (optimistic locking, race prevention)
- ✅ Hunt Sharing (3-tier permissions: Owner > Admin > View)
- ✅ AWS S3 integration for assets
- 📍 **Next backend:** Player API (sessions, validation, progress tracking)
- **Tech:** Node.js + Express + MongoDB + Firebase Auth

**Frontend Focus:**
- Editor app only (Player is separate, ignore for now)
- React 19 + TypeScript + Vite + MUI v6 + styled-components
- Journey Timeline layout (NOT traditional sidebar)
- Zustand (UI state) + React Query (server state)
- React Hook Form + Zod for forms

---

## Working Style & Mindset

@.claude/behavior/working-style.md

When working with libraries like React Query, MUI, React Hook Form, Zustand, Zod, or CSS/layout patterns, always understand the problem first. Search for best practices in official docs and community resources.

---

## Code Standards (Enforceable Patterns)

@.claude/standards/frontend.md
@.claude/standards/backend.md

---

## Current Project State

@.claude/core/NEXT-SESSION.md
@.claude/core/PROJECT.md

---

## 📚 Reference Library (NOT auto-loaded)

Use Read tool to access when needed:

@.claude/reference/README.md

**Quick links:**
- Architecture: `core/ARCHITECTURE.md`, `backend/architecture.md`
- Frontend guides: `frontend/codebase-tools/` folder
- Feature docs: `features/` folder
- Design decisions: `frontend/reference/` folder

---

## 🎯 How to Work Together

1. You (the user) make decisions and define requirements
2. Claude implements following existing patterns
3. Claude flags issues and suggests improvements
4. Together we build a well-architected, consistent application

---

## Important Notes

- When talking about AWS, give accurate and up-to-date info. Use the AWS MCP when available.
- Phosphor icons use `Icon` suffix: `MapPinIcon` not `MapPin`
- Thorough review and quality are non-negotiable: avoid shortcuts, validate patterns, deliver production-grade code
- Player app is separate - ignore `.claude/frontend/player/` and `.claude/frontend/_archive/` folders

---

**Memory auto-loads from:** `/Users/catalinleca/HuntHub-worktree/.claude/`
