# 🚀 START HERE - Next Session Quick Guide

**When you open Claude Code next time, I'll auto-load all context. Here's what to do:**

---

## ✅ All Major Decisions Made

You finished requirements and made all critical decisions on 2025-02-05.

**Quick summary:**
- ✅ MongoDB (keep it, define good patterns)
- ✅ Monorepo with shared types (production standard)
- ✅ Complex versioning (phased: MVP → V1.1 → V1.2)
- ✅ Separate steps collection (better for progress tracking)
- ✅ Skip Review state for MVP (add later with OCP)
- ✅ Active hunts = published hunts only

**All decisions:** See `.claude/decisions-needed.md`

---

## 🎯 Next Steps (In Order)

### 1. ~~Set Up Monorepo~~ ✅ **COMPLETE** (2025-10-27)

**Completed:**
- ✅ Created npm workspaces monorepo structure (2025-10-26)
- ✅ Set up `packages/shared/` with OpenAPI → TypeScript generation
- ✅ Moved backend to `apps/backend/api/` (renamed to `@hunthub/api`)
- ✅ Created structure for 2 frontends: `apps/frontend/editor/` and `apps/frontend/player/`
- ✅ Updated workspace config to `apps/backend/*` and `apps/frontend/*`
- ✅ Updated all imports to `@hunthub/shared`
- ✅ Fixed module resolution with `tsconfig-paths`
- ✅ Secured Firebase service account (gitignored, example created)
- ✅ Root configs with package inheritance established
- ✅ Backend compiles cleanly with new structure

**See:** `.claude/project-state.md` for full structure diagram

---

### 2. ~~Comprehensive Roadmap Created~~ ✅ **COMPLETE** (2025-10-27)

**Completed:**
- ✅ Created `ROADMAP.md` with 14-week MVP timeline
- ✅ 13 Epics broken into 70+ stories
- ✅ NOW/NEXT/LATER prioritization
- ✅ Fixed dependency order: Tree VIEW after CRUD, Assets before Player
- ✅ Story-level and epic-level dependency diagrams
- ✅ No circular dependencies, clear implementation path

**See:** `.claude/ROADMAP.md` for complete timeline

---

### 3. Complete Hunt CRUD + Step CRUD (Current Priority)

**CORRECTED: Tree VIEW moved to NEXT phase**
- Tree VIEW needs complete Step CRUD to be useful
- Can't visualize steps that don't exist yet
- Need solid CRUD foundation first

**NOW Sprint (Week 1 - 6.5 days):**
- [ ] Update hunt (PUT /api/hunts/:id) - 1 day
- [ ] Delete hunt (DELETE /api/hunts/:id) - 1 day
- [ ] Create step (POST /api/hunts/:id/steps) - 2 days
- [ ] Update step (PUT /api/steps/:id) - 1.5 days
- [ ] Delete step (DELETE /api/steps/:id) - 1 day

**Why this is priority:**
- Solid CRUD foundation needed before anything else
- Tree VIEW makes sense only after we can create/edit steps
- Tests need actual step data to validate endpoints
- Foundation for future branching

---

### 4. Apply SOLID Improvements (As You Build)

**Key pattern to add: Challenge Type Strategy**

See `.claude/solid-principles.md` for examples.

**When adding challenge validation:**
```typescript
// Don't do big if/else
// Use strategy pattern instead

interface IChallengeValidator {
  validate(challenge: Challenge): boolean;
}

class ClueValidator implements IChallengeValidator {...}
class QuizValidator implements IChallengeValidator {...}
// etc.
```

**MongoDB patterns:**

See `.claude/mongodb-vs-postgres.md` section "MongoDB Best Practices"

---

## 📚 Key Documents to Reference

**When planning work:**
- `ROADMAP.md` - 14-week timeline, all epics and stories (NEW ✨)
- `project-state.md` - Current focus and immediate next steps
- `backend/current-state.md` - What's implemented vs pending

**When building features:**
- `application-overview.md` - What features to build
- `tree-and-branching-strategy.md` - Tree VIEW + future branching
- `backend/patterns.md` - Code conventions with examples
- `backend/architecture.md` - Tech stack and data flow
- `publishing-workflow.md` - Publishing system design

**When making decisions:**
- `reference/decisions-needed.md` - Historical decision log
- `reference/design-concerns.md` - Issues flagged in Feb 2025

**When stuck on patterns:**
- `decisions/solid-principles.md` - How to make extensible code
- `decisions/mongodb-vs-postgres.md` - MongoDB patterns
- `decisions/production-best-practices-type-sharing.md` - Why monorepo

---

## 🤖 What I'll Know Next Session

**I auto-load ALL of this:**
- Your behavior principles (senior engineer, challenge me)
- Complete HuntHub requirements
- All architectural decisions
- **14-week roadmap with 70+ stories** (NEW ✨)
- **Corrected dependencies: CRUD first, then Tree VIEW** (NEW ✨)
- MongoDB choice and reasoning
- Monorepo strategy
- Publishing workflow design
- Tree VIEW strategy + future branching plans
- SOLID principles
- Current backend state
- What's done vs pending

**You don't need to remind me of anything.** Just say what you want to work on.

---

## 💬 How to Start Next Session

**Good openers:**

✅ "Let's implement Hunt CRUD endpoints (Update/Delete)"
✅ "Let's build the Step CRUD endpoints"
✅ "Let's work on the NOW sprint from ROADMAP.md"
✅ "What should we work on next?"

**I'll suggest priorities based on:**
- ROADMAP.md NOW section (current sprint)
- What's blocking other work
- MVP critical path from dependency diagrams

---

## 🛠️ Before You Start Coding

**1. Check the roadmap:**
```bash
cat .claude/ROADMAP.md | grep -A 20 "NOW (This Week"
```
See what's in the current sprint (Week 1: Hunt CRUD + Step CRUD)

**2. Optional: Read these if you want refresh:**
- `ROADMAP.md` - See full 14-week timeline
- `reference/design-concerns.md` - Issues flagged in Feb 2025
- `decisions/solid-principles.md` - Extension patterns
- `publishing-workflow.md` - Complex versioning design

**3. Quick context check:**
- ✅ Monorepo complete (packages/shared + apps/backend/api)
- ✅ All major decisions made
- ✅ Roadmap created with dependency fixes
- 🎯 Current priority: Hunt CRUD + Step CRUD (NOW sprint)

---

## 🎯 Success Criteria for Next Session

**Minimum (if short session):**
- [ ] Hunt Update endpoint (PUT /api/hunts/:id)
- [ ] Hunt Delete endpoint (DELETE /api/hunts/:id)
- [ ] Tests passing

**Good (normal session):**
- [ ] Hunt CRUD complete (Update + Delete) ✓
- [ ] Step Create started or done (POST /api/hunts/:id/steps)
- [ ] Following SOLID patterns

**Great (long session):**
- [ ] Hunt CRUD complete ✓
- [ ] Step Create + Update + Delete endpoints done
- [ ] Good test coverage
- [ ] Week 1 NOW sprint complete

---

## ⚠️ Things to Remember

**Architecture principles:**
- Open for extension, closed for modification (SOLID-O)
- Use strategy pattern for challenge types
- Interface + implementation (DI with InversifyJS)
- Three-layer validation (UI, API, DB)

**MVP scope:**
- Draft → Publish (skip Review for now)
- One version per hunt (add multiple versions in V1.1)
- Separate steps (you had good reason - progress tracking)

**Don't gold-plate:**
- Get MVP working first
- Add complex versioning in phases
- Follow your own advice: "extension not modification"

---

## 🔥 Token Budget Note

**Recent sessions:**
- **2025-02-05:** ~123k tokens (Requirements definition)
- **2025-10-26:** ~80k tokens (Monorepo setup)
- **2025-10-27:** ~100k tokens (Roadmap creation + dependency fixes)

**Why planning sessions use more tokens:**
- Creating comprehensive documentation
- Researching production best practices
- Validating dependencies and fixing contradictions
- Making all critical decisions upfront

**Next sessions will use less:**
- Context already documented (auto-loads)
- Decisions made
- Roadmap complete
- Just implementing features from NOW sprint

**Typical implementation session:** ~20-40k tokens
**Planning sessions:** ~80-120k tokens (one-time cost)

**Worth it - you now have:**
- Complete 14-week roadmap
- All decisions made
- Production-grade architecture
- No circular dependencies
- Clear path to MVP

---

## 📝 Quick Commands

```bash
# See current sprint tasks
cat .claude/ROADMAP.md | grep -A 20 "NOW (This Week"

# See what's implemented
cat .claude/backend/current-state.md | grep "✅"

# See what's pending
cat .claude/backend/current-state.md | grep "❌"

# Check code patterns
cat .claude/backend/patterns.md

# Review all decisions
cat .claude/reference/decisions-needed.md | grep "DECIDED"

# Update context after work
# Just tell me: "Update backend state - completed [feature]"
# Or: "Mark ROADMAP stories complete: BE-1.4, BE-1.5"
```

---

**🎉 YOU'RE READY TO BUILD!**

**Next session: "Let's start the NOW sprint" → Begin with Hunt CRUD (Update + Delete) from ROADMAP.md.**

**Corrected priority: Hunt CRUD + Step CRUD FIRST, then Tree VIEW in NEXT phase.**

**All context auto-loads. You can take breaks. Nothing is forgotten.** 🚀
