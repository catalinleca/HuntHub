# HuntHub Player Documentation

**Architecture:** Catalyst Pattern (Iframe + Thin SDK + Self-Contained Player)

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete design and implementation plan.

---

## Quick Summary

| Concept | Description |
|---------|-------------|
| **Player App** | Self-contained in `apps/frontend/player/` |
| **Routes** | `/play/:huntId` (production) and `/preview` (embedded in editor) |
| **SDK** | Thin (~50 lines) - just postMessage wrapper, no UI/logic |
| **Pattern** | Behavior injection - same `<PlayerUI />`, different validators/handlers |

---

## Key Architecture Decisions

1. **Iframe embedding** - Editor embeds Player via iframe, communicates via postMessage
2. **Route-based mode separation** - Not a mode prop; different routes with different behavior
3. **Self-contained Player** - All player code in one place, not split across packages
4. **Thin SDK** - Only types and postMessage wrapper (~200 lines max)
5. **Admin controls in preview route** - Toggle panels live in Player App, not Editor

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Full architecture, implementation phases, code examples |
| [COMPASS-LIBRARY.md](./COMPASS-LIBRARY.md) | Shared theming infrastructure (@hunthub/compass) |
| [decisions/](./decisions/) | Architecture Decision Records (ADRs) |

---

## Reference

- **Efecta/Catalyst comparison:** See ARCHITECTURE.md for how this mirrors proven production patterns
- **Backend Player API:** See `.claude/guides/player-api-design.md`
- **Full implementation plan:** See `.claude/plans/greedy-tinkering-hamster.md`
