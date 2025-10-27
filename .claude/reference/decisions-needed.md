# Decisions Needed

**Track all unresolved design decisions here. Mark with [DECIDED] when resolved.**

---

## 🔴 Critical Priority (Blocks Architecture)

### Decision 1: Database Choice

**Question:** Continue with MongoDB or switch to PostgreSQL?

**Context:** You mentioned hating MongoDB with TypeScript

**Options:**
- [x] a) Stick with MongoDB + Mongoose (current) ✅ **DECIDED**
- [ ] b) Switch to PostgreSQL + Prisma (best TS support)
- [ ] c) Switch to PostgreSQL + TypeORM
- [ ] d) MongoDB + Prisma

**Pros/Cons:**
| Option | Pros | Cons |
|--------|------|------|
| Mongo + Mongoose | Already started, flexible schema | Poor TS integration, manual typing |
| Postgres + Prisma | Excellent TS, type safety, migrations | Need to rewrite models, relational model |
| Postgres + TypeORM | Similar to Mongoose, decorators | Less TS magic than Prisma |
| Mongo + Prisma | Keep data, better TS | Prisma's Mongo support is limited |

**My recommendation:** If genuinely hate Mongo, switch to Postgres + Prisma NOW (before too much code)

**Impact:** HIGH - Affects all data models and queries

**Decision:** [DECIDED] **Option A - Keep MongoDB**

**Reasoning:**
- Already invested with working models
- Learning goal - wanted NoSQL experience
- Portfolio diversity - shows adaptability
- TypeScript pain is solvable with good patterns
- Fits data model well (flexible schema, embedded docs)
- No performance bottleneck for HuntHub scale
- Better to finish with Mongo, learn Prisma on next project

**Decided by:** User

**Date:** 2025-02-05

**See:** `.claude/mongodb-vs-postgres.md` for full analysis

---

### Decision 2: Versioning Complexity

**Question:** Keep complex versioning or simplify?

**Context:** Complex versioning conflicts with "simple and fast" goal

**Current design:**
- Draft → Review → Published
- Multiple published versions
- Version selection (which is "Live")
- Clone hunts + steps on publish
- Edit published version flow

**Options:**
- [x] a) Keep complex versioning (shows advanced skills) ✅ **DECIDED - with phasing**
- [ ] b) Simplify: One draft, one published, toggle live (much faster)
- [ ] c) Middle ground: Draft → Published, no Review status, no version history

**Tradeoffs:**
| Aspect | Complex | Simple |
|--------|---------|--------|
| Dev time | 3-4 weeks | 1 week |
| Code complexity | High | Low |
| Portfolio impact | "Impressive system" | "Clean execution" |
| Bug risk | Higher | Lower |
| Maintenance | Harder | Easier |

**My recommendation:** Option C (middle ground) - Skip Review and version history

**Impact:** HIGH - Affects major chunk of backend logic

**Decision:** [DECIDED] **Option A - Keep complex versioning with phased rollout**

**Reasoning:**
- Portfolio differentiation - shows advanced system design
- User is excited about it and sees the value
- Design is already well thought out
- Manageable with clear plan

**Phased Approach:**
1. **MVP:** Draft → Publish (one version, no Review state)
2. **V1.1:** Add multiple versions + Live selection
3. **V1.2:** Add Review state if collaboration features needed

**Architecture:** Built with OCP in mind - can add Review state later without breaking existing code

**Decided by:** User

**Date:** 2025-02-05

**See:** `.claude/publishing-workflow.md` for full design

---

## 🟡 High Priority (Affects Data Model)

### Decision 3: Steps - Embedded vs Separate

**Question:** Should steps be embedded in hunt document or separate collection?

**Context:** You asked "What if I keep Step inside of Hunt?"

**Options:**
- [x] a) Separate collection (current) ✅ **DECIDED**
- [ ] b) Embedded in hunt document

**Analysis:**

**Separate Collection:**
```javascript
Hunt { _id, name, stepOrder: [ref1, ref2] }
Step { _id, huntId, type, challenge }
```
- Pros: Can query steps independently, no doc size limit concerns
- Cons: N+1 queries, harder to clone, can have orphaned steps

**Embedded:**
```javascript
Hunt {
  _id, name,
  steps: [
    { type, challenge },
    { type, challenge }
  ]
}
```
- Pros: One query, atomic operations, simpler cloning, better performance
- Cons: 16MB doc limit (not a concern for your use case)

**Math check:**
- Max hunts: 20 per user
- Max steps: Let's say 30
- Step size: ~5KB
- Total: 150KB (well under 16MB)

**My recommendation:** EMBED - simpler and faster

**Impact:** MEDIUM - Affects data access patterns

**Decision:** [DECIDED] **Option A - Keep separate collection**

**Reasoning:**
- Progress tracking needs step references for user mid-hunt
- Supports versioning better (stable step IDs across versions)
- User had original reason for this choice (progress logic)
- Already implemented this way
- Production-grade approach

**Trade-off accepted:** Slightly more complex cloning, but better for progress tracking use case

**Decided by:** User

**Date:** 2025-02-05

---

### Decision 4: Progress Tracking Structure

**Question:** How to store user progress through hunts?

**Options:**
- [ ] a) Separate Progress collection (current schema)
- [ ] b) Embedded in User document
- [ ] c) Embedded in Hunt instance
- [ ] d) No persistence (session only)

**Considerations:**
- How much progress data? (could grow large)
- Need to query "all users playing this hunt"?
- Need to query "all hunts this user is playing"?
- Version locking (user plays v1, v2 goes live)?

**My recommendation:** Separate collection with versionId reference

**Impact:** MEDIUM - Affects player experience

**Decision:** [TO BE DECIDED]

**Decided by:** _____________________

**Date:** _____________________

---

## 🟢 Medium Priority (Affects Features)

### Decision 5: Schema Sharing (BE ↔ FE)

**Question:** How to share types and validation between backend and frontend?

**Options:**
- [x] a) Monorepo with shared package (best long-term) ✅ **DECIDED**
- [ ] b) Generate for FE from BE (scripted)
- [ ] c) Publish private npm package (overkill)
- [ ] d) Manual duplication (not recommended)

**My recommendation:** Start with B, migrate to A if project grows

**Impact:** MEDIUM - Affects dev workflow

**Decision:** [DECIDED] **Option A - Monorepo with shared package**

**Reasoning:**
- FE and BE are coupled and will stay coupled for HuntHub
- Want to avoid manual sync errors
- Pattern must support decoupled projects in future (can switch to generation/npm later)
- Monorepo → separate repos migration is easy
- Automatic sync via git hooks
- Core schemas shared (80%), extend per-side as needed (20%)
- Setup time: ~4-5 hours, saves many hours later

**Structure:**
```
packages/
├── shared/     # Types, validation, constants
├── backend/    # Imports from shared
└── frontend/   # Imports from shared
```

**Decided by:** User

**Date:** 2025-02-05

**See:** `.claude/schema-sharing-final-strategy.md` for complete strategy

---

### Decision 6: "Active Hunts" Definition (Free Tier)

**Question:** What counts as an "active" hunt for the 2-hunt free tier limit?

**Options:**
- [x] a) Published hunts only (drafts don't count) ✅ **DECIDED**
- [ ] b) Total hunts (draft + published)
- [ ] c) "Live" hunts only
- [ ] d) Hunts created in last 30 days

**Edge cases to consider:**
- User has 2 published hunts, wants 3rd draft? → Allowed
- User has 2 drafts, 0 published? → Allowed (drafts don't count)
- User has 5 old hunts (never published)? → Allowed if not published

**My recommendation:** Option A - Published hunts only (most generous)

**Impact:** LOW - Affects monetization

**Decision:** [DECIDED] **Option A - Published hunts only**

**Reasoning:**
- "Active hunt" = distinct hunt entity (Barcelona, Paris, Amsterdam)
- Each hunt can have multiple versions
- Only published hunts count toward limit
- Drafts don't count (allows free experimentation)
- Generous for free tier users
- Clear rule: `count(Hunts where status == 'published') <= 2`

**Implementation:**
```typescript
// Free tier check
const publishedCount = await Hunt.count({
  creatorId: userId,
  status: 'published'
});
if (publishedCount >= 2 && !user.isPremium) {
  throw new PaymentRequiredError('Upgrade to create more hunts');
}
```

**Decided by:** User

**Date:** 2025-02-05

---

### Decision 7: Progress Across Versions

**Question:** What happens to player progress when hunt version changes?

**Scenario:**
1. User starts playing Hunt v1 (5 steps)
2. Creator publishes v2 and sets it live
3. User comes back to continue

**Options:**
- [ ] a) Lock to version - user continues on v1
- [ ] b) Switch to v2 - progress might not match
- [ ] c) Prompt user - "New version available, restart?"
- [ ] d) Allow user to finish v1, then offer v2

**My recommendation:** Option A - Lock to version (store versionId in Progress)

**Impact:** MEDIUM - Affects player experience

**Decision:** [TO BE DECIDED]

**Decided by:** _____________________

**Date:** _____________________

---

## 🔵 Low Priority (Nice to Define)

### Decision 8: Review Status - Keep or Remove?

**Question:** Is the "Review" status needed?

**Current:** Draft → Review → Published

**Simpler:** Draft → Published

**Review is useful for:**
- Team collaboration (not in scope)
- Approval workflow (not in scope)
- Final checks (user can just check before publishing)

**My recommendation:** Remove - YAGNI (You Ain't Gonna Need It)

**Impact:** LOW - Small simplification

**Decision:** [DECIDED] **Skip for MVP, architecture supports adding later**

**Reasoning:**
- Not needed for solo developer
- Not needed for MVP
- Can be added later without breaking changes (just add to enum)
- YAGNI principle applies
- Architecture built with OCP - can extend when collaboration features added

**Implementation:**
- MVP: Draft → Published (two states only)
- Future: Add Review state when multiple users/approval workflow needed
- Enum design allows adding state without migration

**Decided by:** User

**Date:** 2025-02-05

**Note:** Architecture designed for extension (SOLID-O principle)

---

### Decision 9: QR Code Behavior

**Question:** What does the QR code link to?

**Options:**
- [ ] a) huntId → always plays current "Live" version
- [ ] b) versionId → always plays specific version
- [ ] c) huntId with version selector

**Consideration:** User prints QR codes, then updates hunt version

**My recommendation:** Option A - huntId, plays live version

**Impact:** LOW - QR codes always point to latest

**Decision:** [TO BE DECIDED]

**Decided by:** _____________________

**Date:** _____________________

---

### Decision 10: Styling Approach

**Question:** MUI + styled-components or just MUI?

**Context:** MUI uses Emotion, mixing with styled-components adds bundle size

**Options:**
- [ ] a) MUI with Emotion (sx prop) - MUI's default
- [ ] b) MUI with styled-components (need adapter)
- [ ] c) Just styled-components (no MUI)

**My recommendation:** Option A - Use MUI's styling (emotion + sx)

**Impact:** LOW - Affects frontend bundle size

**Decision:** [TO BE DECIDED]

**Decided by:** _____________________

**Date:** _____________________

---

## 📊 Decision-Making Framework

**When deciding, consider:**

1. **Portfolio goal:** What impression does this give?
2. **Timeline:** How much time does this add?
3. **Complexity:** Does this make code harder to maintain?
4. **Learning:** Does this teach you something valuable?
5. **Realistic:** Would a real product do this?

**Decision Priority:**
- 🔴 Critical: Blocks other work, decide ASAP
- 🟡 High: Affects architecture, decide before building
- 🟢 Medium: Affects features, decide before implementing that feature
- 🔵 Low: Can decide later or even leave as-is

---

## 📝 Template for New Decisions

```markdown
### Decision N: [Title]

**Question:** [What needs to be decided?]

**Context:** [Why is this decision needed?]

**Options:**
- [ ] a) [Option with brief description]
- [ ] b) [Option with brief description]
- [ ] c) [Option with brief description]

**My recommendation:** [What I think and why]

**Impact:** [HIGH/MEDIUM/LOW] - [What this affects]

**Decision:** [TO BE DECIDED] or [DECIDED: Option X because...]

**Decided by:** _____________________

**Date:** _____________________
```

---

## 🎯 Next Steps

Once critical decisions are made:
1. Update architecture docs
2. Update data model diagrams
3. Create implementation plan
4. Start coding with clear direction

**Don't start coding until critical decisions (1-2) are resolved!**
