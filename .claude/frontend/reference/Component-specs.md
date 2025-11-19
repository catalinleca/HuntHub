# 📋 DOCUMENT PURPOSE
**Type:** Implementation Reference
**Use when:** Building components, need exact specs
**Contains:** Component hierarchy, styling values, animations, responsive breakpoints
**For:** Development, coding reference

🎨 Component Visual Reference
A visual guide to understanding the HuntHub Editor component structure.

📐 Layout Overview
┌─────────────────────────────────────────────────────────────────┐
│  TopBar (Fixed)                                                  │
│  ┌──────────┐ ┌──────────────┐        ┌─────────┐ ┌─────────┐ │
│  │ Logo     │ │ Hunt Name    │        │ Status  │ │ Actions │ │
│  └──────────┘ └──────────────┘        └─────────┘ └─────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  TimelineHeader                                                  │
│  ┌─────────────────────────┐            ┌──────────────────┐   │
│  │ Steps (4)               │            │ [+ Add Step]     │   │
│  │ Create your adventure   │            └──────────────────┘   │
│  └─────────────────────────┘                                    │
├─────────────────────────────────────────────────────────────────┤
│  StepsScrollArea (Horizontal Scroll)                            │
│  ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐                 │
│  │  1   │ →  │  2   │ →  │  3   │ →  │  4   │                 │
│  │ 📍  │    │ ❓  │    │ 📷  │    │ 🏆  │                 │
│  │Step  │    │Quiz  │    │Photo │    │Final │                 │
│  └──────┘    └──────┘    └──────┘    └──────┘                 │
│       ↓ (when selected)                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ExpandedStepPanel                                        │  │
│  │ ┌────────────────────────────────────────────────────┐  │  │
│  │ │ 📍 Step 1: Welcome                           [×]   │  │  │
│  │ ├────────────────────────────────────────────────────┤  │  │
│  │ │ Step Title: [________________________]             │  │  │
│  │ │ Step Type:  [Location ▼]                          │  │  │
│  │ │ Clue Text:  [________________________]             │  │  │
│  │ │             [________________________]             │  │  │
│  │ │ Location:   [________________________]             │  │  │
│  │ │ Radius:     [50] meters                           │  │  │
│  │ │                                                    │  │  │
│  │ │            [Delete]  [Save Changes]               │  │  │
│  │ └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
🎯 Component Breakdown
1. EditorContainer
   <EditorContainer>
   // Root container
   // 100vh height
   // Warm cream background
   // Flex column layout
   </EditorContainer>
   Purpose: Main wrapper for entire editor Styling: Full viewport, flex column, overflow hidden

2. TopBar
   ┌─────────────────────────────────────────────────┐
   │ 🗺️ HuntHub    City Explorer Hunt    💾 ⚙️ 📤 │
   └─────────────────────────────────────────────────┘
   Components:

Logo (🗺️ HuntHub)
Hunt Name (editable)
Save Status Indicator
Preview Toggle Button
Settings Button
Publish Button
Styling: Fixed position, white background, shadow

3. TimelineHeader
   ┌──────────────────────────────────────────────┐
   │ Steps (4)                     [+ Add Step]   │
   │ Create your adventure journey                │
   └──────────────────────────────────────────────┘
   Purpose: Section header with count and actions Styling: Flexbox, space-between, border-bottom

4. StepCard (Multiple Instances)
   ┌──────────┐
   │    1     │  ← StepNumber (48x48 circle)
   │   📍    │  ← StepIcon (2.5rem)
   │ Fountain │  ← Title (body2, bold)
   │  Clue    │  ← Type badge
   ├──────────┤
   │ 5m away  │  ← Location info (optional)
   └──────────┘
   States:

Default: Compact view, subtle shadow
Hover: Lift effect, shows quick actions
Selected: Border glow, expanded panel below
Styling:

180px × 160px
16px border radius
Smooth transitions
Hover: translateY(-8px)
5. ConnectorArrow
   →
   Purpose: Visual connection between steps Styling: 40px width, centered, opacity transitions

6. AddStepButton
   ┌───┐
   │ + │
   └───┘
   Purpose: Insert step between existing steps Styling: Dashed border, hover becomes solid

7. ExpandedStepPanel
   ┌─────────────────────────────────────────────┐
   │ 📍 Step 1: Welcome to the Hunt        [×]  │
   │ ─────────────────────────────────────────── │
   │                                             │
   │ Step Title:                                 │
   │ [_______________________________________]   │
   │                                             │
   │ Clue Text:                                  │
   │ [_______________________________________]   │
   │ [_______________________________________]   │
   │                                             │
   │ 📍 Location: Central Park Fountain         │
   │ Radius: 50m        [Edit Location on Map]  │
   │                                             │
   │               [Delete]  [Save Changes]      │
   └─────────────────────────────────────────────┘
   Animation: Slide down (300ms ease-out) Styling:

Full width minus padding
White background
20px border radius
Deep shadow
Form Elements:

TextField (title, clue, location)
Select (step type)
Number input (radius)
Buttons (delete, save)
8. PreviewPanel (Optional/Toggleable)
   ┌──────────────┐
   │ 📱 Preview   │
   │ ────────────  │
   │   ┌──────┐   │
   │   │ 📱  │   │ ← MobileFrame
   │   │ [🔔] │   │
   │   │      │   │
   │   │ Hunt │   │
   │   │ Name │   │
   │   │      │   │
   │   └──────┘   │
   └──────────────┘
   Position: Fixed right, full height Width: 380px Features:

Mobile phone frame with notch
Realistic device appearance
Live preview area
Slide in/out animation
🎨 Step Type Visual Guide
Location (📍)
┌──────────┐
│    1     │
│   📍    │  Color: #6BCF7F (Green)
│ Location │
│  Check   │
└──────────┘
Quiz (❓)
┌──────────┐
│    2     │
│   ❓    │  Color: #5DADE2 (Blue)
│   Quiz   │
│ Challenge│
└──────────┘
Photo (📷)
┌──────────┐
│    3     │
│   📷    │  Color: #FF6B6B (Coral)
│  Photo   │
│ Challenge│
└──────────┘
Final (🏆)
┌──────────┐
│    4     │
│   🏆    │  Color: #9B59B6 (Purple)
│  Final   │
│   Goal   │
└──────────┘
🎭 State Visualizations
Empty State
┌──────────────────────────────────────┐
│                                      │
│           🎯                         │
│    Start Your Adventure!             │
│                                      │
│    Click "Add Step" to create        │
│    your first step                   │
│                                      │
│      [+ Add First Step]              │
│                                      │
└──────────────────────────────────────┘
Save Status Indicators
Saved

● All changes saved    (Green dot)
Saving

◉ Saving...           (Pulsing yellow dot)
Unsaved

● Unsaved changes     (Red dot)
📱 Responsive Layouts
Desktop (1200px+)
┌─────────────────────────────────┬──────────┐
│                                 │ Preview  │
│   Timeline (horizontal)         │  Panel   │
│   [Card] [Card] [Card]          │  ┌────┐  │
│                                 │  │📱 │  │
│   Expanded Panel                │  │    │  │
│   [Edit Form]                   │  └────┘  │
│                                 │          │
└─────────────────────────────────┴──────────┘
Tablet (768px - 1199px)
┌─────────────────────────────────┐
│   Timeline (horizontal)         │
│   [Card] [Card] [Card]          │
│                                 │
│   Expanded Panel                │
│   [Edit Form]                   │
│                                 │
│   [👁️ View Preview]  (Modal)    │
└─────────────────────────────────┘
Mobile (< 768px)
┌────────────┐
│  Timeline  │
│  (vertical)│
│  ┌──────┐  │
│  │Card 1│  │
│  └──────┘  │
│  ┌──────┐  │
│  │Card 2│  │
│  └──────┘  │
│            │
│  [Edit]    │
└────────────┘
🎨 Color Usage Map
Component              Primary Use        Accent Color
─────────────────────  ─────────────────  ────────────
TopBar                 Background         None
Save Status            Text/Icon          Green/Yellow/Red
Buttons                Background         Primary (#FF6B6B)
Step Cards             Border on hover    Type-specific
Expanded Panel         Background         White
Input Fields           Border on focus    Primary
Preview Panel          Background         Paper white
Connector Arrows       Icon color         Text secondary
🎯 Interaction Patterns
Click Step Card
Before:                After:
┌──────┐              ┌══════┐  ← Bold border
│  1   │              ║  1   ║
│ 📍  │   Click →    ║ 📍  ║
└──────┘              ╚══════╝
↓
┌─────────┐
│ [Form]  │
└─────────┘
Hover Step Card
Default:              Hover:
┌──────┐              ┌──────┐
│  1   │              │✏️ 🗑️ │  ← Quick actions
│ 📍  │   Hover →    │  1   │  ↑ Lifted
└──────┘              │ 📍  │
└──────┘
Add Step Between
[Card 1]  →  [Card 2]

Hover between:
[Card 1]  [+]  [Card 2]  ← Insert button appears
📏 Spacing Reference
Component Spacing:

Card to Card:         16px gap
Section Padding:      24-32px
Form Fields:          16px vertical
Panel Padding:        32px
Button Padding:       10px 24px
Icon to Text:         8px gap
🎬 Animation Timings
Interaction           Duration    Easing
────────────────────  ─────────   ──────────────────
Card hover            0.3s        cubic-bezier(0.4, 0, 0.2, 1)
Panel expand          0.3s        ease-out
Button hover          0.2s        ease-in-out
Save status pulse     1.5s        ease-in-out (loop)
Connector fade        0.2s        ease-in-out
Preview slide         0.3s        ease-in-out
🔍 Z-Index Layers
Layer                 Z-Index
────────────────────  ───────
Timeline              1
Step Actions          2
Preview Panel         5
TopBar                10
Modals                1300
Tooltips              1500
This visual reference should help you understand the component structure and styling at a glance!
