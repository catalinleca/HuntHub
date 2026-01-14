# HuntHub Quality Gate Agents

Custom subagents for code quality, architecture, and reliability reviews.

## Quick Reference

| Agent | Model | Purpose | When to Run |
|-------|-------|---------|-------------|
| `data-model-steward` | Haiku | Schema sanity, invariants, migrations | Model/schema changes |
| `api-contract-guardian` | Opus | API stability, types, error envelopes | Endpoint changes |
| `ui-backend-mapper` | Opus | Frontend-backend alignment | API response changes |
| `architecture-reviewer` | Haiku | Patterns, SOLID, simplicity | Any significant code |
| `test-failure-modes` | Opus | Test coverage, reliability | Before PR / milestones |
| `security-sentinel` | Haiku | AuthZ, data exposure, anti-cheat | Auth/permission changes |
| `patterns-researcher` | Opus | Research with source quality | On-demand (foreground) |

> **Why Opus for complex tasks?** Claude Opus 4.5 uses 50-76% fewer tokens than Sonnet for equivalent tasks, making it actually cheaper despite higher per-token pricing. See [Anthropic's announcement](https://www.anthropic.com/news/claude-opus-4-5).

## How to Use

### Run a specific agent
```
"Run data-model-steward on the new PlaySession model"
"Run api-contract-guardian and ui-backend-mapper on the session endpoints"
```

### Run in background
```
"Run architecture-reviewer in the background while I implement"
```

### Run multiple agents
```
"Run all quality gates on the player session feature"
```

### Strategic usage (recommended for token efficiency)
```
Model changes    → data-model-steward
Endpoint changes → api-contract-guardian + ui-backend-mapper
Any code         → architecture-reviewer
Before PR        → test-failure-modes + security-sentinel
Novel problem    → patterns-researcher (foreground)
```

## Modifying Agents

Each agent is a markdown file with:

```markdown
---
name: agent-name
description: What it does (shown in agent list)
tools: Read, Grep, Glob, etc.
model: haiku | sonnet | opus
---

# Instructions for the agent
[What to check, how to output, rules to follow]
```

### Common modifications:

**Change model (cost/quality tradeoff):**
```yaml
model: haiku   # Cheapest, fastest
model: sonnet  # Balanced
model: opus    # Most capable, expensive
```

**Add/remove tools:**
```yaml
tools: Read, Grep, Glob           # Read-only (safe for background)
tools: Read, Grep, Glob, Bash     # Can run commands
tools: Read, Grep, Glob, WebSearch, WebFetch  # Can search web
```

**Add context files:**
Reference project docs in the agent instructions:
```markdown
## Key Files to Reference
- `.claude/your-new-doc.md`
- `apps/backend/api/src/new-folder/`
```

## Token Efficiency Tips

1. **Don't run all agents all the time** - Pick relevant ones
2. **Use Haiku for simple checks** - It's 10x cheaper than Sonnet
3. **Run full suite at milestones** - Not on every change
4. **Background agents are read-only** - They can't modify code

## Agent Output

All agents produce structured output:
- Clear verdict: ✅ APPROVED / ⚠️ NEEDS CHANGES / ❌ BLOCKED
- Specific issues with locations
- Actionable recommendations

## Creating New Agents

1. Create `your-agent-name.md` in this folder
2. Add frontmatter (name, description, tools, model)
3. Write clear instructions and output format
4. Test with a simple request

## Background vs Foreground

**Background (concurrent):**
- Read-only tools only
- No MCP access
- Auto-denies permission requests
- Good for: Reviews, checks, validation

**Foreground (blocking):**
- Full tool access
- Can use MCP tools
- Can prompt for permissions
- Good for: Research, complex analysis
