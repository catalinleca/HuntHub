# Design Concerns & Contradictions

**This document flags potential issues, contradictions, and design decisions that need discussion.**

## 🚩 Critical Concerns

### 1. MongoDB with TypeScript - Your Own Concern

**You said:** "I hate the integration with typescript"

**Problem:** Mongoose + TypeScript can be painful:
- Type mismatches between schema and interface
- ObjectId vs string confusion
- Loose typing in queries
- `.toJSON()` casting needed

**Options:**
- a) Stick with Mongo, accept the pain (current)
- b) Switch to PostgreSQL + Prisma (better TS support, but major change)
- c) Switch to PostgreSQL + TypeORM (similar to Mongoose)
- d) Use MongoDB with Prisma (best of both worlds?)

**My recommendation:** If you genuinely hate it, switch now (before too much code). Prisma has excellent TypeScript support.

**Decision needed:** [URGENT] Do we continue with Mongo or switch?

---

### 2. Publishing Complexity - Is It Worth It?

**Current design:** Complex versioning with Draft/Review/Published/Live

**For a portfolio project meant to be "simple and not take long":**

**This is VERY complex:**
- 4 collections (Hunt, Step, PublishedHunt, LiveHunt)
- Cloning logic on every publish
- Version management
- State machine transitions
- "Edit published version" warning flow

**Simpler alternative:**
```
- One draft per hunt
- Publish = copy draft to "published" field
- No versions, no cloning
- Just draft vs published toggle
```

**Question:** Do you NEED versioning for a portfolio piece?

**Pros of versioning:**
- Shows complex system design skills
- More realistic/production-like
- Cool feature to demo

**Cons of versioning:**
- Significantly more code
- More testing needed
- Longer development time
- Higher chance of bugs

**My take:** This contradicts "speed and quality" goal. Either simplify the versioning or accept longer timeline.

**Decision needed:** [HIGH PRIORITY] Simplify versioning or keep complex system?

---

### 3. Steps: Embedded vs Separate - Performance Impact

**You asked:** "What if I keep Step inside of Hunt?"

**Current:** Separate collection

**Embedded alternative:**
```javascript
{
  _id: "hunt-123",
  name: "Barcelona Hunt",
  steps: [
    { type: "clue", challenge: {...} },
    { type: "quiz", challenge: {...} }
  ]
}
```

**Pros of embedded:**
- ✅ Simpler queries (one read, not N+1)
- ✅ Atomic updates
- ✅ Easier to clone on publish
- ✅ No orphaned steps
- ✅ Better performance (fewer DB calls)

**Cons of embedded:**
- ❌ Document size limit (16MB in Mongo)
- ❌ Hard to query individual steps
- ❌ Can't reference steps from other collections

**For HuntHub:**
- You said "max 20 hunts" per user
- Reasonable step count (let's say max 30 steps)
- Each step is small (few KB)

**Math:** 30 steps × 5KB each = 150KB per hunt (well under 16MB limit)

**My recommendation:** EMBED STEPS in Hunt document

**Why:**
1. Simpler code
2. Better performance
3. Atomic cloning (copy entire document)
4. No size concerns for your use case
5. Aligns with "simple and fast" goal

**Decision needed:** [MEDIUM PRIORITY] Embed or separate?

---

### 4. Review Status - Unnecessary Complexity?

**Current:** Draft → Review → Published

**You also said:** "Let's not define everything right now"

**Question:** Do you actually need the Review status?

**Simpler:** Draft → Published (one button)

**When is Review useful:**
- Team collaboration (not in scope)
- Approval workflow (not in scope)
- Final checks... (user can just check before clicking publish)

**My take:** YAGNI (You Ain't Gonna Need It). Remove Review status.

**Decision needed:** [LOW PRIORITY] Keep or remove Review status?

---

## ⚠️ Moderate Concerns

### 5. Free Tier Limit: "2 Active Hunts"

**Question:** What does "active" mean?

**Options:**
- a) Published hunts (draft doesn't count)
- b) Total hunts (draft + published)
- c) "Live" hunts only

**Edge cases:**
- User has 2 published hunts, creates 3rd draft → allowed or blocked?
- User has 2 published hunts, wants to create 3rd → pay first or create draft first?

**Decision needed:** Define "active" precisely

---

### 6. Progress Tracking Across Versions

**Scenario:**
1. User starts playing Hunt v1
2. Hunt creator sets v2 as Live
3. User comes back to continue playing

**Questions:**
- Does user continue on v1 or switch to v2?
- Is progress lost?
- Should we lock users to the version they started?

**Options:**
- a) Lock to version (store versionId in progress)
- b) Always use live version (progress might not match)
- c) Prompt user to restart on new version

**Decision needed:** [MEDIUM] How to handle version changes mid-play?

---

### 7. QR Code Points to What?

**Question:** What does the QR code encode?

**Options:**
- a) huntId → Always plays live version
- b) versionId → Always plays specific version
- c) huntId + option to select version

**Recommendation:** QR code → huntId → always plays current "Live" version

**Edge case:** User prints QR codes, distributes them, then changes live version
- Do old QR codes play old version or new version?

**Decision needed:** [LOW] QR code behavior

---

## 📝 Minor Concerns

### 8. Material-UI + Styled Components - Mixing Styling

**You said:** React + MUI + styled-components

**Potential issue:** MUI has its own styling solution (emotion), mixing with styled-components can cause:
- Bundle size increase
- Two CSS-in-JS runtimes
- Style conflicts

**Options:**
- a) MUI with emotion (MUI's default)
- b) MUI with styled-components (need adapter)
- c) Just styled-components (no MUI)

**Recommendation:** Use MUI's built-in styling (emotion + sx prop), drop styled-components

**Decision needed:** [LOW] Styling approach

---

### 9. Domain + Theming - Scope Creep?

**You mentioned:** Custom domains and theming for NGOs

**This is a MAJOR feature:**
- Multi-tenancy architecture
- Domain routing
- Theme customization UI
- Separate themes per organization
- Potentially separate databases

**For a portfolio piece:**
- This could double your development time
- Adds significant complexity

**Recommendation:** Mark as "Future" and show it as a roadmap item, don't implement for MVP

**Decision needed:** [LOW] Keep as future feature only?

---

## 🎯 Contradictions Found

### Contradiction 1: "Simple and Fast" vs "Complex Versioning"

**You said:**
- "I want it to be simple and not take long"
- "Speed and quality is the key"

**But also:**
- Complex publishing workflow
- Multiple versions
- Draft/Review/Published states
- Clone operations

**These don't align.** Complex versioning ≠ simple and fast.

**Resolution options:**
- a) Simplify versioning significantly
- b) Accept longer timeline
- c) Prioritize one aspect over another

---

### Contradiction 2: "Portfolio Piece" vs "Production Features"

**You said:** "Showcase for portfolio"

**But designing for:**
- Multi-tenancy (custom domains)
- Payment integration
- Complex version control

**Portfolio pieces typically show:**
- Clean code
- Good architecture
- Working end-to-end
- One or two impressive features

**Not necessarily:**
- Production-scale complexity
- Every possible feature

**My take:** Focus on 2-3 impressive features executed well, rather than 10 features half-done.

---

## 🤔 Questions for You

**To help me guide you better:**

1. **Timeline:** How long do you want to spend on this? (1 month? 3 months? 6 months?)

2. **Portfolio goal:** What are you trying to showcase?
   - Full-stack skills?
   - Complex system design?
   - Clean code?
   - Specific technologies?

3. **Versioning:** Do you genuinely care about version control, or is it feature bloat?

4. **MongoDB:** How much do you hate it? Switch now or power through?

5. **Priority:** Would you rather have:
   - a) Simple MVP working end-to-end in 1 month
   - b) Complex, production-like system in 3 months

---

## ✅ Things I Think You're Doing Right

**Don't change these:**

1. ✅ **OpenAPI-first approach** - Smart for type safety
2. ✅ **Three-layer validation** - Professional and correct
3. ✅ **InversifyJS DI** - Shows advanced architecture knowledge
4. ✅ **Firebase Auth** - Fast to implement, production-ready
5. ✅ **Separating editor and player** - Clear separation of concerns
6. ✅ **Planning before coding** - What we're doing now!

---

## 🎯 My Recommendations Summary

**High Priority Changes:**
1. **Decide on MongoDB** - Switch now if you hate it
2. **Simplify versioning** - One draft, one published, that's it
3. **Embed steps** - Simpler and faster
4. **Remove Review status** - Unnecessary complexity

**Medium Priority:**
1. Define "active hunts" for free tier
2. Decide on progress tracking across versions
3. Clarify QR code behavior

**Low Priority:**
1. Styling approach (MUI emotion vs styled-components)
2. Keep custom domains as "future feature" only
3. Simplify some edge cases

**If you do these, you'll have:**
- Simpler codebase
- Faster development
- Still impressive for portfolio
- Easier to maintain
- Better chance of actually finishing

**Your call though!** I'm here to build whatever you decide. Just wanted to flag these concerns.
