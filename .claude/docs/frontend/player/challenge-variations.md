# Challenge Variations Quick Reference

7 variations. Video skipped (expensive).

────────────────────────────────────────
Type: Clue
Subtype: -
Player Action: Read & acknowledge
Validation: Auto-pass
────────────────────────────────────────
Type: Quiz
Subtype: choice
Player Action: Select option
Validation: Exact match
────────────────────────────────────────
Type: Quiz
Subtype: input
Player Action: Type answer
Validation: Fuzzy match (Levenshtein, no AI)
────────────────────────────────────────
Type: Mission
Subtype: location
Player Action: Go to GPS spot
Validation: Proximity check
────────────────────────────────────────
Type: Mission
Subtype: photo
Player Action: Take photo
Validation: AI Vision
────────────────────────────────────────
Type: Mission
Subtype: audio
Player Action: Record audio
Validation: AI Audio
────────────────────────────────────────
Type: Task
Subtype: -
Player Action: Write response
Validation: AI Text
────────────────────────────────────────

## Implementation Order

1. Build all UI (mock validation)
2. Non-AI validation: Clue, Quiz Choice, Quiz Input, Mission Location
3. AI validation: Mission Photo, Mission Audio, Task

## Details

### Clue
- Player reads info, clicks Continue
- No validation, trust-based
- Example: "Walk to the oak tree near the fountain"

### Quiz Choice
- Player picks from 2-6 options
- Server checks selectedId === targetId
- Example: "What year was this built?" → [1877, 1929, 1956]

### Quiz Input
- Player types text answer
- Fuzzy matching: case-insensitive, accent normalization, Levenshtein (2 typo tolerance)
- Creator can add alternative accepted answers
- Example: "What is the artist's name?" → "Joan Miró"

### Mission Location
- Player navigates to GPS coordinates
- Server checks distance <= radius
- Don't show exact target (that's the challenge)
- Example: "Find the salamander at Park Güell"

### Mission Photo
- Player takes or uploads photo
- AI Vision validates against criteria
- Reference thumbnails shown (tap to expand)
- Example: "Take a selfie with a pigeon"

### Mission Audio
- Player records audio clip
- AI validates content (speech-to-text)
- Example: "Say the secret phrase in Spanish"

### Task
- Player writes creative text response
- AI validates quality and relevance
- Min/max character limits
- Example: "Describe 3 architectural features you see"

## Schema Change

Add to MissionType enum: `"upload-audio"`

Current: `"upload-media" | "match-location"`
New: `"upload-media" | "match-location" | "upload-audio"`
