# 🚀 START HERE - Next Session Quick Guide

**Last updated:** 2025-10-28

**When you open Claude Code next time, I'll auto-load all context.**

---

## 🎉 Week 1 Complete! (2025-10-28)

You just finished the NOW sprint with **100% completion**:

**Completed:**
- ✅ Hunt CRUD (6/6 endpoints) - Create, Read, List, Update, Delete, Reorder
- ✅ Step CRUD (3/3 endpoints) - Create, Update, Delete
- ✅ OpenAPI schema fixes (type/challengeType inconsistencies resolved)
- ✅ Production patterns established and documented
- ✅ Reorder Steps endpoint (bonus - from Week 2 plan)

**Key decisions documented:**
- See `.claude/backend/hunt-step-implementation-decisions.md`
- Why separate Step collection
- Why stepOrder array (no order field)
- Why nested RESTful routes
- Why clean DTO separation
- Reusable authorization patterns

---

## ⚠️ CRITICAL NEXT: Numeric ID Migration (2-3 hours)

**THE ISSUE:**
Currently exposing MongoDB ObjectIds in API responses - **security and architecture problem**

**Example of the problem:**
```json
{
  "id": "507f1f77bcf86cd799439011",  // ❌ MongoDB ObjectId (bad!)
  "huntId": "507f191e810c19729de860ea" // ❌ Reveals DB implementation
}
```

**THE SOLUTION:**
Dual ID system with **sequential numeric IDs**:
- **Internal ID**: MongoDB ObjectId (`_id`) - database only, never exposed
- **External ID**: Numeric sequential ID - API layer, human-readable

```json
{
  "huntId": 1332,      // ✅ Human-readable number!
  "stepId": 13344      // ✅ Easy to remember and share
}
```

**WHY NUMERIC IDs:**
1. **Human-readable**: "Check hunt 1332" vs "Check hunt 550e8400-e29b..."
2. **Short URLs**: `/api/hunts/1332` (perfect for QR codes!)
3. **Easy to share**: Can verbally communicate IDs
4. **Production standard**: GitHub (#1332), Twitter, Stripe all use sequential IDs
5. **Authorization-based security**: Enumeration is safe with proper auth (we have this)

**WHY THIS IS CRITICAL:**
1. **Security**: ObjectIds contain timestamps → reveals creation order/timing
2. **Implementation leakage**: Tells the world you're using MongoDB
3. **Migration difficulty**: Tied to MongoDB format forever
4. **Predictability**: ObjectIds are somewhat sequential
5. **Production best practice**: External IDs should be opaque

**SCOPE OF CHANGES:**
- 7 Models: Hunt, Step, User, Asset, Progress, PublishedHunt, LiveHunt
- Counter Model: New model for auto-incrementing sequential IDs
- 7 Mappers: Return numeric IDs, update foreign keys
- All Services: Query by numeric ID instead of ObjectId
- All Foreign Keys: Change from ObjectId to number (`huntId: 1332`)
- Pre-save hooks: Auto-generate numeric IDs on document creation
- OpenAPI schema: Update to `type: integer`

**TIME ESTIMATE:** 2-3 hours

**VALIDATION:** ✅ Validated against production standards and MongoDB best practices

**SEE COMPLETE PLAN:** `.claude/backend/NUMERIC-ID-MIGRATION-PLAN.md`
- Production standards validation (GitHub, Twitter, Stripe patterns)
- MongoDB/Mongoose best practices checklist
- Complete implementation guide with code examples
- Migration strategy for existing data
- Security analysis (enumeration attacks, authorization)
- Testing strategy
- Rollback plan

---

## 📋 What's Next After UUID Migration

### Week 2: Tree VIEW + Challenge Validation
- GET /api/hunts/:id/tree (compact step list, lazy loading)
- GET /api/steps/:id (full details)
- Add stepCount to hunt list
- Database indexes
- Challenge type validation (Strategy pattern)

### Week 3: Asset Management (CRITICAL)
- File upload (multer + Firebase Storage or S3)
- Attach assets to steps
- **Must be done before Publishing** (missions need file uploads)

### Week 4-5: Publishing Workflow
- Publish hunt (clone hunt + steps)
- PublishedHunt + LiveHunt records
- Version management

### Week 5-6: Player API
- Get live hunt
- Submit completions
- Track progress

**See:** `.claude/ROADMAP.md` for full 14-week timeline

---

## ✅ Major Decisions Made (2025-02-05)

- ✅ MongoDB (with production best practices)
- ✅ Monorepo with shared types (production standard)
- ✅ OpenAPI as source of truth
- ✅ Separate steps collection (better for progress tracking)
- ✅ Skip Review state for MVP (add later with OCP)
- ✅ Simplified publishing workflow (MVP)

**All decisions:** See `.claude/reference/decisions-needed.md`

---

## 🏗️ Infrastructure Complete

### 1. Monorepo Setup ✅ (2025-10-26/27)
- npm workspaces with nested structure
- `packages/shared/` - Types, validation, constants
- `apps/backend/api/` - Express API
- OpenAPI → TypeScript → Zod generation
- All imports use `@hunthub/shared`

### 2. Roadmap Complete ✅ (2025-10-27)
- 14-week MVP timeline
- 13 Epics, 70+ stories
- NOW/NEXT/LATER prioritization
- Dependency validation

### 3. Week 1 Sprint Complete ✅ (2025-10-28)
- Hunt + Step CRUD (9/9 endpoints)
- RESTful nested routes
- Production patterns (mappers, DI, authorization)
- OpenAPI schema fixed

---

## 🤖 What I'll Know Next Session

**I auto-load ALL of this:**
- Your behavior principles (senior engineer, challenge me)
- Complete HuntHub requirements
- All architectural decisions
- 14-week roadmap
- MongoDB best practices
- Monorepo strategy
- Publishing workflow design
- **Week 1 completion status**
- **UUID migration urgency**
- Production patterns and reasoning

**You don't need to remind me of anything.** Just say what you want to work on.

---

## 💬 How to Start Next Session

**Recommended:**
✅ "Let's implement the UUID migration"
✅ "Create the UUID migration plan"
✅ "Start with UUID migration - begin with Hunt model"

**You can also:**
- Ask me to summarize Week 1 achievements
- Ask about the UUID migration scope
- Ask what's after UUID migration
- Jump straight to implementation

---

## 🛠️ Quick Context Check

**If you want a refresh before starting:**

```bash
# See Week 1 decisions and reasoning
cat .claude/backend/hunt-step-implementation-decisions.md

# See current backend state
cat .claude/backend/current-state.md | head -100

# See full roadmap
cat .claude/ROADMAP.md | grep -A 20 "NOW (CRITICAL"

# See completed endpoints
cat .claude/backend/current-state.md | grep "Implemented (Week 1"
```

---

## 🎯 Success Criteria

**For Numeric ID Migration Session:**

**Minimum:**
- [x] Migration plan created and validated ✅
- [ ] Counter model created
- [ ] Hunt model updated (add huntId: number field, unique index, pre-save hook)
- [ ] HuntMapper updated (return numeric huntId)
- [ ] HuntService queries by huntId

**Good:**
- [ ] All 7 models updated (Hunt, Step, User, Asset, Progress, PublishedHunt, LiveHunt)
- [ ] All 7 mappers updated (return numeric IDs)
- [ ] All services query by numeric ID
- [ ] OpenAPI schema updated (`type: integer`)
- [ ] TypeScript types regenerated
- [ ] Tests passing

**Great:**
- [ ] Complete numeric ID migration
- [ ] All endpoints tested and working with numeric IDs
- [ ] Routes work: `/api/hunts/1332/steps/13344`
- [ ] Foreign keys updated (stepOrder: number[], creatorId: number)
- [ ] Migration script written (for existing data)
- [ ] Documentation updated
- [ ] Ready for Week 2

---

## ⚠️ Remember

**Numeric ID Migration is CRITICAL because:**
1. **Security issue**: Exposing MongoDB ObjectIds (contain timestamps, predictable)
2. **Architecture best practice**: Separate internal DB IDs from external API IDs
3. **Blocks production deployment**: Can't ship with exposed ObjectIds
4. **Better now than later**: Easier to fix before building more features
5. **Portfolio quality**: Shows production-grade patterns (GitHub, Twitter, Stripe do this)

**Numeric IDs are production standard:**
- ✅ GitHub uses issue numbers: `#1332`
- ✅ Twitter uses numeric tweet IDs
- ✅ Stripe uses sequential customer IDs
- ✅ Human-readable, perfect for QR codes
- ✅ Safe with proper authorization (we have this)

**This is a portfolio project - show production-quality patterns from day one!**

---

**🔥 NEXT TASK: Numeric ID Migration - Implementation Ready!**

**Quick Start:**
1. Read `.claude/backend/NUMERIC-ID-MIGRATION-PLAN.md` (complete validated plan)
2. Create Counter model (15 min)
3. Update Hunt model as template (20 min)
4. Apply pattern to remaining models (1 hour)
5. Test everything (30 min)

**Complete plan with code examples, security analysis, and MongoDB best practices validation.**
