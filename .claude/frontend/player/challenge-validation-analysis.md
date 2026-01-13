# Challenge Types - Treasure Hunt Validation

Analysis of whether the 7 challenge variations make sense for a treasure hunt app.

---

## Type-by-Type Analysis

### Clue ✓ Perfect fit
Classic treasure hunt element. "Walk to the fountain and look for the mosaic" or "The next location is where artists gather."
- No validation needed - it's narrative/guidance
- Every treasure hunt needs these as connective tissue between challenges

### Quiz Choice ✓ Solid
"What year was this cathedral built?" while standing in front of it
- Forces players to actually observe/read plaques
- Great for educational/historical hunts
- Easy to create, easy to validate

### Quiz Input ✓ Good
"What name is inscribed on the statue?" - they must find and read it
- Harder than choice - proves engagement
- Levenshtein handles "Joan Miro" vs "Joan Miró" vs "joan miro"
- Creator can add alternative accepted answers

### Mission Location ✓ Core mechanic
"Find the secret garden" with only hints, no exact address
- This IS treasure hunting
- GPS proximity is perfect validation
- Combine with vague clues for mystery

### Mission Photo ✓ Great
"Take a selfie with a pigeon" or "Photo of the dragon sculpture"
- Proof of presence + fun memories
- Shareable content (social aspect)
- AI Vision validates actual completion

### Mission Audio ⚠️ Niche but valid
Use cases:
- "Say the secret phrase in Spanish" (language learning)
- "Record yourself saying what you learned" (educational)
- "Sing the first line of [song]" (party/fun hunts)

Concerns:
- Noisy outdoor environments might affect recognition
- More awkward in public than taking photos
- Limited use cases compared to other types

Verdict: Keep it, but it'll be used less frequently. Good for variety.

### Task ✓ Valuable
"Describe 3 architectural features you see" or "Write a haiku about this place"
- Forces observation and reflection
- Great for team-building, educational, creative hunts
- AI validates relevance/quality

---

## Treasure Hunt Fit Summary

| Type | Fit | Expected Usage |
|------|-----|----------------|
| Clue | ★★★★★ Essential | Very High |
| Quiz Choice | ★★★★☆ Great | High |
| Quiz Input | ★★★★☆ Great | Medium-High |
| Mission Location | ★★★★★ Essential | Very High |
| Mission Photo | ★★★★★ Excellent | High |
| Mission Audio | ★★★☆☆ Niche | Low |
| Task | ★★★★☆ Great | Medium |

---

## What's NOT Included (and why)

### QR Code Scanning
- Hunt itself is accessed via QR code (would be confusing)
- Requires physical setup (printing/placing codes)
- Could be future Mission subtype

### Time Pressure
- Not a challenge type, it's a modifier
- Could add optional `timeLimit` field on any step
- Post-MVP

### Riddles/Puzzles
- Can be done as Quiz Input where answer is decoded word
- Infrastructure already supports this

---

## UX Considerations for Implementation

### AI Validation Failure
What happens when AI incorrectly rejects valid submission?
- Retry button (obvious)
- After N failures: skip with penalty? Contact creator?
- Design fallback UX

### Offline Mode (Post-MVP)
- GPS works offline
- AI validation needs internet
- Consider queuing submissions

### Accessibility (Post-MVP)
- Audio mission: deaf players
- Photo mission: visually impaired
- Location mission: mobility issues
- Show accessibility indicators in editor

---

## Conclusion

The 7 types cover the core treasure hunt experience. Audio is the weakest fit but adds variety for specific use cases. Nothing critical missing for MVP.