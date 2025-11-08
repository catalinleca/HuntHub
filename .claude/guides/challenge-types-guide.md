# Challenge Types - Design Guide

**Last updated:** 2025-10-27

## Overview

HuntHub supports **4 challenge types**, but only **3 are implemented in MVP**. The fourth (Task) is reserved for future AI validation.

---

## 1. Clue (Informational)

**Purpose:** Guide players to the next location or provide context.

**Behavior:**
- No validation required
- Auto-completes when player views it
- Used for navigation and storytelling

**Structure:**
```typescript
{
  type: 'clue',
  challenge: {
    clue: {
      title: string;
      description: string;
    }
  }
}
```

**Example (Barcelona Hunt - Step 1):**
```typescript
{
  type: 'clue',
  challenge: {
    clue: {
      title: "Welcome to your adventure!",
      description: "Your first clue is hidden near the iconic Plaça de Catalunya. Find the large fountain and locate a small plaque nearby."
    }
  },
  hint: "It mentions Barcelona's history"
}
```

---

## 2. Quiz (Questions with Validation)

**Purpose:** Test knowledge, observation, or solve riddles.

**Behavior:**
- Player answers question
- Backend validates against correct answer
- Two subtypes: multiple choice OR text input

**Structure:**
```typescript
{
  type: 'quiz',
  challenge: {
    quiz: {
      title: string;
      description?: string;
      type: 'choice' | 'input';
      target: Option;           // Correct answer
      distractors?: Option[];   // Wrong options (only for 'choice' type)

      // FUTURE (not MVP, but designed for)
      validation?: {
        mode: 'exact' | 'fuzzy' | 'contains' | 'numeric-range';
        caseSensitive?: boolean;
        range?: { min: number; max: number };
        acceptableAnswers?: string[];
      };
    }
  }
}

interface Option {
  id: string;
  text: string;
}
```

### **2a. Multiple Choice (type: 'choice')**

**Behavior:**
- Player picks from shuffled options (target + distractors)
- Backend validates: `userSelectedId === quiz.target.id`

**Example (Barcelona Hunt - Step 2):**
```typescript
{
  type: 'quiz',
  challenge: {
    quiz: {
      title: "Where was the fountain built?",
      type: 'choice',
      target: { id: "1", text: "Plaça de Catalunya" },
      distractors: [
        { id: "2", text: "Park Güell" },
        { id: "3", text: "La Rambla" },
        { id: "4", text: "Sagrada Família" }
      ]
    }
  }
}
```

**Frontend displays:** All 5 options shuffled, user picks one.

**Backend validates:** `if (userAnswer === "1") isCorrect = true`

---

### **2b. Text Input (type: 'input')**

**Behavior:**
- Player types free-form answer
- Backend validates against target text

**MVP Validation:**
- Case-insensitive exact match
- Trimmed whitespace
- `userAnswer.toLowerCase().trim() === target.text.toLowerCase().trim()`

**Example (Barcelona Hunt - Step 5):**
```typescript
{
  type: 'quiz',
  challenge: {
    quiz: {
      title: "Find the artist's signature in the mosaic. What is the name written there?",
      type: 'input',
      target: { id: "1", text: "Joan Miró" }
      // No distractors needed for input type
    }
  }
}
```

**Player types:** "joan miro" → ✅ Accepted (case-insensitive)

---

### **2c. Riddles (just a quiz with clever wording)**

**Example (Barcelona Hunt - Step 12):**
```typescript
{
  type: 'quiz',
  challenge: {
    quiz: {
      title: "A place where towers rise toward the skies, an unfinished masterpiece awaits your eyes.",
      type: 'input',
      target: { id: "1", text: "Sagrada Família" }
    }
  }
}
```

---

### **2d. Numeric Input (uses 'input' type)**

**Example (Barcelona Hunt - Step 8 - adapted from Task):**
```typescript
{
  type: 'quiz',
  challenge: {
    quiz: {
      title: "Count the number of balconies on Casa Batlló's façade",
      type: 'input',
      target: { id: "1", text: "7" }
    }
  }
}
```

**MVP:** String comparison: `"7" === "7"` ✅

**FUTURE:** Add numeric validation with range
```typescript
validation: {
  mode: 'numeric-range',
  range: { min: 6, max: 8 }  // Accept close answers
}
```

---

### **Quiz Validation - MVP vs Future**

| Feature | MVP | Future |
|---------|-----|--------|
| Multiple choice | ✅ ID matching | - |
| Text input (exact) | ✅ Case-insensitive | ✅ Case-sensitive option |
| Text input (fuzzy) | ❌ | ✅ Levenshtein distance |
| Text contains | ❌ | ✅ Partial match |
| Numeric exact | ✅ String compare | ✅ Proper numeric |
| Numeric range | ❌ | ✅ Min/max range |
| Multiple correct answers | ❌ | ✅ acceptableAnswers array |

**Implementation timeline:** Quiz advanced validation = **NEAR FUTURE** (before AI)

---

## 3. Mission (Physical Actions)

**Purpose:** Require players to DO something in the real world.

**Behavior:**
- Player uploads media OR matches location
- Backend validates media upload or GPS proximity

**Structure:**
```typescript
{
  type: 'mission',
  challenge: {
    mission: {
      title: string;
      description: string;
      type: 'upload-media' | 'match-location';
      targetAsset?: string;      // Reference image/media (optional)
      targetLocation?: Location; // For 'match-location' type
    }
  },
  requiredLocation?: Location;  // Optional: Must be here to attempt step
}
```

### **3a. Upload Media (type: 'upload-media')**

**Behavior:**
- Player takes photo/video/audio
- Uploads to backend (stored in S3)
- Auto-validates (any upload accepted)

**Example (Barcelona Hunt - Step 3):**
```typescript
{
  type: 'mission',
  challenge: {
    mission: {
      title: "Pigeon Challenge",
      description: "Take a picture of a pigeon or street performer at Plaça de Catalunya",
      type: 'upload-media'
    }
  }
}
```

**Player:** Takes photo → Uploads → ✅ Auto-accepted

---

### **3b. Match Location (type: 'match-location')**

**Behavior:**
- Player must reach specific GPS coordinates
- Backend calculates distance from target
- Validates if within radius

**Example (Barcelona Hunt - Step 10):**
```typescript
{
  type: 'mission',
  challenge: {
    mission: {
      title: "Find the multicolored salamander (El Drac)",
      description: "Locate the famous salamander statue at Park Güell",
      type: 'match-location',
      targetLocation: { lat: 41.4145, lng: 2.1527, radius: 10 }
    }
  }
}
```

**Validation:**
```typescript
const distance = calculateDistance(userCoords, targetLocation);
const isCorrect = distance <= targetLocation.radius; // Within 10 meters
```

---

### **3c. Location + Upload (Combined)**

**Example (Barcelona Hunt - Step 6):**
```typescript
{
  type: 'mission',
  requiredLocation: { lat: 41.3818, lng: 2.1713, radius: 100 },  // Must be at market
  challenge: {
    mission: {
      title: "Market Exploration",
      description: "Locate the Boqueria Market. Find a stall selling dragon fruit and snap a picture.",
      type: 'upload-media',
      targetLocation: { lat: 41.3818, lng: 2.1713, radius: 100 }
    }
  }
}
```

**Two-step validation:**
1. Player must BE at Boqueria Market (requiredLocation) to see step
2. Player uploads photo → ✅ Validated

---

### **Location Fields Clarification**

**`step.requiredLocation`** (Optional, at step level)
- **Purpose:** Geofencing - player must BE HERE to unlock/see this step
- **When to use:** Force player to visit specific location before attempting
- **Validation:** Checked BEFORE showing step content

**`mission.targetLocation`** (Optional, only for Mission challenges)
- **Purpose:** Goal location for 'match-location' missions
- **When to use:** Player must find and reach this exact spot
- **Validation:** Checked when player submits coordinates

**Can use BOTH together:**
```typescript
{
  requiredLocation: { lat: X, lng: Y, radius: 200 },    // Unlock: Must be in general area
  challenge: {
    mission: {
      targetLocation: { lat: X2, lng: Y2, radius: 5 }   // Goal: Find exact statue
    }
  }
}
```

---

## 4. Task (AI Validation) - FUTURE ONLY

**Purpose:** Open-ended questions requiring human judgment or AI validation.

**Status:**
- ✅ Schema defined
- ❌ NOT implemented in MVP
- 🤖 Reserved for AI validation feature

**Behavior (Future):**
- Player writes free-form response
- Backend sends to AI API (GPT-4, Claude, etc.)
- AI validates based on creator's criteria
- Returns pass/fail + optional feedback

**Structure:**
```typescript
{
  type: 'task',
  challenge: {
    task: {
      title: string;
      instructions: string;      // What player sees (what to do)
      aiInstructions: string;    // Prompt sent to AI for validation

      // Future extensions
      aiModel?: 'gpt-4' | 'claude' | 'gemini';
      minScore?: number;         // AI confidence threshold
    }
  }
}
```

**Example (Future Feature):**
```typescript
{
  type: 'task',
  challenge: {
    task: {
      title: "Casa Batlló Architecture",
      instructions: "Describe the unique architectural features you observe at Casa Batlló. What makes this building special?",
      aiInstructions: "Validate that the user mentions at least 2 architectural features of Casa Batlló (organic shapes, colorful mosaics, skeletal balconies, nature-inspired design). Accept creative descriptions that show real observation. Reject generic or off-topic answers."
    }
  }
}
```

**Player submits:**
```
"colorful building with wavy balconies that look like lizard eyes and a roof shaped like a dragon's back"
```

**Backend AI validation:**
```typescript
const aiPrompt = `
Task: ${task.instructions}
Validation Criteria: ${task.aiInstructions}
User's Answer: ${userInput}

Does this answer satisfy the criteria? Return JSON: { "isCorrect": boolean, "feedback": string }
`;

// AI responds: { isCorrect: true, feedback: "Great observation about the organic shapes!" }
```

**Why AI validation?**
- Tests understanding, not memorization
- Flexible criteria per creator
- Prevents copy-paste from Google
- Can be strict or lenient based on aiInstructions

**Implementation timeline:** After Quiz advanced validation, after MVP launch

**MVP behavior (temporary):**
- Editor: Show "Task (Coming Soon)" as disabled
- OR: Allow creation but backend auto-accepts all responses
- Easy to add AI endpoint later without schema changes (SOLID-O principle)

---

## Validation Summary by Type

| Challenge | Validation Method | When |
|-----------|-------------------|------|
| Clue | None (auto-pass) | On view |
| Quiz (choice) | ID matching | On submit |
| Quiz (input) | Text/numeric match | On submit |
| Mission (upload) | File received | On upload |
| Mission (location) | GPS proximity | On submit coords |
| Task | AI validation | On submit (future) |

---

## Design Principles

**1. Open/Closed Principle (SOLID-O)**
- Schema includes all 4 types NOW
- Implementation phased (3 in MVP, 1 future)
- Can add Task AI validation without modifying existing code

**2. Extensibility Points**
- Quiz validation rules (easy to add modes)
- Mission types (could add audio-only, video-only)
- Task AI providers (swap GPT-4 for Claude easily)

**3. Keep It Simple**
- MVP uses simplest validation (exact match)
- Advanced features designed but not implemented
- Add complexity only when needed

---

## Future Enhancements Roadmap

**Phase 1 (MVP):**
- ✅ Clue (auto-pass)
- ✅ Quiz (exact match only)
- ✅ Mission (upload + location)
- ⏸️ Task (schema only, not implemented)

**Phase 2 (Post-MVP - NEAR FUTURE):**
- ✅ Quiz fuzzy matching
- ✅ Quiz numeric ranges
- ✅ Quiz multiple acceptable answers

**Phase 3 (Advanced - LATER):**
- ✅ Task AI validation
- ✅ AI scoring/feedback
- ✅ Multiple AI providers
- ✅ Custom validation webhooks (creator provides own validation endpoint)

---

## Implementation Notes

**Validation logic location:** Backend only (never client-side)
- Client submits answer
- Server validates
- Never send correct answers to client (security)

**Anti-cheating:**
- Quiz: Correct answer never sent to frontend
- Mission (location): Server calculates distance, not client
- Task: AI validation server-side only

**Storage (Progress model):**
```typescript
{
  stepId: ObjectId,
  attempts: number,
  responses: [{
    timestamp: Date,
    content: unknown,  // User's answer (text, assetId, coordinates)
    isCorrect: boolean, // Server validation result
    aiScore?: number   // Optional: AI confidence (future)
  }]
}
```

---

**End of Challenge Types Guide**