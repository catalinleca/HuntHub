# Architecture Decision Records (ADRs)

This folder contains Architecture Decision Records for the HuntHub Player Application.

---

## What is an ADR?

An Architecture Decision Record captures a significant architectural decision along with its context and consequences. ADRs help:

- Document **why** decisions were made
- Onboard new team members
- Revisit decisions with full context
- Avoid re-discussing settled decisions

---

## ADR Index

| ID | Title | Status | Summary |
|----|-------|--------|---------|
| [001](./001-sdk-over-iframe.md) | SDK Components Over Iframe | Proposed | Use direct React components instead of iframe + postMessage for preview |
| [002](./002-mode-prop-pattern.md) | Mode Prop Pattern | Proposed | Use `mode` prop to differentiate preview vs production behavior |
| [003](./003-pwa-over-react-native.md) | PWA Over React Native | Proposed | Build React PWA instead of React Native app |
| [004](./004-debounced-preview.md) | Debounced Preview | Proposed | Use 300ms debounce for form-to-preview sync |
| [005](./005-shared-ui-package.md) | Shared UI Package | Proposed | Create @hunthub/ui for shared theme infrastructure |

---

## Status Legend

- **Proposed** - Under discussion, not yet accepted
- **Accepted** - Approved and should be followed
- **Deprecated** - Was accepted, now replaced by newer ADR
- **Superseded** - Replaced by another ADR (link to new one)

---

## ADR Template

When creating a new ADR, use this template:

```markdown
# ADR-XXX: [Short Title]

**Status:** Proposed
**Date:** YYYY-MM-DD
**Deciders:** [Team members involved]

---

## Context

[What is the issue that we're seeing that is motivating this decision?]

---

## Decision

[What is the change that we're proposing?]

---

## Rationale

[Why is this the best choice among the alternatives?]

---

## Consequences

### Positive
- [What becomes easier?]

### Negative
- [What becomes harder?]

---

## Alternatives Considered

### [Alternative 1] (Rejected)
[Why was it rejected?]

---

## References

- [Links to relevant resources]
```

---

## Quick Summary

The key architectural decisions for the Player Application are:

1. **Same-framework advantage** - React-to-React means we can share components directly (no iframe needed)

2. **Mode prop pattern** - Same components behave differently based on `mode='preview'` vs `mode='production'`

3. **PWA is sufficient** - Web APIs provide GPS, camera, offline support without native app complexity

4. **Debounced sync** - 300ms delay prevents performance issues while feeling responsive

5. **Shared tokens, separate themes** - Common infrastructure, app-specific aesthetics

---

## Related Documents

- [Player Architecture](../PLAYER-ARCHITECTURE.md)
- [Preview Sync Details](../PREVIEW-SYNC.md)
- [Player Modes](../PLAYER-MODES.md)