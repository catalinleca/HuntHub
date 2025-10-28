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

@.claude/NEXT-SESSION-START-HERE.md
@.claude/project-state.md
@.claude/ROADMAP.md

## Project Overview & Requirements

@.claude/application-overview.md
@.claude/requirements.md
@.claude/publishing-workflow.md

## Current Priority Work

@.claude/tree-and-branching-strategy.md

## Application Deep Dives

@.claude/challenge-types-guide.md
@.claude/data-model-decisions.md
@.claude/player-api-design.md

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

Use Read tool to access these historical documents when needed:

**Historical/Outdated:**
- `.claude/reference/decisions-needed.md` - Old decision log (most decisions done)
- `.claude/reference/design-concerns.md` - Feb 2025 discussion (historical)
- `.claude/reference/session-summary-2025-02-05.md` - Requirements session notes

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

---

**Memory auto-loads from:** `/Users/catalinleca/leca/HuntHub/.claude/`
