# .claude Directory - Project Brain

This directory contains all the context, plans, and documentation for the Library Management System enhancement project.

## 📁 Directory Structure

### `/tasks/`
**Purpose:** Current project state and active tasks  
**Key File:** `context.md` - The main brain of the project

### `/docs/`
**Purpose:** Design documents created by sub-agents  
**Structure:**
- `ui-design-[feature].md` - UI design plans
- `backend-plan-[feature].md` - Backend implementation plans
- `database-plan-[feature].md` - Database optimization plans
- `test-plan-[feature].md` - Testing strategies

### `/errors/`
**Purpose:** Error logs and their solutions  
**Format:** `[error-type]-[date].log`

### `/agents/`
**Purpose:** Sub-agent configuration files  
**Files:**
- `ui-designer.json` - UI/UX specialist configuration
- `backend-expert.json` - Backend developer configuration
- `database-optimizer.json` - Database specialist configuration
- `test-engineer.json` - Testing specialist configuration

### `/archives/`
**Purpose:** Old context files when they get too large  
**Format:** `context-[date].md`

## 🔄 Workflow

1. **Read** `context.md` at start of each session
2. **Delegate** tasks to sub-agents (they create plans in `/docs/`)
3. **Implement** based on plans
4. **Document** errors in `/errors/`
5. **Update** `context.md` with progress
6. **Archive** old context when needed

## 🚫 Do NOT

- Delete files from this directory
- Edit manually unless instructed
- Commit sensitive information
- Put large data in context.md (use separate files)

## ✅ Do

- Keep context.md up to date
- Save all error logs
- Preserve all design documents
- Archive when context gets too large (>2000 lines)

---
This directory is the memory system for the project. Treat it with care!