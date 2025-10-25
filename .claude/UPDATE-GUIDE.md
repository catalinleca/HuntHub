# Context Update Guide

**This file tells you (and Claude) which files to update in different scenarios.**

Use this as a checklist when updating context after work sessions.

---

## 📋 All Context Files (Complete Map)

```
/Users/catalinleca/leca/HuntHub/
├── CLAUDE.md                              # Main orchestrator (imports all)
└── .claude/
    ├── README.md                          # Guide for memory system
    ├── UPDATE-GUIDE.md                    # This file
    ├── application-overview.md            # What, who, why of HuntHub
    ├── requirements.md                    # Functional & non-functional requirements
    ├── project-state.md                   # Current focus, recent work, next steps
    ├── behavior/
    │   └── principles.md                  # How Claude thinks and works
    ├── backend/
    │   ├── architecture.md                # Tech stack, patterns, data flow
    │   ├── patterns.md                    # Code conventions & examples
    │   └── current-state.md               # What's done, what's pending
    ├── frontend/
    │   └── overview.md                    # Frontend tech & architecture
    └── deployment/
        └── strategy.md                    # Deployment & infrastructure
```

---

## 🎯 Update Scenarios

### When defining requirements
**Update these:**
- [ ] `application-overview.md` - Fill in [TO BE DEFINED] sections
- [ ] `requirements.md` - Add functional/non-functional requirements
- [ ] `project-state.md` - Update "Questions to Resolve"

**Command to Claude:**
> "Update requirements context with: [explain requirements]"

---

### When completing a feature
**Update these:**
- [ ] `backend/current-state.md` - Move from ❌ to ✅
- [ ] `project-state.md` - Update "Recent Work" and "What's Working Now"
- [ ] `backend/patterns.md` - Add new patterns if established

**Command to Claude:**
> "Update backend state - we just completed [feature name]"

---

### When making architecture decisions
**Update these:**
- [ ] `backend/architecture.md` - Document the decision
- [ ] `requirements.md` - Update technical decisions section
- [ ] `backend/patterns.md` - Add code patterns if relevant

**Command to Claude:**
> "Update architecture context - we decided to [decision]"

---

### When changing tech stack
**Update these:**
- [ ] `backend/architecture.md` - Update tech stack section
- [ ] `backend/patterns.md` - Update code patterns for new tech
- [ ] `project-state.md` - Note the change in recent work

**Command to Claude:**
> "Update tech stack context - we switched from [X] to [Y]"

---

### When starting a new work session
**Read these first:**
- [ ] `project-state.md` - See current focus
- [ ] `backend/current-state.md` - See what's pending
- [ ] `requirements.md` - Check any TODOs

**Command to Claude:**
> "What's the current state and what should we work on?"

---

### When ending a work session
**Update these:**
- [ ] `project-state.md` - Update "Recent Work" and "Last updated"
- [ ] `backend/current-state.md` - Update implementation status
- [ ] Add git commit summary if major work done

**Command to Claude:**
> "End of session - update context with today's work: [summary]"

---

### When establishing new code patterns
**Update these:**
- [ ] `backend/patterns.md` - Add pattern with example
- [ ] `backend/architecture.md` - If pattern affects architecture

**Command to Claude:**
> "Document this pattern: [explain pattern]"

---

### When answering "TO BE DEFINED" questions
**Update these:**
- [ ] `requirements.md` - Replace [TO BE DEFINED] with decision
- [ ] `project-state.md` - Remove from "Questions to Resolve"
- [ ] Relevant architecture file if technical decision

**Command to Claude:**
> "Define this requirement: [explain]"

---

### When changing project direction
**Update these:**
- [ ] `project-state.md` - Update "Current Focus"
- [ ] `requirements.md` - Adjust scope/priorities
- [ ] Relevant component files (backend/frontend/deployment)

**Command to Claude:**
> "Update project direction - we're now focusing on [new focus]"

---

### When starting frontend work
**Update these:**
- [ ] `frontend/overview.md` - Define tech stack and architecture
- [ ] `project-state.md` - Update "Current Focus"
- [ ] `requirements.md` - Any frontend-specific requirements

**Command to Claude:**
> "We're starting frontend - tech stack is [stack]"

---

### When planning deployment
**Update these:**
- [ ] `deployment/strategy.md` - Document hosting, CI/CD, etc.
- [ ] `project-state.md` - Update focus if switching to deployment
- [ ] `requirements.md` - Update non-functional requirements

**Command to Claude:**
> "Update deployment plans: [explain strategy]"

---

## 🔧 Quick Commands for Claude

Instead of "update context", use these specific commands:

| Say This | Claude Updates |
|----------|---------------|
| "Update requirements with..." | application-overview.md, requirements.md |
| "Update backend state - completed [X]" | backend/current-state.md, project-state.md |
| "Document this architecture decision..." | backend/architecture.md, requirements.md |
| "Document this code pattern..." | backend/patterns.md |
| "End of session summary..." | project-state.md, backend/current-state.md |
| "Define this requirement..." | requirements.md, project-state.md |

---

## ⚠️ Files That Rarely Change

These should stay stable once defined:

- `behavior/principles.md` - Only update if working style changes
- `CLAUDE.md` - Only update if adding new context files
- `.claude/README.md` - Only update if memory system changes
- `UPDATE-GUIDE.md` - Only update if adding new scenarios

---

## 🎯 Claude's Checklist When Told "Update Context"

If the user says the vague "update context", Claude should:

1. Ask: "Which aspect? Requirements, backend state, architecture, or session summary?"
2. Or be smart and infer from conversation:
   - Just defined requirements? → Update requirements files
   - Just completed a feature? → Update backend state files
   - Just made architecture decision? → Update architecture files
   - End of session? → Update project-state and current-state

---

## 📝 Template for Session End Updates

When ending a session, use this template:

**project-state.md:**
- Update "Last updated" date
- Update "Recent Work" section
- Add to "What's Working Now" if applicable

**backend/current-state.md:**
- Move completed items from ❌ to ✅
- Add new pending items if discovered
- Update "Next Steps" if priorities changed

**Commit if needed:**
```bash
git add .claude/
git commit -m "Update context: [brief summary]"
```
