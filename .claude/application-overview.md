# HuntHub Application Overview

## What is HuntHub?

**A treasure hunt creation and playing platform** that allows users to design location-based scavenger hunts and share them via QR codes.

**Key Goal:** Portfolio showcase - fully developed product, simple yet high quality, built with speed.

## Target Users

**Primary Users:**
- Individuals creating treasure hunts for friends/family
- Event organizers creating interactive experiences
- (Future) NGOs and organizations creating recurring hunts

**User Personas:**
1. **Creator** - Designs and publishes treasure hunts
2. **Player** - Participates in published hunts via mobile

## Core Value Proposition

- **Easy hunt creation** - Intuitive editor for creating multi-step treasure hunts
- **QR code sharing** - Simple distribution via scannable codes
- **Version control** - Manage drafts, reviews, and published versions
- **Play anywhere** - Mobile-friendly player interface

## Application Structure

### Two Main Parts

**1. Editor App** (authenticated users)
- Create, edit, and manage hunts
- Preview hunts before publishing
- Version management and publishing workflow
- Hunt analytics and results

**2. Player App** (public, accessed via QR code)
- Play published hunts step-by-step
- Location-based challenge verification
- Progress tracking
- Completion screen

**Same domain, different routes:**
```
hunthub.com/          → Home/landing page
hunthub.com/auth      → Authentication
hunthub.com/dashboard → Hunt management (editor)
hunthub.com/edit/:id  → Hunt editor
hunthub.com/play/:id  → Hunt player (public)
```

## Main Features

### Core MVP Features

**User Management:**
- ✅ Firebase authentication
- ✅ User profiles
- [ ] Free tier: Max 2 active hunts
- [ ] Premium tier: Unlimited hunts ($1/month via Stripe)

**Hunt Creation (Editor):**
- [ ] Create new hunt
- [ ] Add multiple types of steps/challenges:
  - Clues
  - Quizzes
  - Missions (photo/video upload, location matching)
  - Tasks
- [ ] Define step order
- [ ] Set location requirements
- [ ] Preview hunt before publishing
- [ ] Save as draft

**Hunt Management:**
- [ ] View all hunts (library/dashboard)
- [ ] Hunt details page (link, results, analytics)
- [ ] Publishing workflow (Draft → Review → Published)
- [ ] Version management
- [ ] Select live version from published versions
- [ ] QR code generation for sharing

**Hunt Playing:**
- [ ] Scan QR code to start hunt
- [ ] Step-by-step progression
- [ ] Location verification
- [ ] Challenge completion
- [ ] Progress tracking
- [ ] Completion screen

**Publishing Workflow:**
- [ ] Draft status (default)
- [ ] Review status (pre-publish)
- [ ] Publish with version naming
- [ ] Multiple published versions
- [ ] Select which version is "Live"
- [ ] View published versions (read-only)
- [ ] Edit published versions (overwrites current draft)

### Future Features

**Premium Features:**
- [ ] Stripe payment integration
- [ ] Premium account ($1/month)
- [ ] Unlimited active hunts

**White-label / Multi-tenant:**
- [ ] Custom domain support
- [ ] Theme customization (colors, fonts)
- [ ] Organization branding
- [ ] Good for NGOs/companies doing frequent hunts

**Hunt Discovery:**
- [ ] Public hunt gallery?
- [ ] Search/filter?
- [ ] Featured hunts?

## User Flows

### Flow 1: First-Time User Creating Hunt

```
1. Land on homepage (marketing/presentation)
2. Click "Get Started"
3. Redirected to auth page
4. Sign up / Log in
5. See dashboard with:
   - "Create Hunt" button
   - List of existing hunts (empty for new user)
6. Click "Create Hunt"
7. Hunt editor page opens
8. Add steps (clues, quizzes, missions, tasks)
9. Configure step details and locations
10. Save as draft
11. Review hunt
12. Publish hunt (creates version)
13. Get QR code / link to share
```

### Flow 2: Playing a Hunt

```
1. User scans QR code or clicks link
2. Opens player app at /play/:huntId
3. Shows hunt intro/description
4. Click "Start Hunt"
5. See first step/challenge
6. Complete challenge (answer, photo, location)
7. Progress to next step
8. Repeat until all steps complete
9. See completion screen with results
```

### Flow 3: Managing Published Versions

```
1. From dashboard, view hunt details
2. See current draft version
3. See dropdown of published versions
4. Options per published version:
   - View (read-only editor view)
   - Edit (load this version into draft, lose current draft changes)
   - Set as Live (which version players see)
5. Publish new version (creates dated snapshot)
```

## Scope & Boundaries

**In Scope (MVP):**
- Hunt creation and editing
- Publishing with versioning
- QR code sharing
- Basic hunt playing
- Location-based challenges
- Firebase authentication
- Stripe payment (simple implementation)

**Out of Scope (for now):**
- Social features (likes, comments, followers)
- Real-time multiplayer
- Advanced analytics
- Mobile native apps (PWA is fine)
- Hunt templates/marketplace
- AI-generated hunts

## Success Metrics

**As a portfolio piece:**
- Clean, professional UI
- Working end-to-end
- Deployed and accessible
- Good code quality
- Well-documented

**For real usage (nice to have):**
- Number of hunts created
- Number of hunts played
- Completion rate
- User retention

## Technical Context

**Frontend:** React + Material-UI + styled-components
**Backend:** Node + Express + TypeScript + MongoDB + Mongoose
**Auth:** Firebase
**Payment:** Stripe (future)
**DI:** InversifyJS
**Validation:** Zod + OpenAPI

**Key Technical Challenge:**
Schema sharing between backend and frontend while maintaining proper validation at all layers (UI, API, DB)
