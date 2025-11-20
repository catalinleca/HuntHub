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

## Core Behavior & Principles

@.claude/behavior/principles.md
@.claude/decisions/solid-principles.md

## 🚀 Quick Start & Current Focus

@.claude/core/NEXT-SESSION.md
@.claude/core/PROJECT.md
@.claude/core/ROADMAP.md

## High-Level Architecture

@.claude/core/ARCHITECTURE.md

## Feature-Specific Documentation

@.claude/features/hunt-sharing.md
@.claude/features/hunt-release.md
@.claude/features/numeric-id-strategy.md
@.claude/features/versioning-system.md
@.claude/features/release-concept.md

## Backend Context

@.claude/backend/architecture.md
@.claude/backend/patterns.md
@.claude/backend/current-state.md

## Technical Decisions (Why We Chose This)

@.claude/decisions/mongodb-vs-postgres.md
@.claude/decisions/schema-sharing-final-strategy.md
@.claude/decisions/production-best-practices-type-sharing.md
@.claude/decisions/schema-validation-strategy.md

## Frontend & Deployment (Future Work)

@.claude/frontend/overview.md
@.claude/deployment/strategy.md

---

## 📚 Reference Library (NOT auto-loaded - access manually)

Use Read tool to access these when needed:

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
