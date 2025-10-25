# HuntHub Project - Claude Code Memory

This file auto-loads every time you start Claude Code in this project.
It imports all context about the project, so Claude always knows:
- How to behave (senior engineer mindset)
- What the application does
- Current backend architecture and patterns
- What's implemented vs what's pending
- Requirements and technical decisions needed
- Frontend and deployment plans

---

## Core Behavior & Principles

@.claude/behavior/principles.md

## Project Overview

@.claude/application-overview.md
@.claude/requirements.md
@.claude/project-state.md

## Backend Context

@.claude/backend/architecture.md
@.claude/backend/patterns.md
@.claude/backend/current-state.md

## Technical Deep Dives

@.claude/mongodb-vs-postgres.md
@.claude/schema-sharing-final-strategy.md
@.claude/production-best-practices-type-sharing.md
@.claude/solid-principles.md
@.claude/publishing-workflow.md
@.claude/schema-validation-strategy.md
@.claude/design-concerns.md
@.claude/decisions-needed.md

## 🚀 Quick Start

@.claude/NEXT-SESSION-START-HERE.md

## Frontend Context (Placeholder)

@.claude/frontend/overview.md

## Deployment Context (Placeholder)

@.claude/deployment/strategy.md

---

## 📍 Current Focus

**Finishing the backend** - We're working on the Express/TypeScript API.

Recent work: User service, Hunt service, Auth fixes

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
