# Claude Code Memory for HuntHub

This directory contains **project memory** for Claude Code.

Every time you start Claude Code in this project, all these files automatically load, giving Claude full context about your project.

## 📁 Structure

```
.claude/
├── README.md                    # This file
├── application-overview.md      # What HuntHub is, target users, features
├── requirements.md              # Functional/non-functional requirements
├── project-state.md             # Current focus, recent work, next steps
├── behavior/
│   └── principles.md            # How Claude should think and work
├── backend/
│   ├── architecture.md          # Tech stack, patterns, data flow
│   ├── patterns.md              # Code conventions and examples
│   └── current-state.md         # What's done, what's pending
├── frontend/
│   └── overview.md              # Frontend plans (placeholder)
└── deployment/
    └── strategy.md              # Deployment plans (placeholder)
```

## 🔄 How It Works

**Main orchestrator:** `/Users/catalinleca/leca/HuntHub/CLAUDE.md`

This file imports all the context files using `@path/to/file.md` syntax.

When you start Claude Code:
```bash
cd /Users/catalinleca/leca/HuntHub/backend
claude
```

Claude automatically loads `CLAUDE.md`, which imports everything in `.claude/`, giving full project context.

## ✏️ How to Update Memory

### Option 1: Quick Add (for brief notes)

Start your message with `#` and Claude will prompt where to save it:
```
# Remember: We're using Zod for validation
```

### Option 2: Edit Directly (recommended for organized updates)

```bash
/memory
```

This opens all memory files in your editor. Update relevant sections.

### Option 3: Manual Edit

Just edit the markdown files directly in `.claude/` directory.

## 📝 What to Update & When

### After defining requirements
→ Update `application-overview.md` and `requirements.md`

### After making architecture decisions
→ Update `backend/architecture.md` or `requirements.md` (technical decisions)

### After completing features
→ Update `backend/current-state.md` (move items from ❌ to ✅)

### When changing focus
→ Update `project-state.md` (current focus, recent work)

### When establishing new patterns
→ Update `backend/patterns.md` with examples

### Starting frontend work
→ Update `frontend/overview.md` with tech stack and architecture

### Planning deployment
→ Update `deployment/strategy.md`

## 🎯 Best Practices

**Be specific:** "Use 2-space indentation" not "use good style"

**Keep it current:** Update after major changes, not weeks later

**Organize by concern:** Don't dump everything in one file

**Use examples:** Show code patterns, not just descriptions

**Mark TODOs clearly:** Use `[TO BE DEFINED]` for decisions needed

**Update project-state.md regularly:** Keep "recent work" and "current focus" accurate

## 🚫 What NOT to Put in Memory

❌ **Code implementations** - Memory is for patterns and context, not full code
❌ **Temporary notes** - Use comments in code instead
❌ **Secrets/credentials** - Never commit secrets
❌ **Generated files** - Don't document generated types, schemas

## 🔍 Debugging Memory Issues

**Claude doesn't have context?**
- Check that `CLAUDE.md` exists in project root
- Verify `@imports` use correct paths
- Run `/memory` to see what's loaded

**Too much context?**
- Memory files can nest up to 5 levels
- If too large, split into more focused files

**Context out of date?**
- Update `project-state.md` and `backend/current-state.md`
- These should reflect the current state

## 💡 Pro Tips

1. **Commit to Git:** These files help your team understand the project
2. **Review before major features:** Update requirements first
3. **Use as documentation:** Memory files double as project docs
4. **Keep patterns fresh:** Update patterns as conventions evolve

## 🔗 Related

- Main memory file: `/Users/catalinleca/leca/HuntHub/CLAUDE.md`
- Claude Code docs: https://docs.claude.com/en/docs/claude-code/memory
