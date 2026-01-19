# Play Flow Architecture

## Quick Reference

| Flow | Entry | Code Path |
|------|-------|-----------|
| **Share** | `/play/{slug}` | `PlayPage` → `useGetHuntInfo` (gate) → `PlaySessionProvider` → `usePreviewMode` (no token) → `RegularFlow` → `useSessionLogic` → `useSessionLayer`. Shows PlayerIdentification, saves to localStorage, server-driven nav. |
| **Preview** | `/play/{slug}?preview={token}` | `PlayPage` → `useGetHuntInfo` (bypass if token) → `PlaySessionProvider` → `usePreviewMode` (has token) → `PreviewFlow` → `usePreviewSession` (auto-POST). Free nav via local `currentStepIndex`, `isStepSynced` guard prevents stale data. |

---

## 1. Share Link Flow

```
[EDITOR] SharePanel reads hunt.playSlug → builds URL: /play/{slug} → user copies
    │
    ▼
[PLAYER] PlayPage.tsx extracts playSlug from URL params
    │
    ▼
[PLAYER] PlayPageWithSlug calls useGetHuntInfo(slug) → if !isReleased → "Not available yet"
    │
    ▼
[PLAYER] PlaySessionProvider → usePreviewMode() reads ?preview param → null → RegularFlow
    │
    ▼
[PLAYER] RegularFlow → useSessionLogic → useSessionLayer checks localStorage(playSlug) → no session
    │
    ▼
[PLAYER] PlayPageContent: !hasSession → renders PlayerIdentification form
    │
    ▼
[PLAYER] User submits → startSession() → POST /api/play/{slug}/start { playerName }
    │
    ▼
[BACKEND] PlayService.startSession() → creates HuntProgress → returns { sessionId, hunt, currentStepId }
    │
    ▼
[PLAYER] handleSessionStarted() saves sessionId to localStorage → useStepLayer(sessionId, stepId) fetches step
    │
    ▼
[PLAYER] ApiValidationProvider wraps StepRenderer → validation saves progress, advances via cache invalidation
```

---

## 2. Preview Link Flow

```
[EDITOR] SharePanel → usePreviewLink() → GET /api/hunts/{id}/preview-link
    │
    ▼
[BACKEND] PreviewLinkService.generatePreviewLink() → JWT { huntId, exp: 1h } → { previewUrl, expiresIn }
    │
    ▼
[PLAYER] PlayPage.tsx extracts playSlug, detects ?preview param via useSearchParams
    │
    ▼
[PLAYER] PlayPageWithSlug: hasPreviewToken=true → bypasses isReleased check → renders PlaySessionProvider
    │
    ▼
[PLAYER] PlaySessionProvider → usePreviewMode() → { isPreviewMode: true, previewToken: JWT } → PreviewFlow
    │
    ▼
[PLAYER] PreviewFlow → usePreviewSession(slug, token) → useQuery auto-POSTs /start { playerName: "Preview", previewToken }
    │
    ▼
[BACKEND] PlayService.startSession() → PreviewTokenHelper.validate(JWT) → creates session(isPreview=true) → returns { stepOrder }
    │
    ▼
[PLAYER] PreviewFlow: local currentStepIndex + isStepSynced guard → PreviewToolbar (◀ ▶) + StepRenderer
    │
    ▼
[PLAYER] Validation: ApiValidationProvider passes stepId → POST /validate { stepId } → backend validates but saves NOTHING
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
