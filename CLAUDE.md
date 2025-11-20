# HuntHub Project - Claude Code Memory

This file auto-loads every time you start Claude Code in this project.
It imports all context about the project, so Claude always knows:
- How to behave (senior engineer mindset)
- What the application does
- Current backend architecture and patterns
- What's implemented vs what's pending
- Requirements and technical decisions
- Current priority work

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

## Core Behavior & Principles

@.claude/behavior/principles.md
@.claude/decisions/solid-principles.md

## 🚀 Quick Start & Current Focus

@.claude/core/NEXT-SESSION.md
@.claude/core/PROJECT.md
Commented out for frontend work - uncomment when needed
@.claude/core/ROADMAP.md

## High-Level Architecture
@.claude/core/ARCHITECTURE.md

<!-- ## Feature-Specific Documentation -->
<!-- @.claude/features/hunt-sharing.md -->
<!-- @.claude/features/hunt-release.md -->
<!-- @.claude/features/numeric-id-strategy.md -->
<!-- @.claude/features/versioning-system.md -->
<!-- @.claude/features/release-concept.md -->

## Backend Context
@.claude/backend/architecture.md
@.claude/backend/patterns.md
@.claude/backend/current-state.md

<!-- ## Technical Decisions (Why We Chose This) -->
<!-- @.claude/decisions/mongodb-vs-postgres.md -->
<!-- @.claude/decisions/schema-sharing-final-strategy.md -->
<!-- @.claude/decisions/production-best-practices-type-sharing.md -->
<!-- @.claude/decisions/schema-validation-strategy.md -->

## 🎨 Frontend Context (CURRENT FOCUS - Editor App)

@.claude/frontend/FRONTEND-ARCHITECTURE.md
@.claude/frontend/codebase-tools/UI-decision.md
@.claude/frontend/codebase-tools/MUI-implementation-guide-suggestion.md
@.claude/frontend/codebase-tools/react-19-usage-guide-hunthub.md

**Note:** Player app is separate - ignore `.claude/frontend/player/` and `.claude/frontend/_archive/` folders

<!-- ## Deployment (Future) -->
<!-- @.claude/deployment/strategy.md -->

---

## 📚 Reference Library (NOT auto-loaded - access manually)

Use Read tool to access these when needed:

**Frontend Reference (Editor-specific):**
- `.claude/frontend/reference/Design-decisions.md` - Editor layout rationale (timeline approach)
- `.claude/frontend/reference/Component-specs.md` - Editor component specs (StepCard, Timeline, etc.)
- `.claude/frontend/reference/performance-patterns.md` - Performance optimization patterns

**Guides (Learning Materials):**
- `.claude/guides/challenge-types-guide.md` - Challenge type reference
- `.claude/guides/data-model-decisions.md` - Data model design rationale
- `.claude/guides/player-api-design.md` - Player API design (future feature)
- `.claude/guides/tree-and-branching-strategy.md` - Tree VIEW API design

**Reference (Historical/Archived):**
- `.claude/reference/decisions-needed.md` - Old decision log
- `.claude/reference/design-concerns.md` - Historical discussions
- `.claude/reference/sessions/` - Old session summaries

---

## 🚀 Quick Commands

**Update memory:** Type `/memory` to edit these files
**Add quick note:** Start your message with `#` to add to memory
**View loaded memory:** All files above are auto-loaded at startup

## 🎯 How to Work Together

1. You (the user) make decisions and define requirements
2. Claude implements following existing patterns
3. Claude flags issues and suggests improvements
4. Together we build a well-architected, consistent application

I want you to remember that when talking about aws, and getting
instructions nad everything, it is really important you give me
accurate data and info. I don't want any outdated stuff, it is
difficult to work with them and ideally you should count and use
on the aws mcp that we installed

---

**Memory auto-loads from:** `/Users/catalinleca/leca/HuntHub/.claude/`
