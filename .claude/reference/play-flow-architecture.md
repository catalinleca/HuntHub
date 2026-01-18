# Play Flow Architecture

## 1. Share Link Flow

```
[EDITOR] User clicks Share button
    │
    ▼
[EDITOR] Read hunt.playSlug from hunt data
    │
    ▼
[EDITOR] Build URL: http://localhost:5175/play/YQ7r9B
    │
    ▼
[EDITOR] User copies link
    │
    ▼
[PLAYER] User opens /play/YQ7r9B in browser
    │
    ▼
[PLAYER] Router extracts playSlug="YQ7r9B" from URL
    │
    ▼
[PLAYER] Call GET /api/play/YQ7r9B
    │
    ▼
[BACKEND] Find hunt where playSlug="YQ7r9B"
    │
    ▼
[BACKEND] Return { name, accessMode, isReleased }
    │
    ▼
[PLAYER] If not released → show "Not available yet"
    │
    ▼
[PLAYER] If released → show "Enter your name" form
    │
    ▼
[PLAYER] User submits name
    │
    ▼
[PLAYER] Call POST /api/play/YQ7r9B/start { playerName }
    │
    ▼
[BACKEND] Find hunt by playSlug
    │
    ▼
[BACKEND] Create HuntProgress session
    │
    ▼
[BACKEND] Return { sessionId, hunt, currentStepId }
    │
    ▼
[PLAYER] Save sessionId to localStorage[playSlug]
    │
    ▼
[PLAYER] Show first step, user plays hunt
```

---

## 2. Preview Link Flow

```
[EDITOR] User clicks Share button
    │
    ▼
[EDITOR] Call GET /api/hunts/1037/preview-link
    │
    ▼
[BACKEND] Generate JWT { huntId: 1037, isPreview: true, exp: 1hour }
    │
    ▼
[BACKEND] Build URL: /play/YQ7r9B?preview=JWT
    │
    ▼
[BACKEND] Return { previewUrl, expiresIn }
    │
    ▼
[EDITOR] Show preview URL in SharePanel
    │
    ▼
[EDITOR] User copies preview link
    │
    ▼
[PLAYER] User opens /play/YQ7r9B?preview=JWT
    │
    ▼
[PLAYER] Detect ?preview= query param exists
    │
    ▼
[PLAYER] Skip "not released" check (allow unreleased hunts)
    │
    ▼
[PLAYER] Show "Enter your name" form
    │
    ▼
[PLAYER] User submits name
    │
    ▼
[PLAYER] Call POST /api/play/YQ7r9B/start { playerName, previewToken: JWT }
    │
    ▼
[BACKEND] Validate JWT token
    │
    ▼
[BACKEND] Create session with isPreview=true
    │
    ▼
[BACKEND] Return { sessionId, hunt, stepOrder: [...], isPreview: true }
    │
    ▼
[PLAYER] Show PreviewToolbar with ◀ ▶ arrows
    │
    ▼
[PLAYER] User can navigate steps freely with arrows
    │
    ▼
[PLAYER] User submits answer
    │
    ▼
[PLAYER] Call POST /api/validate { answer, stepId }
    │
    ▼
[BACKEND] Run real validation logic
    │
    ▼
[BACKEND] DON'T save attempts, DON'T advance step
    │
    ▼
[BACKEND] Return { correct, feedback }
    │
    ▼
[PLAYER] Show result (can test same step again)
```

---

## Key Differences

| Aspect | Share Link | Preview Link |
|--------|------------|--------------|
| URL | `/play/YQ7r9B` | `/play/YQ7r9B?preview=JWT` |
| Works before release | No | Yes |
| Navigation | Step by step only | Free with arrows |
| Validation | Saves progress | Dry run only |
| Expires | Never | 1 hour |
