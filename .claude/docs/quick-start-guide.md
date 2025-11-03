# Quick Start Guide
## Library Management System Enhancement - Getting Started

**Version:** 1.0
**Last Updated:** 2025-11-03
**Target Audience:** Developers, Project Managers, QA Engineers

---

## 🎯 Purpose

This guide helps you quickly understand the project structure, how to use the sub-agent system, and how to start implementing the enhancement plan.

---

## 📚 Essential Reading (5-10 minutes)

Before starting, read these files in order:

1. **`.claude/tasks/context.md`** (5 min)
   - Current project status
   - Issues identified (17 total)
   - Next immediate actions

2. **`.claude/docs/codebase-analysis.md`** (Skim 10 min)
   - Comprehensive system analysis
   - Technology stack
   - Security audit results
   - Reference when needed (don't read everything now)

3. **`.claude/docs/fix-plan.md`** (5 min)
   - 6 phases, 23 tasks
   - Time estimates
   - Dependencies
   - Refer back as you work

4. **`.claude/docs/implementation-roadmap.md`** (5 min)
   - Week-by-week breakdown
   - Current week focus
   - Deliverables expected

**Total Reading Time:** 25-30 minutes

---

## 🚀 Week 1 - Day 1: Your First Tasks

### ⏰ Task 1: Install npm Dependencies (30 minutes)
**Priority:** 🔴 CRITICAL - BLOCKS ALL FRONTEND WORK

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Expected result: node_modules folder created
# Validation: No errors in output
```

**What if it fails?**
- Check Node.js version (requires Node 16+)
- Check npm version: `npm --version`
- Try: `npm install --legacy-peer-deps` (if peer dependency conflicts)
- Check internet connection

**When complete:**
- Update context.md: Mark "npm dependencies" as ✅ COMPLETED
- Proceed to Task 2

---

### ⏰ Task 2: Audit Security Vulnerabilities (1 hour)

```bash
# Still in frontend/ directory
npm audit

# See detailed report
npm audit --json > ../security-audit-npm.json
```

**What to do:**
1. Read the audit output
2. Identify the 5 moderate vulnerabilities (esbuild/vite)
3. Document findings in `.claude/docs/security-fix-report.md`
4. Proceed to fix in next task

---

### ⏰ Task 3: Fix esbuild Vulnerabilities (2-4 hours)

**Consult Sub-Agent:** Backend Expert (for impact analysis)

```bash
# Update esbuild and vite to latest versions
npm update esbuild vite

# If that doesn't work, manually update in package.json:
# "esbuild": "^0.19.0" or latest
# "vite": "^5.0.12" or latest

npm install

# Validate fix
npm audit

# Expected: 0 vulnerabilities
```

**Test after fix:**
```bash
# Run dev server to ensure no breaking changes
npm run dev

# Build production to test
npm run build
```

**When complete:**
- Update context.md: Mark "security vulnerabilities" as ✅ COMPLETED
- Run `npm audit` again to confirm

---

## 🤖 Using Sub-Agents

Sub-agents are specialized AI configurations for different aspects of the project. They provide expert guidance without implementing code directly.

### When to Use Which Sub-Agent?

| Task Type | Sub-Agent | Location |
|-----------|-----------|----------|
| UI/UX design, components, accessibility | **UI Designer** | `.claude/agents/ui-designer.json` |
| API endpoints, FastAPI, authentication | **Backend Expert** | `.claude/agents/backend-expert.json` |
| Database indexes, query optimization | **Database Optimizer** | `.claude/agents/database-optimizer.json` |
| Testing strategy, coverage, E2E tests | **Test Engineer** | `.claude/agents/test-engineer.json` |

### How to Consult a Sub-Agent

**Example 1: Fixing Arabic UI Issues (Week 2)**

```markdown
**Task:** Fix Header.tsx hardcoded English strings

**Sub-Agent to Consult:** UI Designer

**What to ask:**
"I need to fix hardcoded English strings in Header.tsx (lines 62, 72).
Please provide:
1. Exact translation keys to add to LanguageContext.tsx
2. Code changes needed in Header.tsx
3. How to test in both Arabic and English
4. Any RTL considerations"

**Expected Output from Sub-Agent:**
- Detailed design specification in `.claude/docs/ui-design-header-fix.md`
- Translation keys needed
- Component modification specs
- Testing checklist
```

**Example 2: Database Performance (Week 5)**

```markdown
**Task:** Analyze and optimize database indexes

**Sub-Agent to Consult:** Database Optimizer

**What to ask:**
"Please analyze the Loan model queries and recommend indexes.
Focus on:
1. Check-out/check-in operations
2. Overdue loan queries
3. Multi-tenant performance"

**Expected Output from Sub-Agent:**
- Optimization report in `.claude/docs/db-optimization-loans.md`
- EXPLAIN ANALYZE results
- CREATE INDEX statements
- Expected performance improvements
```

### Sub-Agent Output Format

All sub-agents create documentation in `.claude/docs/` with specific naming:

- **UI Designer:** `ui-design-[feature].md`
- **Backend Expert:** `backend-spec-[feature].md`
- **Database Optimizer:** `db-optimization-[area].md`
- **Test Engineer:** `test-plan-[feature].md`

---

## 📋 Daily Workflow

### Morning Standup (5 minutes)

```markdown
1. Check .claude/tasks/context.md
   - What's the current phase?
   - What's the active task?

2. Check implementation-roadmap.md
   - What week are we in?
   - What are today's tasks?

3. Review yesterday's progress
   - What was completed?
   - Any blockers?
```

### During Work

```markdown
1. Read task from fix-plan.md or implementation-roadmap.md
2. Identify if sub-agent consultation needed
3. Consult sub-agent (if needed) - get specification
4. Implement the task
5. Test thoroughly
6. Update context.md with completion ✅
7. Move to next task
```

### End of Day (10 minutes)

```markdown
1. Update context.md:
   - Mark completed tasks as ✅
   - Note any blockers
   - Update "Active Tasks" section

2. Commit changes:
   git add .
   git commit -m "feat: [description of work]"

3. Document lessons learned (if significant)
```

---

## 🔥 Week 1 Complete Checklist

By end of Week 1, you should have:

- [ ] npm dependencies installed (node_modules exists)
- [ ] Zero npm security vulnerabilities (`npm audit` clean)
- [ ] Automated database backup system implemented
- [ ] FastAPI updated to 0.121.0
- [ ] Uvicorn updated to 0.38.0
- [ ] Critical Python packages updated
- [ ] All Week 1 tests pass (backend + frontend)
- [ ] Context.md updated with Week 1 completion

**Validation:**
```bash
# Frontend
cd frontend
npm audit  # Should show 0 vulnerabilities
npm run build  # Should succeed

# Backend
cd backend
python --version  # Should be 3.11+
pytest  # All tests should pass
```

---

## 📖 Common Scenarios

### Scenario 1: "I found a bug not in the analysis"

1. Document it in `.claude/docs/bugs/bug-[description].md`
2. Add to context.md under "Known Issues"
3. Determine priority (CRITICAL/HIGH/MEDIUM/LOW)
4. If CRITICAL, escalate immediately
5. If not critical, add to backlog for future phase

### Scenario 2: "A sub-agent's recommendation seems wrong"

1. Sub-agents provide guidance, not gospel
2. Use your engineering judgment
3. Document why you deviated (in code comments or docs)
4. Update context.md with the decision made

### Scenario 3: "Task is taking 2x longer than estimated"

1. Check if you're blocked (missing info, dependencies)
2. Document blocker in context.md
3. Break task into smaller sub-tasks
4. If still blocked, escalate to project manager
5. Consider moving to next task and returning later

### Scenario 4: "Need to test in Arabic"

1. Start frontend: `npm run dev`
2. Open browser: http://localhost:5173
3. Click language switcher (usually top-right)
4. Select "العربية" (Arabic)
5. Verify:
   - All text is Arabic
   - Layout is RTL (right-to-left)
   - Icons flipped correctly
   - Navigation works

---

## 🛠️ Useful Commands Reference

### Frontend

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Security audit
npm audit
```

### Backend

```bash
# Activate virtual environment (Windows)
.\venv\Scripts\activate

# Activate virtual environment (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload

# Run tests
pytest

# Run tests with coverage
pytest --cov=app --cov-report=html

# Database migrations
alembic upgrade head  # Apply migrations
alembic revision --autogenerate -m "description"  # Create new migration

# Check outdated packages
pip list --outdated

# Run Celery worker
celery -A app.core.celery_app worker --loglevel=info
```

### Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

### Git

```bash
# Check status
git status

# Add all changes
git add .

# Commit with message
git commit -m "feat: description"

# Push to remote
git push origin branch-name

# Create new branch
git checkout -b feature/name
```

---

## 📁 Project File Structure (Quick Reference)

```
Library-Management-System/
├── .claude/                          # 🧠 Project brain
│   ├── tasks/
│   │   └── context.md               # ⭐ START HERE - Current status
│   ├── docs/
│   │   ├── codebase-analysis.md     # Full analysis report
│   │   ├── fix-plan.md              # 6-phase plan (23 tasks)
│   │   ├── implementation-roadmap.md # 8-week breakdown
│   │   └── quick-start-guide.md     # This file
│   └── agents/                       # 🤖 Sub-agent configs
│       ├── ui-designer.json
│       ├── backend-expert.json
│       ├── database-optimizer.json
│       └── test-engineer.json
│
├── frontend/                         # React app
│   ├── src/
│   │   ├── components/              # UI components
│   │   ├── pages/                   # 21 pages (all using shadcn/ui)
│   │   ├── contexts/                # LanguageContext (900+ translations)
│   │   ├── store/                   # Redux state management
│   │   └── utils/                   # Utilities (sanitize.ts for XSS)
│   ├── package.json                 # npm dependencies
│   └── vite.config.ts               # Build configuration
│
├── backend/                          # FastAPI app
│   ├── app/
│   │   ├── api/v1/                  # API endpoints
│   │   ├── models/                  # Database models
│   │   ├── schemas/                 # Pydantic schemas
│   │   ├── core/                    # Security, permissions
│   │   └── tasks/                   # Celery tasks
│   ├── requirements.txt             # Python dependencies
│   ├── alembic/                     # Database migrations
│   └── tests/                       # Pytest tests (19 files)
│
├── docker-compose.yml               # Multi-service orchestration
├── CLAUDE.md                        # System architecture reference
└── README.md                        # Project overview
```

---

## 🎯 Your First Hour Checklist

**Complete these tasks in your first hour:**

- [ ] Read context.md (5 min)
- [ ] Skim codebase-analysis.md (10 min)
- [ ] Read this guide (10 min)
- [ ] Install npm dependencies (30 min)
- [ ] Run `npm audit` and document results (5 min)

**After first hour, you should:**
- ✅ Understand the project status
- ✅ Know what Phase we're in
- ✅ Have frontend dependencies installed
- ✅ Know where to find information
- ✅ Be ready to start fixing security vulnerabilities

---

## 💡 Pro Tips

1. **Always read context.md first** - It's the single source of truth for current status

2. **Update context.md frequently** - As you complete tasks, update it immediately

3. **Use sub-agents for design decisions** - Don't guess, consult the expert

4. **Test in both languages** - Arabic must work perfectly, not just English

5. **Commit often** - Small, incremental commits are easier to review and rollback

6. **Document as you go** - Future you (or other devs) will thank you

7. **When stuck, check these in order:**
   - context.md (current status)
   - fix-plan.md (task details)
   - codebase-analysis.md (technical details)
   - CLAUDE.md (architecture reference)
   - Sub-agent configuration (expert guidance)

8. **Weekend planning** - Friday afternoon, review next week's roadmap

---

## 🆘 Getting Help

### If you're stuck on a technical issue:

1. **Check existing documentation:**
   - `.claude/docs/codebase-analysis.md` (technical details)
   - `CLAUDE.md` (architecture, patterns)
   - Code comments in relevant files

2. **Consult appropriate sub-agent:**
   - UI issue? → UI Designer
   - API issue? → Backend Expert
   - Database issue? → Database Optimizer
   - Testing issue? → Test Engineer

3. **Search codebase for similar code:**
   ```bash
   # Example: Find how authentication is done
   grep -r "require_permissions" backend/app/api/v1/
   ```

4. **Check git history for context:**
   ```bash
   git log --oneline --grep="keyword"
   ```

### If you're stuck on project direction:

1. Re-read `context.md` "Main Objectives"
2. Check `implementation-roadmap.md` for current week's focus
3. Review `fix-plan.md` for task dependencies

---

## 🎬 Quick Start Script (Copy-Paste)

**Day 1, First 30 Minutes:**

```bash
# 1. Navigate to project
cd "E:\Library-Management Project\lbs-enhance\Library-Management-System"

# 2. Read the project brain
cat .claude/tasks/context.md

# 3. Install frontend dependencies (CRITICAL)
cd frontend
npm install

# 4. Check for vulnerabilities
npm audit

# 5. Verify installation
ls node_modules  # Should see many folders

# 6. Try running dev server
npm run dev
# Should start on http://localhost:5173

# 7. Stop server (Ctrl+C)

# 8. Navigate back to root
cd ..

# 9. Check backend setup
cd backend
python --version  # Should be 3.11+

# 10. Activate venv (Windows)
.\venv\Scripts\activate

# 11. Check backend can run
uvicorn app.main:app --reload
# Should start on http://localhost:8000

# 12. Stop server (Ctrl+C)

# You're ready to start Week 1 tasks! 🚀
```

---

## 📞 Escalation Matrix

| Issue Type | Severity | Action | Timeline |
|------------|----------|--------|----------|
| Build broken (can't run app) | CRITICAL | Stop all work, fix immediately | < 2 hours |
| Security vulnerability found | HIGH | Document, assess impact, fix same day | < 1 day |
| Week 1 tasks delayed >2 days | HIGH | Review scope, escalate to PM | < 1 day |
| Task 2x over estimate | MEDIUM | Document blocker, continue with other tasks | < 3 days |
| Minor bug found | LOW | Add to backlog, fix in appropriate phase | Next phase |

---

## ✅ Success Criteria

**You'll know you're on track if:**

- ✅ Week 1 tasks completed by Friday
- ✅ Context.md stays updated (reflects reality)
- ✅ Zero security vulnerabilities remain
- ✅ All tests passing
- ✅ Arabic language works perfectly (100% coverage)
- ✅ You can answer: "What phase are we in?" instantly
- ✅ You know which sub-agent to consult for each task type

---

## 🎉 Ready to Start!

You're now ready to begin Week 1 of the enhancement plan!

**Next Steps:**
1. ✅ You've read this guide
2. 🔥 Install npm dependencies (30 min)
3. 🔥 Fix security vulnerabilities (2-4 hours)
4. 🔥 Continue with Week 1 tasks from implementation-roadmap.md

**Remember:**
- Update context.md as you work
- Consult sub-agents for design decisions
- Test in both English and Arabic
- Commit often

**Good luck! 🚀**

---

**Last Updated:** 2025-11-03
**Questions?** Check context.md or consult appropriate sub-agent
**Status:** 📋 READY TO START WEEK 1
