# HuntHub Documentation

**📍 Start here if you're coming back after a break.**

This is the documentation hub for HuntHub - a location-based treasure hunt platform built with Node.js, TypeScript, MongoDB, and React.

---

## 🚀 Quick Navigation

### Coming Back After a Break?
1. **[core/NEXT-SESSION.md](core/NEXT-SESSION.md)** - Quick resume guide with recent achievements
2. **[core/PROJECT.md](core/PROJECT.md)** - What is HuntHub + current implementation state
3. **[core/ROADMAP.md](core/ROADMAP.md)** - Development timeline and progress tracking

### Why Did We Do X?
- **[decisions/](decisions/)** - All architectural and technical decisions
  - mongodb-vs-postgres.md, schema-sharing-final-strategy.md, etc.

### How Does Feature Y Work?
- **[features/](features/)** - Feature-specific architecture and design
  - hunt-sharing.md, hunt-release.md, numeric-id-strategy.md

### What's the Current Backend State?
- **[backend/](backend/)** - Backend implementation details
  - architecture.md, patterns.md, current-state.md

### How Do I Build Feature Z?
- **[guides/](guides/)** - General learning materials (NOT auto-loaded)
  - Step-by-step implementation patterns and best practices

### Where's the Deployment Info?
- **[deployment/](deployment/)** - Infrastructure and deployment docs (NOT auto-loaded)

### Historical Context?
- **[reference/](reference/)** - Old session notes, archived decisions (NOT auto-loaded)

---

## 📁 Folder Structure

```
.claude/
├── README.md                    ← You are here
├── core/                        ← Auto-loaded on boot
│   ├── PROJECT.md              (What is HuntHub + current state)
│   ├── ROADMAP.md              (Development timeline - frequently updated)
│   ├── GETTING-STARTED.md      (Quick setup guide)
│   ├── ARCHITECTURE.md         (High-level technical overview)
│   └── NEXT-SESSION.md         (Resume guide for new sessions)
├── decisions/                   ← Auto-loaded on boot
│   └── *.md                    (Why we chose X over Y)
├── features/                    ← Auto-loaded on boot
│   └── *.md                    (How feature X works)
├── backend/                     ← Auto-loaded on boot
│   ├── architecture.md
│   ├── patterns.md
│   └── current-state.md
├── guides/                      ← NOT auto-loaded (cold docs)
│   └── *.md                    (How to build Y - learning materials)
├── deployment/                  ← NOT auto-loaded (cold docs)
│   └── *.md                    (Infrastructure setup)
└── reference/                   ← NOT auto-loaded (cold docs)
    ├── sessions/               (Old session summaries)
    └── *.md                    (Archived decisions, historical context)
```

---

## 🔥 Hot vs Cold Docs

**Hot docs (Auto-loaded):**
- core/, decisions/, features/, backend/
- Loaded automatically when Claude Code boots
- Keep these concise to save tokens

**Cold docs (Reference only):**
- guides/, deployment/, reference/
- Only loaded when explicitly needed
- Can be more detailed/verbose

---

## 🎯 Common Scenarios

### "I haven't worked on this in 6 months, what's the state?"
1. Read **core/NEXT-SESSION.md** - See recent achievements
2. Read **core/PROJECT.md** - Understand what's implemented
3. Read **core/ROADMAP.md** - See what's next

### "Why did we use MongoDB instead of PostgreSQL?"
- Read **decisions/mongodb-vs-postgres.md**

### "How does the versioning system work?"
- Read **features/hunt-release.md** for release architecture
- Or read **backend/architecture.md** for high-level overview

### "How do I implement a new feature following project patterns?"
- Read **backend/patterns.md** for code patterns
- Read **guides/** folder for step-by-step examples

### "What's deployed and how?"
- Read **deployment/strategy.md**
- Read **deployment/aws-deployment-complete.md** (if exists)

### "What were we discussing in February 2025?"
- Read **reference/sessions/** folder for historical session notes

---

## ✅ Keeping Docs Synchronized

**Single Source of Truth:**
- Each concept documented in ONE place
- Other docs REFERENCE it, don't repeat it

**Cross-Reference Pattern:**
```markdown
See decisions/mongodb-vs-postgres.md for database choice rationale.
```

**Avoid:**
- ❌ Copying same explanation to multiple files
- ❌ Contradictory information across files
- ❌ Outdated information (update docs with code changes)

---

## 🔄 How It Works

**Main orchestrator:** `/Users/catalinleca/leca/HuntHub/CLAUDE.md`

This file imports context files using `@path/to/file.md` syntax. When you start Claude Code, it automatically loads `CLAUDE.md`, which imports everything from `.claude/`, giving full project context.

---

**Updated:** 2025-11-08
