# HuntHub Player App - UI/UX Design Brief

## Project Context

Design a **mobile-first treasure hunt player application** that allows users to experience location-based scavenger hunts created by others. This is the **player-facing side** of HuntHub - where the adventure happens.

---

## Core Purpose

Players scan a QR code or click a link to access a treasure hunt. The app guides them step-by-step through real-world locations, presenting clues, challenges, and missions. The experience should feel **immersive and adventure-focused**, not like using software.

**Key Principle:** The app should be invisible - players should feel like they're on an adventure, not navigating an interface.

---

## User Flow

```
1. ENTRY → Scan QR code or click link
2. INTRODUCTION → Hunt details, stats (time/distance), "Start Adventure" button
3. STEP LOOP (repeat for each step):
   - Show progress (where am I in the journey?)
   - Display step content (clue, question, mission)
   - Present challenge interface (location check, quiz, photo, task)
   - Validate completion
   - Celebrate success
   - Auto-advance to next step
4. COMPLETION → Celebration screen, stats summary, photos, share options
```

---

## Step Types to Design For

### 1. Location Check
- **Purpose:** Player must physically reach a location
- **UI Needs:**
  - Clue/description box (readable, poetic)
  - Real-time distance indicator (large, prominent)
  - Direction hint (optional compass/arrow)
  - "Check Location" button (disabled until within radius, then enabled with animation)
  - "Open Map" button (opens native maps or integrated map)
  - Hint system (expandable)

### 2. Quiz Challenge
- **Purpose:** Answer a question correctly
- **UI Needs:**
  - Question text
  - Multiple choice options (radio buttons or cards)
  - "Submit Answer" button
  - Immediate feedback (✅ green celebration for correct, ❌ red shake for wrong)
  - Try again or skip option on wrong answer

### 3. Photo Mission
- **Purpose:** Take a photo at the location
- **UI Needs:**
  - Mission description
  - Photo preview area (before/after)
  - "Take Photo" button (native camera integration)
  - Retake option
  - "Looks Good" confirmation button

### 4. Task Completion
- **Purpose:** Complete a specific task (count, observe, find)
- **UI Needs:**
  - Task description
  - Input field (number, text, or choice depending on task)
  - "Submit" button
  - Validation feedback

### 5. Final/Goal Step
- **Purpose:** Last step, often a special location
- **UI Needs:**
  - Similar to Location Check but with prominent "Complete Hunt!" button
  - Build anticipation

---

## UX Principles

1. **One Thing at a Time** - Each screen shows a single step, single challenge
2. **Clear Hierarchy** - Progress → Title → Content → Challenge → Action
3. **Thumb-Friendly** - All interactive elements in lower 2/3 of screen
4. **Breathing Room** - Generous padding, not cramped
5. **Immediate Feedback** - Every action gets instant visual response
6. **Progressive Disclosure** - Show what's needed now, hide complexity
7. **Celebration Over Completion** - Make success feel rewarding

---

## Visual Design Direction

### Design Tone: Adventure & Exploration
- **NOT:** Corporate, technical, database-like
- **YES:** Vibrant, exciting, game-like, inviting

### Color Palette
```
Primary (CTA/Accents):  #FF6B35 (Adventure Orange)
Success:                #4CAF50 (Green)
Error:                  #F44336 (Red)
Info:                   #2196F3 (Blue)

Backgrounds:
- Start Screen: Light → Vibrant gradient (#F5F7FA → #E8F4F8)
- Active Hunt: Warm gradient (#FFF9F0 → #FFE8D6)
- Completion: Celebration gradient (#FFE5E5 → #FFF4E6)
```

### Typography
```
Hunt Title:     32px, Bold (exciting, large)
Step Title:     24px, Semibold
Body Text:      16px, Regular, Sans-serif
Clue Text:      18px, Medium, Serif or handwriting-style (adds character)
Hints:          14px, Italic
Buttons:        16px, Semibold
```

### Component Styling
```
Buttons:
- Primary: Full-width (minus padding), 48px height, orange background
- Rounded corners: 8-12px
- Hover/tap: Scale effect + ripple

Cards/Boxes:
- Background: White or light cream
- Border-radius: 16px
- Shadow: Soft, subtle elevation
- Padding: 20-24px

Progress Indicator:
- Dots: 12px diameter, 8px gap
- Active: Filled, larger, colored
- Completed: Checkmark
- Upcoming: Outline, muted
```

---

## Key Screens to Design

### 1. Hunt Introduction Screen
```
Components:
- Exit button (top-left, small)
- Hero icon/image (large, centered)
- Hunt title (bold, 32px)
- Hunt description (engaging copy, 2-4 lines)
- Quick stats icons: 📍 X locations, ⏱️ ~X minutes, 🚶 X km
- Creator credit: "Created by @username"
- Primary CTA: "Start Adventure" (large, prominent, orange)

Design Notes:
- Vibrant gradient background
- Build excitement and anticipation
- Set expectations clearly
```

### 2. Step Display Screen (Main Playing Interface)
```
Components:
- Progress indicator at top: ● ● ○ ○ ○ + "Step 2 of 5"
- Step icon and title: "📍 Find the Fountain"
- Divider line
- Content area (clue/question/mission)
- Challenge UI (type-specific)
- Primary action button
- Hint link (subtle, at bottom)

Design Notes:
- Single column, vertical scroll if needed
- Maximum focus on current step
- Clear visual hierarchy
- Generous white space
```

### 3. Location Check State Variations
```
Far away state:
- Gray distance indicator
- "You're 247m away"
- "Keep going! →"
- Disabled button (grayed out)

Getting close:
- Orange distance indicator
- "You're 68m away"
- "Almost there! 🔥"
- Button starts to activate

Within range:
- Green distance indicator
- "✅ You're here!"
- "Ready to check in!"
- Button enabled, pulsing animation
```

### 4. Quiz Feedback States
```
Correct answer:
- Green flash animation
- Selected option highlighted green
- Checkmarks appear
- "Correct! 🎉 Nice work!"
- Auto-advance after 1.5s OR "Continue" button

Wrong answer:
- Red shake animation
- Selected option highlighted red
- "Not quite! Try again?"
- Show "Try Again" and "Skip Question" buttons
```

### 5. Completion Screen
```
Components:
- Animated celebration (confetti, trophy, sparkles)
- "Hunt Complete! ✨" heading
- Hunt name reminder
- Stats summary in cards:
  * ⏱️ Time taken
  * 🚶 Distance walked
  * ✅ Challenges completed
  * 📸 Photos taken
- Action buttons:
  * "Share Results 📤" (primary)
  * "View Photos 📷" (secondary)
  * "Try Another Hunt" (secondary)
- Exit link (small, bottom)

Design Notes:
- Maximum celebration vibes
- Animation sequence: Trophy appears → Confetti → Stats count up
- Make them feel accomplished
```

---

## Animations & Micro-interactions

```
Screen transitions:
- Step to step: Slide left/right (300ms)
- Modal open: Slide up from bottom (250ms)

Element animations:
- Button tap: Scale down to 0.95 (100ms) + ripple effect
- Success: Scale up + fade in (300ms)
- Error: Horizontal shake (400ms, 3 oscillations)
- Progress dot complete: Fill animation (200ms)
- Distance update: Number count animation (500ms)

Celebration moments:
- First step: "🎉 Great start!"
- Halfway: "🔥 You're halfway there!"
- Near end: "💪 Almost done!"
```

---

## Responsive Design

### Mobile Portrait (Primary)
- Full-width layout
- 16px horizontal padding
- Stack all elements vertically
- Buttons full-width

### Tablet
- More breathing room (24px padding)
- Slightly larger text
- Same vertical flow

### Desktop (if needed)
- Centered container (max-width: 480px)
- Larger padding on sides
- Maintain mobile-like experience

---

## Additional Features

### Integrated Map View (Modal/Overlay)
- Target location marked
- User's current location (blue dot)
- Distance and direction display
- "Navigate There" button (opens native maps)
- Close button (top-right)

### Hint System
```
Collapsed: [Need a hint? 🤔]
Expanded: 
- Hint text in card
- Optional point cost display
- "Got it ✓" button to dismiss
```

### Error States
```
Location permission denied:
- Icon + clear message
- "Enable Location" button
- "Maybe Later" option

Network error:
- Icon + friendly message
- "Retry" button

Hunt not found:
- Icon + clear message
- "Go Home" button
```

---

## What Makes This Different

### NOT Like:
- A form to fill out
- A settings panel
- A task management app
- A navigation app

### YES Like:
- A game you're playing
- A story you're experiencing
- An adventure companion
- A treasure map come to life

---

## Design Goals

1. **Immediate clarity** - User always knows what to do next
2. **Progress visibility** - Always show where they are in the journey
3. **Celebration moments** - Make completing steps feel rewarding
4. **Minimal friction** - Reduce clicks, reduce thinking, increase doing
5. **Mobile-first** - Designed for phone in hand, walking around
6. **Emotionally engaging** - Create anticipation, excitement, satisfaction

---

## Technical Constraints

- Mobile web app (responsive, works in browser)
- Needs to work in various lighting conditions (outdoor use)
- Touch targets minimum 44x44px
- Works with location services (GPS)
- Camera integration for photo challenges
- Network resilience (handle spotty connections)

---

## Success Metrics for Design

- Can a new user start and complete a hunt without instructions?
- Does it feel like an adventure or like work?
- Do users want to share their completion?
- Do users want to try another hunt?
- Does the app "disappear" during use (user focuses on hunt, not UI)?

---

## Deliverables Needed

1. Hunt Introduction Screen
2. Location Check Step (all 3 states: far, close, arrived)
3. Quiz Challenge Step (with correct/wrong feedback)
4. Photo Mission Step
5. Completion Screen
6. Progress Indicator Component
7. Map View Modal
8. Error State Examples

---

## Final Note

The best treasure hunt player app is one that users forget they're using because they're so immersed in the adventure. Every design decision should ask: "Does this help the player feel like an explorer, or does this remind them they're using an app?"

Design for delight, discovery, and the joy of completing something meaningful in the real world.
