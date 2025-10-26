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

### 1. ~~Set Up Monorepo~~ ✅ **COMPLETE** (2025-10-26)

**Completed:**
- ✅ Created npm workspaces monorepo structure
- ✅ Set up `packages/shared/` with OpenAPI → TypeScript generation
- ✅ Moved backend to `packages/backend/`
- ✅ Updated all imports to `@hunthub/shared`
- ✅ Fixed module resolution with `tsconfig-paths`
- ✅ Secured Firebase service account (gitignored, example created)
- ✅ Root configs with package inheritance established

**See:** `.claude/monorepo-lessons-learned.md` for detailed insights

---

### 2. Fix MongoDB Connection & Complete Backend MVP

**Priority order:**

**Phase 1: Hunt CRUD**
- [ ] Update hunt (PUT /api/hunts/:id)
- [ ] Delete hunt (DELETE /api/hunts/:id)
- [ ] List user's hunts (already have this)

**Phase 2: Step Management**
- [ ] Add step to hunt (POST /api/hunts/:id/steps)
- [ ] Update step (PUT /api/steps/:id)
- [ ] Delete step (DELETE /api/steps/:id)
- [ ] Reorder steps (PUT /api/hunts/:id/step-order)

**Phase 3: Publishing (MVP Version)**
- [ ] Publish hunt (POST /api/hunts/:id/publish)
  - Clones hunt + steps
  - Creates PublishedHunt record
  - Creates LiveHunt record (mark as live)
- [ ] Get live version (GET /api/hunts/:id/live)

**Phase 4: Hunt Player**
- [ ] Get live hunt for playing (GET /api/play/:huntId)
- [ ] Submit step completion (POST /api/play/:huntId/steps/:stepId/complete)
- [ ] Get user progress (GET /api/play/:huntId/progress)

**See:** `.claude/backend/current-state.md` for full tracking

---

### 3. Apply SOLID Improvements (As You Build)

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

**When building features:**
- `application-overview.md` - What features to build
- `backend/patterns.md` - Code conventions
- `backend/architecture.md` - How things fit together
- `publishing-workflow.md` - Publishing system design

**When making decisions:**
- `decisions-needed.md` - All decisions (most are done!)
- `design-concerns.md` - Issues I flagged

**When stuck:**
- `solid-principles.md` - How to make extensible code
- `mongodb-vs-postgres.md` - MongoDB patterns
- `production-best-practices-type-sharing.md` - Why monorepo

---

## 🤖 What I'll Know Next Session

**I auto-load ALL of this:**
- Your behavior principles (senior engineer, challenge me)
- Complete HuntHub requirements
- All architectural decisions
- MongoDB choice and reasoning
- Monorepo strategy
- Publishing workflow design
- SOLID principles
- Current backend state
- What's done vs pending

**You don't need to remind me of anything.** Just say what you want to work on.

---

## 💬 How to Start Next Session

**Good openers:**

✅ "Let's set up the monorepo structure"
✅ "Let's build the Step CRUD endpoints"
✅ "Let's implement the publishing workflow"
✅ "What should we work on next?"

**I'll suggest priorities based on:**
- What's blocking other work
- MVP critical path
- Logical implementation order

---

## 🛠️ Before You Start Coding

**1. Git commit current state:**
```bash
git add .claude/
git commit -m "docs: complete requirements and architecture decisions

- Decided on MongoDB + monorepo approach
- Defined publishing workflow
- Documented SOLID principles
- All critical decisions made
- Ready for implementation"
```

**2. Optional: Read these if you want refresh:**
- `design-concerns.md` - Issues I spotted
- `solid-principles.md` - Extension patterns
- `publishing-workflow.md` - Your complex versioning design

**3. Confirm monorepo setup is priority:**
- This unblocks type sharing
- Should be done before building more features
- ~4-5 hours of work

---

## 🎯 Success Criteria for Next Session

**Minimum (if short session):**
- [ ] Monorepo structure set up
- [ ] Shared package with types working
- [ ] Backend imports @hunthub/shared

**Good (normal session):**
- [ ] Monorepo done ✓
- [ ] One more feature (Hunt update/delete OR Step CRUD)
- [ ] Following SOLID patterns

**Great (long session):**
- [ ] Monorepo done ✓
- [ ] Hunt CRUD complete
- [ ] Step CRUD started or done
- [ ] Good test coverage

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

**This session used ~123k tokens.**

**Why so many:**
- Defined entire requirements from scratch
- Created 13+ documentation files
- Researched production best practices
- Made all critical decisions

**Next sessions will use WAY less:**
- Context already documented
- Decisions made
- Just implementing features

**Typical session:** ~20-40k tokens
**This session:** Planning/architecture heavy (one-time cost)

**It was worth it - you now have:**
- Complete picture
- All decisions made
- Production-grade architecture
- Never forget context again

---

## 📝 Quick Commands

```bash
# See what to work on
cat .claude/backend/current-state.md | grep "❌"

# Review decisions
cat .claude/decisions-needed.md | grep "DECIDED"

# Check patterns
cat .claude/backend/patterns.md

# Update context after work
# Just tell me: "Update backend state - completed [feature]"
```

---

**🎉 YOU'RE READY TO BUILD!**

**Next session: "Let's set up the monorepo" → I'll guide you through it step by step.**

**All context auto-loads. You can take breaks. Nothing is forgotten.** 🚀
