# HuntHub Development Roadmap

**Last updated:** 2025-11-06 (Publishing & Release Workflow COMPLETE!)

**Product vision:** Portfolio-quality treasure hunt platform with location-based challenges, built production-ready in 2 months.

**Timeline:** MVP → V1.1 → V1.2 (phased delivery)

**🎉 Major Achievements:**

**Week 1 (2025-10-28):**
- ✅ Hunt CRUD Complete (6/6 endpoints)
- ✅ Step CRUD Complete (3/3 endpoints)
- ✅ Reorder Steps (bonus from Week 2)
- ✅ OpenAPI schema fixes
- ✅ Production patterns documented

**Week 2-3 (2025-11-03):**
- ✅ Asset Management Complete (5/5 endpoints)
- ✅ AWS S3 integration with presigned URLs
- ✅ 26/26 asset tests passing

**Week 3-4 (2025-11-04):**
- ✅ **Hunt Versioning System Complete!**
- ✅ Hunt (master) + HuntVersion (content) architecture
- ✅ Atomic transactions (MongoDB replica set)
- ✅ Data integrity fixes (cascade delete, validation)
- ✅ All 69 tests passing

**Week 4-5 (2025-11-05):**
- ✅ **Publishing Workflow Complete!**
- ✅ Publishing API fully implemented (POST /api/hunts/:id/publish)
- ✅ Hunt DTO updated with version metadata
- ✅ Optimistic locking for concurrent edits
- ✅ Transaction safety throughout
- ✅ Helper modules with clean separation of concerns

**Week 5 (2025-11-06):**
- ✅ **Release Workflow Complete!**
- ✅ Release API fully implemented (PUT /release, DELETE /release)
- ✅ Release Manager helper with optimistic locking
- ✅ Race condition prevention (4 scenarios handled)
- ✅ Delete protection (cannot delete live hunts)
- ✅ Hunt DTO enhanced (isLive, releasedAt, releasedBy)
- ✅ Complete workflow: Draft → Publish → Release → Players

**📍 NEXT: Player API**
- Start hunt session endpoints
- Challenge validation by type
- Progress tracking
- Time: 1-2 weeks

---

## 📊 Progress Overview

**Current Phase:** Player API Implementation
**Previous Sprint:** ✅ Publishing Workflow Complete - Full publishing system with optimistic locking
**Overall Progress:** ~50% to MVP completion

**Key Metrics:**
- Backend Epics: 4/6 complete (67%)
  - ✅ Epic 1: Hunt Management (100%)
  - ✅ Epic 3: Step Management (100%)
  - ✅ Epic 4: Publishing Workflow (100%) ⭐ **NEW!**
  - ✅ Epic 6: Asset Management (100%)
- Frontend Epics: 0/4 started (0%)
- Integration Epics: 0/2 started (0%)

**Completed Work:**
- ✅ Week 1: Hunt CRUD + Step CRUD (COMPLETE)
- ✅ Week 2-3: Asset Management (COMPLETE)
- ✅ Week 3-4: Versioning System (COMPLETE)
- ✅ Week 4-5: Publishing Workflow (COMPLETE)
- ✅ Week 5: Release Workflow (COMPLETE) ⭐ **NEW!**
- 📍 Week 5-6: Player API (NEXT)

---

## 🎯 Roadmap Structure

**Hierarchy:**
- **Theme** - Major focus area (Backend, Frontend, Integrations)
- **Epic** - Large feature requiring multiple weeks
- **Story** - Specific feature (1-5 days)
- **Tasks** - Implementation details (see backend/current-state.md)

**Phases:**
- **NOW** - Current sprint (this week)
- **NEXT** - Upcoming (2-4 weeks)
- **LATER** - Future enhancements (V1.1+)

---

# 🔵 BACKEND THEME

## Epic 1: Hunt Management ✅ (Complete - 100%)

**Goal:** Complete CRUD operations for hunts
**Timeline:** Week 1
**Status:** 6/6 stories complete
**Completed:** 2025-10-28

### Stories

- [x] **BE-1.1:** Create hunt (POST /api/hunts)
  - ✅ Service layer implemented
  - ✅ Controller and routes
  - ✅ Validation with Zod
  - ✅ Tests passing

- [x] **BE-1.2:** Get hunt by ID (GET /api/hunts/:id)
  - ✅ Authorization checks
  - ✅ Error handling
  - ✅ Tests passing

- [x] **BE-1.3:** List user's hunts (GET /api/hunts)
  - ✅ Filtering by creator
  - ✅ Tests passing

- [x] **BE-1.4:** Update hunt (PUT /api/hunts/:id)
  - ✅ Metadata-only updates
  - ✅ Validation
  - ✅ Authorization (only creator)
  - ✅ Complete

- [x] **BE-1.5:** Delete hunt (DELETE /api/hunts/:id)
  - ✅ Hard delete with cascade
  - ✅ Deletes all steps
  - ✅ Authorization
  - ✅ Complete

- [x] **BE-1.6:** Reorder steps (PUT /api/hunts/:id/step-order)
  - ✅ Update stepOrder array
  - ✅ Validate steps belong to hunt
  - ✅ Bonus from Week 2

**Dependencies:** None
**Blockers:** None
**Patterns Established:**
- Reusable `verifyOwnership()` authorization
- Clean DTO separation
- Mapper pattern
**See:** `.claude/backend/hunt-step-implementation-decisions.md`

---

## Epic 2: Tree VIEW API (Not Started - 0%)

**Goal:** Efficient step visualization with lazy loading
**Timeline:** Week 2 (AFTER Step CRUD)
**Status:** 0/4 stories complete

### Stories

- [ ] **BE-2.1:** Get hunt tree (GET /api/hunts/:id/tree) 📍 NEXT
  - Returns compact step list (id, type, title, order)
  - No full challenge data
  - Optimized query
  - **Depends on:** BE-3.1, BE-3.2, BE-3.3 (Step CRUD complete)
  - Time: 1.5 days

- [ ] **BE-2.2:** Add stepCount to hunt list (GET /api/hunts) 📍 NEXT
  - Enhance existing endpoint
  - Aggregate count from steps collection
  - Time: 0.5 days

- [ ] **BE-2.3:** Get full step details (GET /api/steps/:id) 📍 NEXT
  - New endpoint for lazy loading
  - Returns complete step with challenge data
  - Authorization checks
  - Time: 1 day

- [ ] **BE-2.4:** Add database indexes 📍 NEXT
  - Index on Step.huntId
  - Index on Step.order
  - Performance testing with 100+ steps
  - Time: 0.5 days

**Dependencies:** Epic 3 (Step CRUD) must be complete first
**Blockers:** None
**See:** `.claude/tree-and-branching-strategy.md`

---

## Epic 3: Step Management ✅ (Complete - 80%)

**Goal:** Full CRUD for hunt steps
**Timeline:** Week 1
**Status:** 4/5 stories complete (Challenge validation moved to Week 2)
**Completed:** 2025-10-28

### Stories

- [x] **BE-3.1:** Create step (POST /api/hunts/:huntId/steps)
  - ✅ Validates ownership via huntService
  - ✅ Auto-appends to stepOrder
  - ✅ RESTful nested routes
  - ✅ Complete

- [x] **BE-3.2:** Update step (PUT /api/hunts/:huntId/steps/:stepId)
  - ✅ Validates ownership first
  - ✅ Checks step belongs to hunt
  - ✅ Authorization complete
  - ✅ Complete

- [x] **BE-3.3:** Delete step (DELETE /api/hunts/:huntId/steps/:stepId)
  - ✅ Removes from hunt.stepOrder
  - ✅ Deletes step document
  - ✅ Authorization complete
  - ✅ Complete

- [x] **BE-3.4:** Reorder steps (PUT /api/hunts/:id/step-order)
  - ✅ Updates stepOrder array
  - ✅ Validates all steps belong to hunt
  - ✅ Moved from Epic 1
  - ✅ Complete

- [ ] **BE-3.5:** Challenge type validation (MOVED TO WEEK 2)
  - Strategy pattern for validators
  - ClueValidator, QuizValidator, MissionValidator, TaskValidator
  - Deferred: Basic challenge structure works for now
  - Time: 2 days

**Dependencies:** Hunt CRUD complete ✅
**Blockers:** None
**Patterns Established:**
- RESTful nested routes (huntId in URL)
- Dependency injection (StepService injects HuntService)
- Clean DTO separation (StepCreate/StepUpdate)
**See:** `.claude/backend/hunt-step-implementation-decisions.md`

---

## Epic 4: Publishing & Release Workflow ✅ (Complete - 100%)

**Goal:** Publish hunts with versioning and release to players (simplified MVP)
**Timeline:** Week 4-5
**Status:** Complete
**Completed:** 2025-11-06

### Stories

- [x] **BE-4.1:** Publish hunt (POST /api/hunts/:id/publish)
  - ✅ Implemented publishHunt() with atomic transactions
  - ✅ Clone steps across versions (StepCloner helper)
  - ✅ Mark version as published (VersionPublisher helper)
  - ✅ Create new draft version
  - ✅ Update Hunt pointers (latestVersion, liveVersion)
  - ✅ Optimistic locking for concurrent edits
  - ✅ Transaction safety throughout
  - ✅ Complete

- [x] **BE-4.2:** Release hunt (PUT /api/publishing/:id/release)
  - ✅ Implemented releaseHunt() with optimistic locking
  - ✅ ReleaseManager helper for atomic release operations
  - ✅ Make published version live for players
  - ✅ Auto-detect latest published version if not specified
  - ✅ Rollback support (switch to any published version)
  - ✅ Race condition prevention
  - ✅ Complete

- [x] **BE-4.3:** Take hunt offline (DELETE /api/publishing/:id/release)
  - ✅ Implemented takeOffline() with optimistic locking
  - ✅ Remove hunt from player discovery
  - ✅ Reversible operation (can re-release)
  - ✅ Complete

**Architecture Implemented:**
- Hunt (master) + HuntVersion (content) separation (versioning system)
- Helper modules: VersionValidator, VersionPublisher, StepCloner, ReleaseManager
- Single Hunt DTO with all version metadata (isLive, releasedAt, releasedBy)
- Optimistic locking using currentLiveVersion parameter
- Compare-and-set pattern for concurrent updates
- Full transaction support
- Delete protection (cannot delete live hunts)

**Race Conditions Prevented:**
1. Concurrent Release Operations - Optimistic locking with currentLiveVersion
2. Delete While Live - Atomic check ensures liveVersion = null
3. Release During Publish - Transaction isolation
4. Concurrent TakeOffline + Release - Both use optimistic locking

**Complete Workflow:**
- Draft → Publish (immutable snapshot) → Release (make live) → Players can play
- Rollback: Switch to any published version instantly
- Take Offline: Remove from discovery, can re-release later

**Notes:**
- Simplified workflow for MVP: Draft → Published → Released
- No separate PublishedHunt or LiveHunt collections (HuntVersion tracks publishing)
- Skip "Review" status for MVP
- liveVersion is a pointer, not a copy (instant switching)

**Dependencies:** ✅ All met
**Blockers:** None
**See:**
- `.claude/publishing-workflow.md`
- `.claude/features/release-hunt-completed.md`
- `.claude/RELEASE-CONCEPT.md`

---

## Epic 5: Hunt Player API (Not Started - 0%)

**Goal:** Session-based gameplay with progress tracking, hints, and challenge validation
**Timeline:** Week 5-6
**Status:** 0/8 stories complete

**IMPORTANT:** Complete design documented in `.claude/player-api-design.md`

### Stories

- [ ] **BE-5.1:** Create PlaySession model
  - New model for tracking active gameplay
  - Fields: sessionId, playerName, huntId, versionId, currentStepId, hintsUsed, status, expiresAt
  - Indexes for performance
  - Update Progress model (add versionId, sessionId, make userId optional)
  - Time: 1 day

- [ ] **BE-5.2:** Start hunt endpoint (POST /api/play/:huntId/start)
  - Requires playerName (anonymous allowed)
  - Creates PlaySession with UUID
  - Creates Progress record
  - Returns sessionId + filtered first step (no answer/hint)
  - 2-day session expiry
  - Time: 2 days

- [ ] **BE-5.3:** Submit answer endpoint (POST /api/play/sessions/:sessionId/submit)
  - Validate based on challenge type (clue, quiz, mission, task)
  - Update progress if correct
  - Return next step (filtered)
  - Handle completion (last step)
  - Time: 3 days

- [ ] **BE-5.4:** Request hint endpoint (POST /api/play/sessions/:sessionId/hint)
  - 3 hints per step limit
  - Track hintsUsed per step
  - Return hint from Step.hint
  - Time: 1 day

- [ ] **BE-5.5:** Resume session endpoint (GET /api/play/sessions/:sessionId/resume)
  - Get current state
  - Validate not expired
  - Return filtered current step
  - Time: 1.5 days

- [ ] **BE-5.6:** Challenge validation by type
  - Clue: GPS proximity check
  - Quiz: Case-insensitive answer match
  - Mission: Location + asset validation (no AI for MVP)
  - Task: Text validation (no AI for MVP)
  - Response filtering service (remove answers/hints)
  - Time: 2 days

- [ ] **BE-5.7:** Publishing workflow update
  - Block publishing if active sessions exist
  - Return activeSessions count in error
  - Built for extension (force publish in V1.1)
  - Time: 1 day

- [ ] **BE-5.8:** Session cleanup cron job
  - Daily: Mark expired sessions (> 2 days)
  - Optional: Delete old sessions after 30 days
  - Time: 0.5 days

**Dependencies:**
- ✅ Publishing workflow (Epic 4)
- ✅ Asset Management (Epic 6) - **Missions need file uploads**

**Blockers:** None

**Design Decisions:**
- Anonymous players with required playerName
- localStorage-based sessions (UUID)
- Block publishing if active sessions (extendable to force in V1.1)
- 2-day session expiry
- 3 hints per step
- Unlimited retries (MVP)
- Simple validation, no AI (MVP)

**See:** `.claude/player-api-design.md` for complete design

---

## Epic 6: Asset Management (Not Started - 0%)

**Goal:** Support file uploads for missions
**Timeline:** Week 3 (BEFORE Publishing and Player)
**Status:** 0/3 stories complete

### Stories

- [ ] **BE-6.1:** Upload asset (POST /api/assets)
  - File upload middleware (multer)
  - Store to Firebase Storage or S3
  - Return asset URL
  - Time: 2 days

- [ ] **BE-6.2:** Attach asset to step
  - Reference asset in step.challenge.mission.submittedAssets
  - Validate asset belongs to user
  - Time: 1 day

- [ ] **BE-6.3:** Get asset (GET /api/assets/:id)
  - Return signed URL
  - Authorization checks
  - Time: 0.5 days

**Dependencies:** Step CRUD
**Blockers:** Need to decide: Firebase Storage or AWS S3?
**See:** `.claude/requirements.md` (Decision needed)

---

## Epic 7: AI Integration 🤖 (Future - V1.1)

**Goal:** AI-powered validation and content generation
**Timeline:** V1.1 (post-MVP)
**Status:** 0/4 stories complete

### Stories

- [ ] **BE-7.1:** Integrate AI service (OpenAI API)
  - API key configuration
  - Rate limiting
  - Error handling
  - Time: 1 day

- [ ] **BE-7.2:** AI mission validation
  - Validate photo matches mission description
  - Use vision API
  - Time: 2 days

- [ ] **BE-7.3:** AI task validation
  - Validate text submission makes sense
  - Natural language understanding
  - Time: 2 days

- [ ] **BE-7.4:** AI content suggestions
  - Suggest hunt ideas
  - Generate clue text
  - Time: 2 days

**Dependencies:** MVP complete
**Blockers:** None (future feature)
**Notes:** Premium feature ($1/month unlocks AI)

---

# 🟢 FRONTEND THEME

## Epic 8: Dashboard & Authentication (Not Started - 0%)

**Goal:** User can log in and see hunt library
**Timeline:** Week 7-8
**Status:** 0/4 stories complete

### Stories

- [ ] **FE-8.1:** Set up React project
  - Vite + TypeScript
  - MUI components
  - React Router
  - Time: 1 day

- [ ] **FE-8.2:** Authentication pages
  - Login page
  - Signup page
  - Firebase integration
  - Time: 2 days

- [ ] **FE-8.3:** Dashboard page
  - List user's hunts
  - "Create Hunt" button
  - Hunt cards with status
  - Time: 2 days

- [ ] **FE-8.4:** Hunt details page
  - Show hunt info
  - QR code display
  - Edit/Delete buttons
  - Time: 1.5 days

**Dependencies:** Backend Hunt CRUD complete
**Blockers:** None
**See:** `.claude/frontend/overview.md`

---

## Epic 9: Hunt Editor (Not Started - 0%)

**Goal:** Visual editor for creating hunts
**Timeline:** Week 8-10
**Status:** 0/6 stories complete

### Stories

- [ ] **FE-9.1:** Hunt creation form
  - Name, description, start location
  - Save as draft
  - Time: 2 days

- [ ] **FE-9.2:** Tree view component
  - Display steps in tree visualization
  - Click to expand/collapse
  - Lazy load step details
  - Time: 3 days

- [ ] **FE-9.3:** Step creation form
  - Select challenge type
  - Dynamic form based on type
  - Location picker (map)
  - Time: 3 days

- [ ] **FE-9.4:** Step editing
  - Load step details on click
  - Update step
  - Delete step
  - Time: 2 days

- [ ] **FE-9.5:** Step reordering
  - Drag and drop
  - Update order on backend
  - Time: 2 days

- [ ] **FE-9.6:** Hunt preview
  - Preview hunt as player would see it
  - Test mode (no progress saving)
  - Time: 2 days

**Dependencies:** Backend Step CRUD + Tree API
**Blockers:** None
**See:** `.claude/tree-and-branching-strategy.md` (Frontend section)

---

## Epic 10: Publishing & QR Codes (Not Started - 0%)

**Goal:** Publish hunts and generate shareable QR codes
**Timeline:** Week 10-11
**Status:** 0/3 stories complete

### Stories

- [ ] **FE-10.1:** Publish button & workflow
  - Review checklist (all steps complete?)
  - Version name input
  - Publish confirmation
  - Time: 1.5 days

- [ ] **FE-10.2:** Version management UI
  - List published versions
  - Select live version
  - Edit published version (warning dialog)
  - Time: 2 days

- [ ] **FE-10.3:** QR code generation
  - Generate QR for live hunt
  - Download/print options
  - Share link
  - Time: 1 day

**Dependencies:** Backend Publishing workflow
**Blockers:** None

---

## Epic 11: Hunt Player (Mobile-Responsive) (Not Started - 0%)

**Goal:** Mobile-friendly player for participating in hunts
**Timeline:** Week 11-12
**Status:** 0/5 stories complete

### Stories

- [ ] **FE-11.1:** Player landing page
  - Scan QR or enter hunt code
  - Hunt intro/description
  - Start button
  - Time: 1.5 days

- [ ] **FE-11.2:** Step-by-step UI
  - Display current step
  - Show challenge based on type
  - Progress indicator
  - Time: 2 days

- [ ] **FE-11.3:** Challenge interaction
  - Clue: Display clue, check location
  - Quiz: Multiple choice, submit answer
  - Mission: Camera integration, location check
  - Task: Text input, submit
  - Time: 3 days

- [ ] **FE-11.4:** Location services
  - Request geolocation permission
  - Show map with target location
  - Validate proximity
  - Time: 2 days

- [ ] **FE-11.5:** Completion screen
  - Show results
  - Share functionality
  - Play again / discover more hunts
  - Time: 1 day

**Dependencies:** Backend Player API
**Blockers:** None
**See:** `.claude/application-overview.md` (User Flow 2)

---

# 🟣 INTEGRATION THEME

## Epic 12: Payment Integration (Not Started - 0%)

**Goal:** Stripe integration for premium tier
**Timeline:** Week 12-13
**Status:** 0/3 stories complete

### Stories

- [ ] **INT-12.1:** Stripe setup
  - Create Stripe account
  - API keys configuration
  - Webhook setup
  - Time: 1 day

- [ ] **INT-12.2:** Upgrade flow (Backend)
  - POST /api/upgrade endpoint
  - Create Stripe checkout session
  - Handle webhook events
  - Update user.isPremium
  - Time: 2 days

- [ ] **INT-12.3:** Upgrade flow (Frontend)
  - Premium feature walls
  - Upgrade button
  - Redirect to Stripe checkout
  - Success/cancel pages
  - Time: 1.5 days

**Dependencies:** MVP complete
**Blockers:** Need Stripe account
**Notes:** $1/month for unlimited hunts

---

## Epic 13: Deployment & DevOps (Not Started - 0%)

**Goal:** Deploy to production
**Timeline:** Week 13-14
**Status:** 0/4 stories complete

### Stories

- [ ] **INT-13.1:** Backend deployment
  - Choose hosting (Railway, Render, Heroku?)
  - Environment variables
  - MongoDB Atlas setup
  - Time: 1.5 days

- [ ] **INT-13.2:** Frontend deployment
  - Vercel or Netlify
  - Environment variables
  - Custom domain
  - Time: 1 day

- [ ] **INT-13.3:** CI/CD pipeline
  - GitHub Actions
  - Auto-deploy on push to main
  - Run tests before deploy
  - Time: 1.5 days

- [ ] **INT-13.4:** Monitoring & logging
  - Error tracking (Sentry?)
  - Performance monitoring
  - Uptime monitoring
  - Time: 1 day

**Dependencies:** MVP complete
**Blockers:** None
**See:** `.claude/deployment/strategy.md`

---

# 📅 TIMELINE BY PHASE

## MVP (Weeks 1-12) - Core Functionality

**Goal:** Working end-to-end hunt creation and playing

**Backend (Weeks 1-6):**
- ✅ Week 1: Infrastructure setup (DONE)
- 🔥 Week 1-2: Hunt CRUD + Tree VIEW API (IN PROGRESS)
- Week 2-3: Step Management
- Week 4-5: Publishing Workflow (simplified)
- Week 5-6: Player API + Location validation
- Week 6-7: Asset Management

**Frontend (Weeks 7-12):**
- Week 7-8: Dashboard + Auth
- Week 8-10: Hunt Editor + Tree View
- Week 10-11: Publishing UI + QR codes
- Week 11-12: Player (mobile)

**Integration (Week 13-14):**
- Week 13-14: Deployment

**MVP Deliverables:**
- ✅ Create hunts with multiple steps
- ✅ Publish hunts (single version)
- ✅ Generate QR codes
- ✅ Play hunts on mobile
- ✅ Location-based validation
- ✅ All 4 challenge types working
- ✅ File uploads for missions
- ✅ Deployed and accessible

**Estimated: 14 weeks (~3.5 months)**

---

## V1.1 (Post-MVP) - Enhanced Features

**Goal:** Polish, premium features, AI integration

**Features:**
- Multiple hunt versions (full versioning)
- AI-powered validation
- Stripe payment integration
- Hunt analytics
- User profiles
- Hunt discovery page

**Estimated: +4 weeks**

---

## V1.2 (Future) - Advanced Features

**Goal:** Gameplay branching, advanced editor

**Features:**
- Conditional branching (use metadata field)
- Visual flow editor
- Collaboration (multiple creators)
- Hunt templates
- Social features

**Estimated: +6 weeks**

---

# 🎯 NOW / NEXT / LATER

## ✅ Week 1 Complete (Oct 27 - Oct 28)

**Completed:**
- [x] BE-1.4: Update hunt ✅
- [x] BE-1.5: Delete hunt ✅
- [x] BE-1.6: Reorder steps ✅ (bonus from Week 2)
- [x] BE-3.1: Create step ✅
- [x] BE-3.2: Update step ✅
- [x] BE-3.3: Delete step ✅
- [x] OpenAPI schema fixes ✅
- [x] Production patterns documented ✅

**Achievement:** All Hunt + Step CRUD endpoints complete!

---

## 🔥 NOW (CRITICAL - Before Week 2)

**UUID Migration (~2-3 hours):**
- [ ] Add `id: string` field to all 7 models
- [ ] Generate UUID v4 on create
- [ ] Update all queries to use UUID
- [ ] Change foreign key references to UUID
- [ ] Update all 7 mappers
- [ ] Add unique index on `id` field
- [ ] Test migration with existing endpoints

**Goal:** Fix security issue (exposing MongoDB ObjectIds)

**Priority:** CRITICAL - Must complete before continuing features

**Time:** 2-3 hours
**Story Points:** 8 points (high complexity, multiple files)

---

## 📍 NEXT (Weeks 2-4)

**Week 2: Complete Step Management + Tree VIEW**
- [ ] BE-3.4: Reorder steps (PUT /api/hunts/:id/step-order) - 1 day
- [ ] BE-3.5: Challenge type validation (Strategy pattern) - 2 days
- [ ] BE-2.1: Get hunt tree (GET /api/hunts/:id/tree) - 1.5 days
  - ✅ NOW we have solid Step CRUD to test with
- [ ] BE-2.2: Add stepCount to hunt list - 0.5 days
- [ ] BE-2.3: Get step details (GET /api/steps/:id) - 1 day
- [ ] BE-2.4: Database indexes - 0.5 days

**Week 3: Asset Management (CRITICAL - blocks Publishing and Player)**
- [ ] BE-6.1: Upload asset (POST /api/assets) - 2 days
  - ⚠️ MUST be done before Publishing
- [ ] BE-6.2: Attach asset to step - 1 day
- [ ] BE-6.3: Get asset (GET /api/assets/:id) - 0.5 days

**Week 4: Publishing Workflow**
- [ ] BE-4.1: Publish hunt (POST /api/hunts/:id/publish) - 3 days
  - ✅ Can now publish hunts with mission steps
- [ ] BE-4.2: Get live version (GET /api/hunts/:id/live) - 1 day
- [ ] BE-4.3: List published versions - 1 day
- [ ] BE-4.4: Set live version - 1 day

**Goal:** Complete Step Management + Tree VIEW + Assets + Publishing

**Time:** 3 weeks (16 days of work)
**Story Points:** 35 points

**Critical Path:** Step CRUD → Tree VIEW → Assets → Publishing → Player

---

## 🔮 LATER (Weeks 5+)

**Backend:**
- Epic 4: Complete publishing (versions management)
- Epic 5: Player API (depends on Assets being done)

**Frontend:**
- All epics (start when backend ready)

**Integration:**
- Deployment
- Payment integration (post-MVP)
- AI integration (V1.1)

**Goal:** MVP completion + enhancements

**Note:** Assets already moved to NEXT

---

# 📊 DEPENDENCIES & IMPLEMENTATION ORDER

## Story-Level Dependencies (Detailed)

**Week 1 (NOW) - Must be done in this order:**
```
1. BE-1.4 (Update hunt) ──┐
2. BE-1.5 (Delete hunt) ──┤── No dependencies, can do in parallel
                          │
3. BE-3.1 (Create step) ──┴──> Required for solid CRUD foundation
                               │
                               ├──> 4. BE-3.2 (Update step)
                               │
                               └──> 5. BE-3.3 (Delete step)
```

**Weeks 2-4 (NEXT) - Must be done in this order:**
```
Week 2: Step Management + Tree VIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BE-3.4 (Reorder steps) ───────────┐
                                  │
BE-3.5 (Challenge validation) ────┴──> Step CRUD now complete
                                        │
                                        ├──> BE-2.1 (Get hunt tree)
                                        │    BE-2.2 (Add stepCount)
                                        │    BE-2.3 (Get step details)
                                        │    BE-2.4 (Database indexes)
                                        │    ↓
                                        │    ✅ Tree VIEW complete
                                        │
Week 3: Asset Management (CRITICAL)    │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │
                                        │
                                        ├──> BE-6.1 (Upload asset)
                                        │    BE-6.2 (Attach to step)
                                        │    BE-6.3 (Get asset)
                                        │    ↓
                                        │    ✅ Assets complete
                                        │    ⚠️ REQUIRED for Publishing + Player
                                        │
Week 4: Publishing Workflow             │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │
                                        │
                                        └──> BE-4.1 (Publish hunt)
                                             BE-4.2 (Get live version)
                                             BE-4.3 (List versions)
                                             BE-4.4 (Set live version)
                                             ↓
                                             ✅ Publishing ready
                                             ↓
                                        Week 5: Player API (depends on Assets)
```

## Epic-Level Dependencies

```
Epic 1 (Hunt CRUD) ✅ Week 1
    │
    └──> Epic 3 (Step CRUD) - Week 1-2
              │
              ├──> Epic 2 (Tree VIEW) - Week 2
              │
              └──> Epic 6 (Assets) - Week 3 ⚠️ CRITICAL
                        │
                        ├──> Epic 4 (Publishing) - Week 4
                        │         │
                        │         └──> Epic 10 (Pub UI) - Week 10-11
                        │
                        └──> Epic 5 (Player API) - Week 5-6
                                  │
                                  └──> Epic 11 (Player UI) - Week 11-12

Epic 8 (Dashboard) - Week 7-8
    │
    └──> Epic 9 (Editor) - Week 8-10

Epic 12 (Stripe) - Week 12-13 (post-MVP)
Epic 7 (AI) - V1.1 (post-MVP)

Epic 13 (Deployment) - Week 13-14 (final)
```

**Key Changes from Original Plan:**
- ✅ Tree VIEW moved AFTER Step CRUD (needs steps to visualize)
- ⚠️ Assets moved from Week 6-7 to Week 3 (CRITICAL for Publishing + Player)
- ✅ Publishing now depends on Assets (can't publish missions without file upload)
- ✅ Player API already depended on Assets (correct in original plan)

## Critical Path (Longest dependency chain)

```
NOW:    Hunt CRUD → Step Create → Tree VIEW (5-6 days)
NEXT:   Step CRUD → Publishing → Player API (15-18 days)
LATER:  Dashboard → Editor → Player → Deployment (25-30 days)

Total critical path: ~50-55 days (10-11 weeks to deployable MVP)
```

## Parallel Work Opportunities

**Can work on simultaneously:**
- Hunt CRUD (BE-1.4, BE-1.5) can be done in parallel
- Tree VIEW components (BE-2.1, BE-2.2) after BE-3.1
- Step CRUD operations (BE-3.2, BE-3.3, BE-3.4) are independent
- Asset management can be built parallel to Publishing
- Frontend Dashboard can start while backend completes Player API

---

# 🚀 VELOCITY TRACKING

**Sprint duration:** 1 week
**Current sprint:** Week 1-2 (Oct 27 - Nov 3)

**Velocity (Story Points):**
- Week 1: 8 points (Infrastructure)
- Week 2: TBD (Current sprint)

**Story point estimates:**
- Small story (0.5-1 day): 2 points
- Medium story (2-3 days): 5 points
- Large story (4-5 days): 8 points

**Target velocity:** 10-15 points/week (realistic for solo developer)

---

# 📝 DECISION LOG

**Decisions needed for roadmap:**

1. **Asset storage:** Firebase Storage or AWS S3?
   - Status: Not decided
   - Blocking: Epic 6
   - Timeline: Decide by Week 5

2. **Frontend build tool:** Vite or Create React App?
   - Status: Not decided
   - Blocking: Epic 8
   - Timeline: Decide by Week 6

3. **Hosting provider:** Railway, Render, Heroku, or other?
   - Status: Not decided
   - Blocking: Epic 13
   - Timeline: Decide by Week 12

4. **Review status:** Keep or remove from MVP?
   - Status: DECIDED - Remove from MVP
   - See: `.claude/reference/decisions-needed.md`

---

# 🔗 RELATED DOCUMENTS

**For implementation details:**
- `.claude/backend/current-state.md` - What's implemented
- `.claude/tree-and-branching-strategy.md` - Tree VIEW API design
- `.claude/publishing-workflow.md` - Publishing system design
- `.claude/decisions/solid-principles.md` - Code patterns

**For requirements:**
- `.claude/application-overview.md` - All features explained
- `.claude/requirements.md` - Functional requirements

**For decisions:**
- `.claude/reference/decisions-needed.md` - Historical decisions
- `.claude/reference/design-concerns.md` - Issues flagged

---

# 📈 SUCCESS METRICS

**MVP Success:**
- ✅ User can create hunt with 5+ steps
- ✅ User can publish hunt and generate QR code
- ✅ Player can complete hunt on mobile
- ✅ All 4 challenge types working
- ✅ Location validation accurate
- ✅ Deployed and accessible
- ✅ Clean, professional UI
- ✅ No critical bugs

**Portfolio Success:**
- Production-quality code
- Good test coverage (>70%)
- Well-documented
- Deployed and live
- Working demo video

---

**Last updated:** 2025-10-27
**Next review:** Weekly (update progress and adjust estimates)

---

## 🔄 How to Use This Roadmap

**As a developer:**
1. Check "NOW" section for current sprint work
2. Reference epics for feature context
3. Check dependencies before starting stories
4. Update story status as you complete work

**As a product owner:**
1. Review phase timelines
2. Adjust priorities in NOW/NEXT/LATER
3. Make decisions blocking epics
4. Track overall progress

**Updating:**
- Mark stories [x] when complete
- Adjust time estimates based on velocity
- Add new stories as requirements evolve
- Update "Last updated" date
