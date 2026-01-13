# Player Challenge Implementation Plan

**Context dump for session continuity. Not human-readable prose.**

---

## DECIDED: 7 Challenge Variations (MVP)

```
TYPE        SUBTYPE         PLAYER_ACTION           VALIDATION
─────────────────────────────────────────────────────────────────
clue        -               read & continue         auto-pass
quiz        choice          select option           exact match (targetId === selectedId)
quiz        input           type text               fuzzy match (Levenshtein, case-insensitive, accent-normalized, 2 typo tolerance)
mission     match-location  go to GPS spot          proximity check (distance <= radius)
mission     upload-media    take/upload photo       AI Vision
mission     upload-audio    record audio            AI Audio (speech-to-text + validation)
task        -               write text response     AI Text
```

**SKIPPED:** Video (expensive, post-MVP)

**Implementation order:**
1. Build ALL UI first (mock validation)
2. Non-AI validation: clue, quiz-choice, quiz-input, mission-location
3. AI validation: mission-photo, mission-audio, task

---

## CURRENT STATE: Schema

**File:** `packages/shared/openapi/hunthub_models.yaml`

### MissionType enum (line 48)
```yaml
# CURRENT:
MissionType:
  type: string
  enum: [upload-media, match-location]

# NEEDS:
MissionType:
  type: string
  enum: [upload-media, match-location, upload-audio]
```

### Existing schemas (COMPLETE):
- Clue: title, description ✓
- Quiz: title, description, type, options, targetId, expectedAnswer, randomizeOrder, validation (with acceptableAnswers) ✓
- Mission: title, description, type, referenceAssetIds, targetLocation, aiInstructions, aiModel ✓
- Task: title, instructions, aiInstructions, aiModel ✓

### Player Format schemas (exist, strip answers):
- CluePF, QuizPF, MissionPF, TaskPF, ChallengePF, StepPF, HuntMetaPF ✓

### Answer validation schemas (exist):
- AnswerType enum: clue, quiz-choice, quiz-input, mission-location, mission-media, task ✓
- Payload schemas for each type ✓

---

## CURRENT STATE: Editor Forms

**Path:** `apps/frontend/editor/src/pages/Hunt/HuntSteps/`

### MissionInput.tsx
```
HAS:
- title, description
- type toggle (upload-media | match-location)
- location section (for match-location)
- media attachment

MISSING:
- upload-audio as 3rd type option
- referenceAssetIds picker (for upload-media - shows example photos to player)
- aiInstructions field in UI (defined in getFieldNames but NOT rendered)
```

### QuizInput.tsx
```
HAS:
- title, description
- type toggle (choice | input)
- options + targetId (for choice)
- expectedAnswer (for input)
- media attachment

OPTIONAL:
- validation.acceptableAnswers array for text input (schema supports, UI doesn't expose)
```

### TaskInput.tsx
```
COMPLETE:
- title
- instructions (shown to player)
- aiInstructions (for AI validation)
- media attachment
```

### ClueInput.tsx
```
ASSUMED COMPLETE (not inspected but simple)
```

---

## CURRENT STATE: Player App

**Path:** `apps/frontend/player/src/`

### Existing components (from previous session):
- StepRenderer - routes by step.type
- ClueChallenge - basic, needs enhancement
- QuizChallenge - basic, needs enhancement
- MissionChallenge - stub only

### Needs implementation:
- LocationMission (Google Maps, GPS)
- PhotoMission (camera/gallery, preview, retake)
- AudioMission (record, playback)
- TaskChallenge (textarea, character counter)

### Shared components needed:
- FeedbackCard (correct/incorrect/loading states)
- ProgressBar (visual only, no numbers)
- HintSection (collapsible)
- CelebrationOverlay (confetti, success animation)
- TypeBadge (challenge type indicator with icon + color)
- StepLayout (wrapper with TopBar, ProgressBar, sticky action area)

---

## IMPLEMENTATION PHASES

### Phase 1: Schema Change
```
1. Edit packages/shared/openapi/hunthub_models.yaml
   - Line 48: Add upload-audio to MissionType enum
2. Run: npm run generate
3. Verify: @hunthub/shared types updated
```

### Phase 2: Editor - MissionInput
```
File: apps/frontend/editor/src/pages/Hunt/HuntSteps/MissionInput.tsx

1. Add 3rd mission type option:
   { value: MissionType.UploadAudio, label: 'Record Audio', icon: <MicrophoneIcon /> }

2. Add referenceAssetIds field (for upload-media):
   - Asset picker component
   - Shows thumbnails of selected reference images
   - Stored as number[] of assetIds

3. Add aiInstructions field (for upload-media and upload-audio):
   - FormTextArea
   - Conditional render based on missionType
   - Placeholder: "Describe what the AI should look for..."
```

### Phase 3: Editor - QuizInput (Optional)
```
File: apps/frontend/editor/src/pages/Hunt/HuntSteps/QuizInput.tsx

Add alternative answers for text input:
- Show when type === 'input'
- Array of strings
- Path: validation.acceptableAnswers
```

### Phase 4: Player - Shared Components
```
Path: apps/frontend/player/src/components/shared/

1. FeedbackCard/
   - Props: variant ('success' | 'error' | 'loading'), message, details
   - Green/red styling, icon, animation

2. ProgressBar/
   - Props: current, total
   - Visual fill only, no text
   - Theme primary color

3. HintSection/
   - Props: hint, onReveal, revealed
   - Collapsible, subtle CTA

4. CelebrationOverlay/
   - Confetti burst
   - Auto-dismiss after 1.5s
```

### Phase 5: Player - Challenge Components
```
Path: apps/frontend/player/src/components/challenges/

1. ClueChallenge/ (enhance existing)
   - Add fade-in animation
   - Add FeedbackCard on continue
   - Reading delay before button enabled (500ms)

2. QuizChallenge/ (enhance existing)
   - QuizChoiceChallenge: option cards, selection state, feedback
   - QuizInputChallenge: text field, submit, feedback
   - Shake animation on wrong, confetti on correct

3. MissionChallenge/
   - LocationMission: Map view, distance indicator, GPS check button
   - PhotoMission: Upload zone, camera/gallery, preview, retake, submit
   - AudioMission: Record button, playback, submit

4. TaskChallenge/
   - Textarea with character counter (min/max)
   - Submit button
   - AI validation feedback
```

### Phase 6: Player - Integration
```
1. StepRenderer routes to correct component based on:
   - step.type (clue, quiz, mission, task)
   - step.challenge.quiz.type (choice, input)
   - step.challenge.mission.type (upload-media, match-location, upload-audio)

2. Mock validation for all types (returns success after delay)

3. Hunt completion screen
```

### Phase 7: Backend - Validation (after UI complete)
```
1. Non-AI validators:
   - ClueValidator: always pass
   - QuizChoiceValidator: targetId === payload.optionId
   - QuizInputValidator: fuzzy match (Levenshtein)
   - LocationValidator: haversine distance <= radius

2. AI validators:
   - PhotoValidator: call vision API with aiInstructions
   - AudioValidator: speech-to-text + validate content
   - TaskValidator: call text API with aiInstructions
```

---

## VERIFICATION CHECKLIST

### Schema
- [ ] `npm run generate` succeeds
- [ ] MissionType has 3 values: upload-media, match-location, upload-audio
- [ ] Types exported from @hunthub/shared

### Editor
- [ ] MissionInput shows 3 type options
- [ ] MissionInput shows referenceAssetIds for photo type
- [ ] MissionInput shows aiInstructions for photo/audio types
- [ ] Can create step of each type and save

### Player
- [ ] ClueChallenge renders and advances
- [ ] QuizChoiceChallenge renders options, accepts selection
- [ ] QuizInputChallenge renders input, accepts text
- [ ] LocationMission renders map, checks GPS
- [ ] PhotoMission opens camera/gallery, shows preview
- [ ] AudioMission records and plays back
- [ ] TaskChallenge renders textarea, tracks characters
- [ ] All show FeedbackCard on submit
- [ ] ProgressBar updates on step complete
- [ ] Hunt completion screen shows on last step

---

## DOCUMENTATION FILES

```
.claude/frontend/player/
├── challenge-variations.md        # Quick reference (7 types)
├── challenge-validation-analysis.md  # Business analysis (treasure hunt fit)
├── player-step-design.md          # Full UI/UX specs
└── IMPLEMENTATION-PLAN.md         # THIS FILE
```

---

## KEY DESIGN DECISIONS (CONFIRMED)

1. Progress bar only, no step numbers (mystery feel)
2. No step navigation (linear journey)
3. Reference images as thumbnails, tap to expand
4. Google Maps (consistent with editor)
5. Camera + gallery for photo missions
6. Audio with mute toggle
7. CSS animations first, abstract for future library swap
8. AI validation AFTER all UI built
9. Fuzzy text matching uses Levenshtein (no AI)
10. Task (AI text) is MVP, not future
11. Audio Mission is MVP, not future
12. Video is POST-MVP (expensive)

---

## ⚠️ DESIGN DOC INCONSISTENCY TO FIX

**File:** `player-step-design.md`

Lines 42, 61-64, 99, 161, 661 show "Step 3/7" counter.
**Decision was:** NO step numbers, progress bar only.

Fix needed: Remove step counter references, keep only visual progress bar.

---

## TYPE BADGES (from design doc Section 2.1)

Display distinct badge per challenge subtype:

```
TYPE        BADGE LABEL         ICON              COLOR
────────────────────────────────────────────────────────
clue        📜 CLUE             ScrollIcon        #6BCF7F (green)
quiz/choice ❓ QUIZ             QuestionIcon      #5DADE2 (blue)
quiz/input  🔐 PUZZLE           KeyIcon           #5DADE2 (blue)
mission/loc 📍 LOCATION         MapPinIcon        #FF6B6B (coral)
mission/pho 📸 PHOTO MISSION    CameraIcon        #FF6B6B (coral)
mission/aud 🎤 AUDIO MISSION    MicrophoneIcon    #FF6B6B (coral)
task        ⚡ CHALLENGE        LightningIcon     #9B59B6 (purple)
```

Badge derived from step.type + challenge.subtype at render time.

---

## FEEDBACK COLORS

```
SUCCESS   #4CAF50   correct answers, completion
ERROR     #F44336   wrong answers (soft use)
WARNING   #FF9800   hints, "almost there"
NEUTRAL   grey.200  default states
```

---

## MICRO-INTERACTIONS

```
MOMENT          VISUAL              AUDIO         HAPTIC
─────────────────────────────────────────────────────────
tap button      scale 0.95          soft click    light tap
submit          button pulse        whoosh        medium tap
loading         spinner + shimmer   -             -
correct         confetti + bounce   chime         success pattern
incorrect       shake + red flash   soft thud     error pattern
step complete   check + slide       ding          strong tap
```

---

## ERROR STATES TO IMPLEMENT

### Location Permission Denied
- Show explanation why needed
- Button: "Open Settings"
- Fallback: "Skip this step" (optional)

### Network Error
- "Connection Issue" message
- Button: "Retry"

### Max Attempts Reached (future)
- Show correct answer
- Button: "Continue to Next Step"

---

## LAYOUT STRUCTURE (viewport)

```
┌──────────────────────────────────────┐
│  ← Back         Hunt Name            │  ← TopBar (48px) - NO step counter
├──────────────────────────────────────┤
│  ═══════════════════════════════════ │  ← Progress Bar (6px, visual only)
│  ┌──────────────────────────────┐    │
│  │  📸 PHOTO MISSION            │    │  ← Type Badge
│  └──────────────────────────────┘    │
│  ┌──────────────────────────────┐    │
│  │      CHALLENGE CONTENT       │    │  ← Scrollable
│  └──────────────────────────────┘    │
├──────────────────────────────────────┤
│  💡 Need a hint?                     │  ← Hint link (if available)
│  [    Primary Action Button    ]     │  ← STICKY Bottom
└──────────────────────────────────────┘
```

Always in viewport: progress bar, type badge, core question, action button.
Can scroll: long descriptions, reference images, hint section.

---

## CELEBRATION HIERARCHY

### Small Win (Correct Answer)
- Brief confetti burst (0.5s)
- Green checkmark bounce
- "Nice!" or "Correct!" text
- Auto-advance after 1.5s

### Medium Win (Step Complete)
- Progress bar fills visibly
- Transition animation to next step

### Big Win (Hunt Complete)
- Full-screen celebration
- Confetti rain (2-3s)
- Trophy/badge display
- Stats summary (time, attempts, hints used)
- Share button
- Back to home button

---

## HUNT COMPLETION SCREEN

```
Stats to show:
- Total time
- Steps completed (X/X)
- Total attempts
- Hints used
- Star rating (based on performance? or player rates hunt?)
```

---

## HOOKS NEEDED

```typescript
useGeolocation()     // GPS position + permission handling
useAudioRecorder()   // MediaRecorder API wrapper
useCamera()          // Camera access + file selection
useConfetti()        // Trigger confetti animation
useHaptics()         // Vibration API wrapper
useSounds()          // Audio playback with mute toggle
```

---

## CROSS-REFERENCE FILES

Read these for full context:
- `player-step-design.md` - Full UI/UX specs with ASCII wireframes
- `challenge-variations.md` - Quick reference (7 types)
- `challenge-validation-analysis.md` - Business analysis (treasure hunt fit)
