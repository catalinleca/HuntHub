# Architecture Decision Records (ADRs)

Architecture decisions for the HuntHub Player Application.

---

## ADR Index

| ID | Title | Status | Summary |
|----|-------|--------|---------|
| [003](./003-pwa-over-react-native.md) | PWA Over React Native | Accepted | React PWA for mobile - no app store, same React stack |
| [004](./004-debounced-preview.md) | Debounced Preview Sync | Accepted | 300ms debounce for form-to-preview postMessage sync |
| [005](./005-shared-ui-package.md) | Shared UI Package | Accepted | @hunthub/compass for shared theming infrastructure |

---

## Key Decisions Summary

1. **Iframe + postMessage** - Editor embeds Player in iframe, communicates via postMessage (Catalyst pattern)
2. **Route-based mode separation** - `/play/:huntId` vs `/preview` determines behavior, not a mode prop
3. **PWA is sufficient** - Web APIs provide GPS, camera, offline support without native app complexity
4. **300ms debounced sync** - Prevents performance issues while feeling responsive
5. **Shared tokens, app-specific themes** - Common infrastructure via @hunthub/compass

---

## Historical Notes

ADRs 001 (SDK Over Iframe) and 002 (Mode Prop Pattern) were superseded by the Catalyst Pattern architecture decision. The new architecture uses:
- Iframe embedding instead of direct component import
- Route-based injection instead of mode props
- Thin SDK (~50 lines) instead of fat SDK with UI components

See [../ARCHITECTURE.md](../ARCHITECTURE.md) for the current architecture.

---

## Status Legend

- **Proposed** - Under discussion
- **Accepted** - Approved and should be followed
- **Superseded** - Replaced by newer decision
