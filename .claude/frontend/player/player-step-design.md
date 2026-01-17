# HuntHub Player Step UI/UX Design Plan

## Executive Summary

Design specifications for the mobile-first player experience for HuntHub treasure hunts. This document covers UI/UX patterns for all challenge types: **Clue**, **Quiz** (choice + input), **Mission** (location + photo + audio), and **Task** (AI text).

**Goal:** Create an engaging, satisfying, and intuitive mobile experience that keeps players motivated throughout their treasure hunt journey.

---

## 1. Design Philosophy & Principles

### Core UX Pillars

Based on industry research ([Duolingo gamification patterns](https://www.strivecloud.io/blog/gamification-examples-boost-user-retention-duolingo), [gamification in UX](https://blog.logrocket.com/ux-design/ux-analysis-gamification/)):

| Principle | Application |
|-----------|-------------|
| **Immediate Feedback** | Every action gets instant visual/audio response |
| **Progress Visibility** | Always show where player is in the journey |
| **Small Wins** | Celebrate each step completion, not just hunt completion |
| **Clear Goals** | Player always knows what to do next |
| **Authentic Challenge** | Real failure possibility (wrong answers matter) |
| **Journey Narrative** | Each step feels like part of a story, not a form |

### Emotional Arc

```
Start → Curiosity → Challenge → Satisfaction → Anticipation → Completion Joy
   ↓         ↓          ↓            ↓              ↓               ↓
  Hook    Discovery   Attempt     Success      "What's next?"   Celebration
```

---

## 2. Global Player Screen Structure

### Layout Architecture (Mobile-First)

```
┌──────────────────────────────────────┐
│  ← Back    Hunt Name      Step 3/7   │  ← Compact TopBar (48px)
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐    │
│  │                              │    │
│  │      CHALLENGE CONTENT       │    │  ← Scrollable Content Area
│  │      (varies by type)        │    │
│  │                              │    │
│  └──────────────────────────────┘    │
│                                      │
├──────────────────────────────────────┤
│  ═══════════════════════════        │  ← Progress Bar (6px)
│  [    Primary Action Button    ]     │  ← Sticky Bottom Action (80px)
└──────────────────────────────────────┘
```

### Shared Components

**TopBar:**
- Left: Back arrow (subtle, not prominent)
- Center: Hunt name (truncated if needed)
- Right: Step counter ("3/7")

**Progress Bar:**
- Visual journey indicator
- Fills incrementally per step
- Uses theme primary color with gradient

**Action Area:**
- Sticky to bottom (thumb-friendly)
- Full-width primary button
- Optional secondary action (hint)

---

## 3. Challenge Type Designs

### 3.1 CLUE Challenge

**Purpose:** Informational step - guides players, auto-completes on view

**Data Model:**
```typescript
{
  type: "clue",
  challenge: {
    clue: { title?: string, description?: string }
  },
  media?: Media,  // Optional image/audio
  hint?: string   // Usually not needed for clues
}
```

**Screen Design:**

```
┌──────────────────────────────────────┐
│  ←         Barcelona Hunt    3/7     │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐    │
│  │  [Optional: Step Image]      │    │  ← 16:9 aspect ratio
│  │  (hero image if provided)    │    │
│  └──────────────────────────────┘    │
│                                      │
│  📍 Step 3                           │  ← Step indicator
│                                      │
│  ┌──────────────────────────────┐    │
│  │  WELCOME TO LA RAMBLA        │    │  ← Title (h4, bold)
│  │                              │    │
│  │  Walk down the famous        │    │  ← Description (body1)
│  │  pedestrian street and       │    │
│  │  look for the mosaic by      │    │
│  │  Joan Miró near the port...  │    │
│  └──────────────────────────────┘    │
│                                      │
├──────────────────────────────────────┤
│  ═══════════════════════════════    │
│  [         Continue →          ]     │  ← Primary button
└──────────────────────────────────────┘
```

**Interaction:**
- Single tap "Continue" → mark complete → animate to next step
- No validation needed (auto-pass)
- Reading time: ~2-3 seconds minimum before enabling button (prevents accidental skip)

**Animations:**
- Content fades in from bottom
- Image parallax subtle scroll
- Button appears after brief delay (500ms)

---

### 3.2 QUIZ Challenge (Choice)

**Purpose:** Test knowledge with multiple-choice questions

**Data Model:**
```typescript
{
  type: "quiz",
  challenge: {
    quiz: {
      title?: string,
      description?: string,
      type: "choice",
      options: [{ id: string, text: string }],
      targetId: string,  // Server-side only
      randomizeOrder?: boolean
    }
  }
}
```

**Screen Design:**

```
┌──────────────────────────────────────┐
│  ←         Barcelona Hunt    4/7     │
├──────────────────────────────────────┤
│                                      │
│  ❓ Quiz Time                        │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  What year was the fountain  │    │  ← Question (h5)
│  │  at Plaça de Catalunya       │    │
│  │  built?                      │    │
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  ○  1877                     │    │  ← Option cards
│  └──────────────────────────────┘    │     (48px height each)
│  ┌──────────────────────────────┐    │     (12px gap)
│  │  ●  1929                     │    │  ← Selected state
│  └──────────────────────────────┘    │
│  ┌──────────────────────────────┐    │
│  │  ○  1956                     │    │
│  └──────────────────────────────┘    │
│  ┌──────────────────────────────┐    │
│  │  ○  1992                     │    │
│  └──────────────────────────────┘    │
│                                      │
│  💡 Need a hint?                     │  ← Hint link (if available)
│                                      │
├──────────────────────────────────────┤
│  ════════════════════════            │
│  [       Check Answer        ]       │  ← Disabled until selection
└──────────────────────────────────────┘
```

**States:**

1. **Unselected:** All options neutral, button disabled
2. **Selected:** One option highlighted (primary color border), button enabled
3. **Checking:** Button shows spinner, options locked
4. **Correct:** ✓ Green animation, celebration, auto-advance
5. **Incorrect:** ✗ Red shake, feedback message, try again

**Feedback Design (CRITICAL):**

```
CORRECT STATE:
┌──────────────────────────────────────┐
│  ┌──────────────────────────────┐    │
│  │  ✓  1929                     │    │  ← Green background
│  └──────────────────────────────┘    │     + checkmark icon
│                                      │
│  ┌──────────────────────────────┐    │
│  │  🎉 Correct!                 │    │  ← Success message card
│  │     The fountain was built   │    │     (celebratory color)
│  │     for the 1929 World Expo  │    │
│  └──────────────────────────────┘    │
│                                      │
│  [      Continue →      ]            │  ← Auto-enabled
└──────────────────────────────────────┘

INCORRECT STATE:
┌──────────────────────────────────────┐
│  ┌──────────────────────────────┐    │
│  │  ✗  1877                     │    │  ← Red background
│  └──────────────────────────────┘    │     + shake animation
│                                      │
│  ┌──────────────────────────────┐    │
│  │  Not quite!                  │    │  ← Feedback card
│  │  Try again or use a hint.   │    │     (warm, not harsh)
│  │                              │    │
│  │  Attempts: 1/3               │    │  ← Attempt counter
│  └──────────────────────────────┘    │
│                                      │
│  [      Try Again      ]             │  ← Re-enabled for retry
└──────────────────────────────────────┘
```

**Animations:**
- Options: Scale up slightly on hover/focus (1.02)
- Selected: Border animation + subtle glow
- Correct: Confetti burst + checkmark bounce + haptic feedback
- Incorrect: Horizontal shake (3x) + soft rumble

---

### 3.3 QUIZ Challenge (Input)

**Purpose:** Free-text answer entry

**Data Model:**
```typescript
{
  type: "quiz",
  challenge: {
    quiz: {
      title?: string,
      description?: string,
      type: "input",
      expectedAnswer: string  // Server-side only
    }
  }
}
```

**Screen Design:**

```
┌──────────────────────────────────────┐
│  ←         Barcelona Hunt    5/7     │
├──────────────────────────────────────┤
│                                      │
│  ✏️ Your Answer                      │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  Find the artist's signature │    │  ← Question
│  │  on the mosaic. Who created  │    │
│  │  this famous artwork?        │    │
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │                              │    │
│  │  [Enter your answer...]      │    │  ← Text input field
│  │                              │    │     (autocapitalize off)
│  └──────────────────────────────┘    │     (spellcheck off)
│                                      │
│  💡 Hint: Famous Catalan artist     │  ← Optional hint
│                                      │
├──────────────────────────────────────┤
│  ═══════════════════════════        │
│  [       Submit Answer       ]       │  ← Disabled if empty
└──────────────────────────────────────┘
```

**Input Behavior:**
- Auto-focus on mount (open keyboard)
- Submit on Enter key
- Trim whitespace before validation
- Case-insensitive comparison (server-side)

**Feedback:**
- Same correct/incorrect patterns as choice quiz
- For incorrect: Show "Close!" if fuzzy match is implemented

---

### 3.4 MISSION Challenge (Location)

**Purpose:** Verify player reached a physical location

**Data Model:**
```typescript
{
  type: "mission",
  challenge: {
    mission: {
      title?: string,
      description?: string,
      type: "match-location",
      targetLocation: { lat, lng, radius }  // Server-side only
    }
  }
}
```

**Screen Design:**

```
┌──────────────────────────────────────┐
│  ←         Barcelona Hunt    6/7     │
├──────────────────────────────────────┤
│                                      │
│  📍 Find This Location               │
│                                      │
│  ┌──────────────────────────────┐    │
│  │                              │    │
│  │    [Interactive Map View]    │    │  ← Map with general area
│  │    (no exact pin - mystery)  │    │     (zoomed to neighborhood)
│  │                              │    │
│  │        ◎ You are here        │    │  ← Player's current location
│  │                              │    │
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  HEAD TO PARK GÜELL          │    │  ← Title
│  │                              │    │
│  │  Find the famous salamander  │    │  ← Description/clue
│  │  sculpture at the entrance.  │    │
│  │  Stand right in front of it! │    │
│  └──────────────────────────────┘    │
│                                      │
│  Distance: ~450m away               │  ← Dynamic distance indicator
│                                      │
├──────────────────────────────────────┤
│  ══════════════════════════════     │
│  [    📍 Check My Location    ]      │  ← GPS verification
└──────────────────────────────────────┘
```

**States:**

1. **Exploring:** Map visible, distance updating, button enabled
2. **Checking:** Acquiring GPS, spinner on button
3. **Too Far:** Feedback showing distance remaining
4. **Arrived:** Success celebration, auto-advance

**Distance Feedback:**

```
TOO FAR STATE:
┌──────────────────────────────────────┐
│  ┌──────────────────────────────┐    │
│  │  ⚠️ Not quite there yet!     │    │  ← Orange warning card
│  │                              │    │
│  │  You're about 230m away.     │    │
│  │  Keep exploring!             │    │
│  │                              │    │
│  │  [Show on Map]               │    │  ← Optional: open maps app
│  └──────────────────────────────┘    │
│                                      │
│  [    📍 Check Again    ]            │
└──────────────────────────────────────┘

ARRIVED STATE:
┌──────────────────────────────────────┐
│  ┌──────────────────────────────┐    │
│  │  🎉 You found it!            │    │  ← Green success card
│  │                              │    │     + location pin animation
│  │  You're at the right spot!   │    │
│  │  El Drac awaits...           │    │
│  └──────────────────────────────┘    │
│                                      │
│  [      Continue →      ]            │
└──────────────────────────────────────┘
```

**Map Considerations:**
- Don't show exact target location (that's the challenge!)
- Show player's current position
- Maybe show a "hot/cold" radius indicator
- Consider battery usage (polling interval)

---

### 3.5 MISSION Challenge (Photo Upload)

**Purpose:** Capture photo evidence of completing a physical task

**Data Model:**
```typescript
{
  type: "mission",
  challenge: {
    mission: {
      title?: string,
      description?: string,
      type: "upload-media",
      referenceAssetIds?: number[]  // Example photos
    }
  }
}
```

**Screen Design:**

```
┌──────────────────────────────────────┐
│  ←         Barcelona Hunt    6/7     │
├──────────────────────────────────────┤
│                                      │
│  📸 Photo Mission                    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  PIGEON CHALLENGE            │    │  ← Title
│  │                              │    │
│  │  Take a selfie with a        │    │  ← Instructions
│  │  pigeon at Plaça Catalunya!  │    │
│  │  (Don't scare them away!)    │    │
│  └──────────────────────────────┘    │
│                                      │
│  Example:                            │
│  ┌─────────┐ ┌─────────┐            │  ← Reference images (optional)
│  │ [img1]  │ │ [img2]  │            │     (carousel if many)
│  └─────────┘ └─────────┘            │
│                                      │
│  ┌──────────────────────────────┐    │
│  │                              │    │
│  │     📷 Tap to take photo     │    │  ← Large upload zone
│  │     or upload from gallery   │    │     (dashed border)
│  │                              │    │
│  └──────────────────────────────┘    │
│                                      │
├──────────────────────────────────────┤
│  ═══════════════════════════        │
│  [       Upload Photo        ]       │  ← Disabled until photo taken
└──────────────────────────────────────┘
```

**After Photo Captured:**

```
┌──────────────────────────────────────┐
│  ┌──────────────────────────────┐    │
│  │                              │    │
│  │    [Photo Preview]           │    │  ← Full-width preview
│  │                              │    │
│  │              ✕ Retake        │    │  ← Small retake button
│  └──────────────────────────────┘    │
│                                      │
│  [       Submit Photo        ]       │  ← Now enabled
└──────────────────────────────────────┘
```

**Interaction Flow:**
1. Tap upload zone → Camera picker (camera/gallery)
2. Capture/select photo → Preview displayed
3. Option to retake → Clears and returns to capture state
4. Submit → Upload to S3 → AI validates content

---

### 3.6 MISSION Challenge (Audio Recording)

**Purpose:** Record audio evidence (speech, sounds, singing)

**Data Model:**
```typescript
{
  type: "mission",
  challenge: {
    mission: {
      title?: string,
      description?: string,
      type: "upload-audio",
      aiInstructions?: string  // For AI validation
    }
  }
}
```

**Screen Design:**

```
┌──────────────────────────────────────┐
│  ←         Barcelona Hunt    6/7     │
├──────────────────────────────────────┤
│                                      │
│  🎤 Audio Mission                    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  SAY THE SECRET PHRASE       │    │  ← Title
│  │                              │    │
│  │  Find the plaque and read    │    │  ← Instructions
│  │  the inscription out loud    │    │
│  │  in Spanish.                 │    │
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │                              │    │
│  │     🎤 Tap to record         │    │  ← Record button
│  │                              │    │
│  └──────────────────────────────┘    │
│                                      │
├──────────────────────────────────────┤
│  ═══════════════════════════        │
│  [       Submit Recording    ]       │  ← Disabled until recorded
└──────────────────────────────────────┘
```

**Interaction Flow:**
1. Tap record → Start recording (show timer)
2. Tap stop → Preview playback
3. Option to re-record
4. Submit → Upload to S3 → AI validates

---

### 3.7 TASK Challenge (AI Text Validation)

**Screen Design Concept:**

```
┌──────────────────────────────────────┐
│  ←         Barcelona Hunt    7/7     │
├──────────────────────────────────────┤
│                                      │
│  🤖 Creative Task                    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  DESCRIBE WHAT YOU SEE       │    │
│  │                              │    │
│  │  You're standing in front    │    │
│  │  of Casa Batlló. Describe    │    │
│  │  2-3 unique architectural    │    │
│  │  features that stand out.    │    │
│  └──────────────────────────────┘    │
│                                      │
│  ┌──────────────────────────────┐    │
│  │                              │    │
│  │  [Multi-line text area]      │    │  ← Larger input (100px+)
│  │                              │    │
│  │                              │    │
│  └──────────────────────────────┘    │
│                                      │
│  Min 50 characters (23/50)          │  ← Character counter
│                                      │
├──────────────────────────────────────┤
│  [       Submit Response     ]       │
└──────────────────────────────────────┘
```

**AI Validation Response:**

```
PASSED:
┌──────────────────────────────────────┐
│  ┌──────────────────────────────┐    │
│  │  ✓ Great observation!        │    │
│  │                              │    │
│  │  You mentioned the organic   │    │  ← AI-generated feedback
│  │  shapes and colorful tiles.  │    │
│  │  Score: 8/10                 │    │
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

---

## 4. Feedback & Celebration System

### Micro-Interactions (Every Step)

| Moment | Visual | Audio | Haptic |
|--------|--------|-------|--------|
| Tap button | Scale down 0.95 | Soft click | Light tap |
| Submit answer | Button pulse | Whoosh | Medium tap |
| Loading | Spinner + shimmer | - | - |
| Correct | Confetti + bounce | Chime | Success pattern |
| Incorrect | Shake + red flash | Soft thud | Error pattern |
| Step complete | Check + slide | Ding | Strong tap |

### Celebration Hierarchy

**Small Win (Correct Answer):**
- Brief confetti burst (0.5s)
- Green checkmark bounce
- "Nice!" or "Correct!" text
- Auto-advance after 1.5s

**Medium Win (Step Complete):**
- Progress bar fills visibly
- Step counter updates
- Transition animation to next

**Big Win (Hunt Complete):**
- Full-screen celebration
- Confetti rain (2-3s)
- Trophy/badge display
- Share prompt
- Stats summary (time, attempts)

### Hunt Completion Screen

```
┌──────────────────────────────────────┐
│                                      │
│           🎊 🎉 🏆 🎉 🎊              │
│                                      │
│         HUNT COMPLETE!               │
│                                      │
│    ┌────────────────────────┐        │
│    │  Barcelona Adventure   │        │
│    │                        │        │
│    │  ⭐⭐⭐⭐⭐            │        │
│    │  Perfect Run!          │        │
│    └────────────────────────┘        │
│                                      │
│    📊 Your Stats:                    │
│    • Time: 45 minutes               │
│    • Steps: 7/7                     │
│    • Attempts: 9                    │
│    • Hints used: 1                  │
│                                      │
│    [   Share Achievement   ]         │
│    [   Back to Home        ]         │
│                                      │
└──────────────────────────────────────┘
```

---

## 5. Progress Tracking UI

### Always-Visible Progress

```
Progress Bar States:
├────────────────────────────────────┤

0%   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  (just started)
40%  ████████████░░░░░░░░░░░░░░░░░░  (step 3 of 7)
100% ██████████████████████████████  (complete!)

Step Counter: "Step 3 of 7" or "3/7"
```

### Step Dots (Alternative/Compact)

```
●  ●  ●  ○  ○  ○  ○
1  2  3  4  5  6  7
         ↑
    (current step)
```

---

## 6. Hint System

### Hint Availability
- Clue: Usually no hint needed
- Quiz: Optional hint if creator provided one
- Mission: Helpful for location hints

### Hint UI Pattern

```
HINT COLLAPSED:
┌──────────────────────────────────────┐
│  💡 Need a hint?                     │  ← Subtle, text link
└──────────────────────────────────────┘

HINT EXPANDED:
┌──────────────────────────────────────┐
│  💡 Hint                             │
│  ┌──────────────────────────────┐    │
│  │  The answer relates to a     │    │  ← Hint card (distinct bg)
│  │  famous Catalan architect    │    │
│  │  whose work you can see all  │    │
│  │  over Barcelona...           │    │
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

### Hint Usage Tracking
- Track hints used per step
- Show in completion stats
- Don't penalize, but acknowledge

---

## 7. Error & Edge Case States

### Location Permission Denied

```
┌──────────────────────────────────────┐
│  ┌──────────────────────────────┐    │
│  │  📍 Location Access Needed   │    │
│  │                              │    │
│  │  This challenge requires     │    │
│  │  location access to verify   │    │
│  │  you've reached the spot.    │    │
│  │                              │    │
│  │  [Open Settings]             │    │
│  │  [Skip this step]            │    │  ← Fallback option
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

### Network Error

```
┌──────────────────────────────────────┐
│  ┌──────────────────────────────┐    │
│  │  📡 Connection Issue         │    │
│  │                              │    │
│  │  Couldn't verify your        │    │
│  │  answer. Please check your   │    │
│  │  connection and try again.   │    │
│  │                              │    │
│  │  [Retry]                     │    │
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

### Max Attempts Reached (Future Enhancement)

```
┌──────────────────────────────────────┐
│  ┌──────────────────────────────┐    │
│  │  🔒 Out of Attempts          │    │
│  │                              │    │
│  │  You've used all 3 attempts. │    │
│  │  The answer was: 1929        │    │
│  │                              │    │
│  │  [Continue to Next Step]     │    │
│  └──────────────────────────────┘    │
└──────────────────────────────────────┘
```

---

## 8. Color & Visual System

### Challenge Type Colors (Established)

| Type | Primary Color | Icon | Use For |
|------|---------------|------|---------|
| Clue | `#6BCF7F` (Green) | MapPinIcon | Borders, accents |
| Quiz | `#5DADE2` (Blue) | QuestionIcon | Borders, accents |
| Mission | `#FF6B6B` (Coral) | CameraIcon/MapPinIcon | Borders, accents |
| Task | `#9B59B6` (Purple) | RobotIcon | Borders, accents |

### Feedback Colors

| State | Color | Usage |
|-------|-------|-------|
| Success | `#4CAF50` | Correct answers, completion |
| Error | `#F44336` | Wrong answers (soft use) |
| Warning | `#FF9800` | Hints, "almost there" |
| Neutral | `grey.200` | Default states |

### Apply via Step Type Indicator

```tsx
<StepTypeIndicator $type="quiz">
  <QuestionIcon size={20} weight="duotone" />
  Quiz Time
</StepTypeIndicator>
```

---

## 9. Technical Implementation Notes

### Key Files to Modify/Create

```
apps/frontend/player/src/
├── components/
│   └── challenges/
│       ├── ClueChallenge/         # ✅ Exists - enhance
│       ├── QuizChallenge/         # ✅ Exists - enhance
│       ├── MissionChallenge/      # 🔨 Stub → Full implementation
│       │   ├── LocationMission.tsx
│       │   ├── PhotoMission.tsx
│       │   └── AudioMission.tsx
│       └── TaskChallenge/         # AI text validation
├── components/
│   └── shared/
│       ├── FeedbackCard/          # 🆕 Reusable feedback component
│       ├── ProgressBar/           # 🆕 Step progress indicator
│       ├── HintSection/           # 🆕 Collapsible hint
│       └── CelebrationOverlay/    # 🆕 Confetti/success animations
└── hooks/
    └── useGeolocation.ts          # 🆕 Location verification hook
```

### Component Hierarchy

```
StepRenderer (existing)
├── ClueChallenge
│   └── FeedbackCard (success only)
├── QuizChallenge
│   ├── QuizChoiceChallenge
│   │   ├── OptionCard (multiple)
│   │   └── FeedbackCard
│   └── QuizInputChallenge
│       ├── TextField
│       └── FeedbackCard
├── MissionChallenge
│   ├── LocationMission
│   │   ├── MapView (lightweight)
│   │   ├── DistanceIndicator
│   │   └── FeedbackCard
│   ├── PhotoMission
│   │   ├── PhotoUploadZone
│   │   ├── PhotoPreview
│   │   └── FeedbackCard
│   └── AudioMission
│       ├── AudioRecorder
│       ├── AudioPlayback
│       └── FeedbackCard
└── TaskChallenge
```

---

## 10. Implementation Priority

### Phase 1: Core Polish (Existing Components)
1. Enhance ClueChallenge with proper animations
2. Enhance QuizChallenge feedback states (correct/incorrect)
3. Add FeedbackCard shared component
4. Add ProgressBar component

### Phase 2: Mission Implementation
1. LocationMission with geolocation API
2. PhotoMission with camera/upload
3. Distance feedback UI
4. Photo preview and retake flow

### Phase 3: Celebration & Polish
1. CelebrationOverlay for correct answers
2. Hunt completion screen
3. Sound effects (optional toggle)
4. Haptic feedback

### Phase 4: AI Validation
1. Mission Photo AI validation
2. Mission Audio AI validation
3. Task AI text validation

### Phase 5: Future (Post-MVP)
1. Hint usage tracking
2. Max attempts enforcement
3. Leaderboards/social features
4. Video missions

---

## 11. Implementation Decisions (Confirmed)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Map Provider** | Google Maps | Already used in Editor - consistent tooling |
| **Photo Source** | Camera + Gallery | More accessible for all users |
| **Audio Feedback** | Yes, with mute toggle | Adds engagement polish |
| **Animations** | CSS transitions (swappable) | Start simple, abstract for future library swap |

### Animation Abstraction Pattern

Design animations with an abstraction layer for easy library swapping:

```typescript
// utils/animations.ts
export const animations = {
  shake: 'animate-shake',
  bounce: 'animate-bounce',
  fadeIn: 'animate-fadeIn',
  confetti: () => triggerConfetti(), // Can swap implementation later
};

// Later can swap to Framer Motion:
// export const animations = {
//   shake: { x: [-10, 10, -10, 10, 0] },
//   bounce: { scale: [1, 1.1, 1] },
// };
```

### Sound Effect Abstraction

```typescript
// utils/sounds.ts
const sounds = {
  correct: '/sounds/correct.mp3',
  incorrect: '/sounds/incorrect.mp3',
  complete: '/sounds/complete.mp3',
};

export const playSound = (sound: keyof typeof sounds) => {
  if (getSoundEnabled()) {
    new Audio(sounds[sound]).play();
  }
};
```

---

## Sources & References

- [Duolingo Gamification Patterns](https://www.strivecloud.io/blog/gamification-examples-boost-user-retention-duolingo)
- [Gamification in UX Design](https://blog.logrocket.com/ux-design/ux-analysis-gamification/)
- [Mobile Game UX Trends 2025](https://medium.com/@redappletechnologies/user-experience-ux-design-trends-for-mobile-games-in-2025-ff8293c63d87)
- [Quiz App UX Best Practices](https://bootcamp.uxdesign.cc/khelgully-designing-an-engaging-experience-to-drive-quiz-ui-ux-case-study-fc293f592536)
- [Gamification Product Design 2025](https://arounda.agency/blog/gamification-in-product-design-in-2024-ui-ux)
