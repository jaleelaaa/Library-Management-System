# Library Management System - Ministry Enhancement Project
## Context & Project State

---

## 📊 Project Overview

**Project Name:** Library Management System - Ministry Enhancement  
**Version:** 2.0.0  
**Target:** Oman Ministry of Education  
**Status:** 🟢 Active Development  
**Started:** [DATE]  
**Last Updated:** [DATE]

**Mission:** Transform existing library system into ministry-grade application with:
- Arabic-first interface (RTL)
- Government-level security
- Modern UI (Shadcn components)
- Automated testing (Playwright)
- High performance & accessibility

---

## 🏗️ Current Architecture

### Frontend
- **Framework:** React 18.2 + TypeScript
- **Build Tool:** Vite 5.0
- **State:** Redux Toolkit + React Query
- **Styling:** Tailwind CSS + Shadcn UI
- **Routing:** React Router 6.21

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Search:** Elasticsearch 8.11
- **ORM:** SQLAlchemy 2.0
- **Tasks:** Celery + Flower

### Infrastructure
- **Container:** Docker + Docker Compose
- **Proxy:** Nginx (production)
- **CI/CD:** GitHub Actions
- **Testing:** Vitest (unit) + Playwright (E2E)

---

## 🤖 Available Sub-Agents

### 1. UI Designer (@ui-designer)
**Expertise:** Shadcn UI, Arabic interfaces, Government design  
**Config:** `.claude/agents/ui-designer.json`  
**Status:** ✅ Active  
**Use For:** UI component selection, layout design, RTL planning

### 2. Backend Expert (@backend-expert)
**Expertise:** FastAPI, API design, Security, Performance  
**Config:** `.claude/agents/backend-expert.json`  
**Status:** ✅ Active  
**Use For:** API endpoint design, business logic planning, security

### 3. Database Optimizer (@database-optimizer)
**Expertise:** PostgreSQL, Query optimization, Indexing  
**Config:** `.claude/agents/database-optimizer.json`  
**Status:** ✅ Active  
**Use For:** Database schema, query optimization, migrations

### 4. Testing Engineer (@test-engineer)
**Expertise:** Playwright, E2E testing, Accessibility testing  
**Config:** `.claude/agents/test-engineer.json`  
**Status:** ✅ Active  
**Use For:** Test scenario creation, test planning, QA

---

## ✅ Completed Tasks

### ✓ Task 1: Initial Setup (Completed: [DATE])
**Description:** Project initialization and sub-agent setup
**Files Created:**
- `.claude/config.json` - Project configuration
- `.claude/claude.md` - Parent agent instructions
- `.claude/agents/*.json` - Sub-agent configurations
- `.claude/tasks/context.md` - This file

**Status:** ✅ Complete  
**Design Docs:** N/A  
**Notes:** Foundation ready for feature development

---

## 🚧 Current Task

### Task: [NONE - Ready for First Feature]

**Description:** [Waiting for first task]

**Status:** ⏸️ Not Started

**Requirements:**
- [None yet]

**Sub-Agents Involved:**
- [None yet]

**Timeline:**
- Started: [Not yet]
- Target: [Not yet]
- Completed: [Not yet]

**Progress:**
- [X] Task defined
- [ ] Planning complete (sub-agent designs)
- [ ] Implementation started
- [ ] Implementation complete
- [ ] Testing complete
- [ ] Documentation updated

**Blockers:**
- [None]

**Notes:**
- [None yet]

---

## 📚 Design Documents

All design documents are stored in `.claude/docs/`

### UI Designs
(None yet - will be created by @ui-designer)

### Backend Plans
(None yet - will be created by @backend-expert)

### Database Plans
(None yet - will be created by @database-optimizer)

### Test Plans
(None yet - will be created by @test-engineer)

---

## 📝 Implementation Notes

### Coding Standards
**Frontend:**
- Use functional components (no class components)
- TypeScript strict mode
- Props interfaces for all components
- Custom hooks for reusable logic
- Tailwind for styling (utility-first)
- Shadcn for UI components

**Backend:**
- Type hints for all functions
- Pydantic schemas for validation
- Async/await for I/O operations
- Proper error handling (try/except)
- Logging for important operations
- Security first (input validation, SQL injection prevention)

### File Organization
```
frontend/
  src/
    components/
      [Feature]/           # Feature-specific components
        Component1.tsx
        Component2.tsx
    pages/
      [Feature].tsx        # Feature pages
    services/
      [feature].ts         # API calls
    types/
      [feature].ts         # TypeScript types
    hooks/
      use[Feature].ts      # Custom hooks

backend/
  app/
    api/v1/endpoints/
      [feature].py         # API endpoints
    services/
      [feature]_service.py # Business logic
    models/
      [feature].py         # Database models
    schemas/
      [feature].py         # Pydantic schemas
  tests/
    unit/
      test_[feature].py
    integration/
      test_[feature]_api.py

.claude/
  docs/
    ui-design-[feature].md      # UI plans
    backend-plan-[feature].md   # Backend plans
    database-plan-[feature].md  # DB plans
    test-plan-[feature].md      # Test plans
  errors/
    [error-name].log            # Error logs
  tasks/
    context.md                  # This file
```

---

## 🐛 Known Issues

(None yet)

---

## 🔐 Security Considerations

### Current Security Measures
- ✅ JWT authentication (access + refresh tokens)
- ✅ Role-based access control (5 roles, 23 permissions)
- ✅ Password hashing (bcrypt)
- ✅ CORS configured
- ✅ SQL injection prevention (parameterized queries)
- ✅ Input validation (Pydantic)

### Planned Security Enhancements
- [ ] Two-factor authentication (2FA)
- [ ] IP whitelisting
- [ ] Rate limiting (beyond login)
- [ ] Enhanced audit logging
- [ ] Data encryption at rest
- [ ] Security headers (CSP, HSTS, etc.)
- [ ] Regular security audits

---

## 🎨 Ministry Design Standards

### Colors (Omani Government)
```css
--primary: #C1272D;       /* Omani Red */
--secondary: #FFD700;     /* Gold */
--background: #FFFFFF;    /* White */
--surface: #F9FAFB;       /* Light Gray */
--text-primary: #111827;  /* Almost Black */
--text-secondary: #6B7280;/* Gray */
--success: #10B981;       /* Green */
--warning: #F59E0B;       /* Orange */
--error: #EF4444;         /* Red */
--info: #3B82F6;          /* Blue */
```

### Typography
```css
/* Arabic */
font-family: 'IBM Plex Sans Arabic', 'Noto Sans Arabic', sans-serif;
line-height: 1.6;
text-align: right; /* RTL */

/* English */
font-family: 'Inter', 'system-ui', sans-serif;
line-height: 1.5;
text-align: left; /* LTR */

/* Sizes */
--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
--text-3xl: 30px;
--text-4xl: 36px;
```

### Spacing
```css
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-10: 40px;
--spacing-12: 48px;
--spacing-16: 64px;
```

### Accessibility
- **WCAG:** 2.1 Level AA compliance
- **Color Contrast:** 4.5:1 (text), 3:1 (UI)
- **Touch Targets:** Minimum 44px x 44px
- **Keyboard:** Full keyboard navigation
- **Screen Readers:** ARIA labels required

---

## 📊 Performance Targets

### Frontend
- **Page Load:** < 2 seconds
- **Time to Interactive:** < 3 seconds
- **First Contentful Paint:** < 1 second
- **Largest Contentful Paint:** < 2.5 seconds

### Backend
- **API Response:** < 500ms average
- **Database Query:** < 100ms average
- **Search Query:** < 1 second
- **Concurrent Users:** Support 1000+

### Caching
- **Redis TTL:** 5 minutes (general), 1 hour (recommendations)
- **Cache Hit Rate:** Target > 80%
- **Browser Cache:** Static assets 1 year

---

## 🧪 Testing Strategy

### Unit Tests
- **Coverage Target:** > 80%
- **Framework:** Vitest (frontend), pytest (backend)
- **Run Frequency:** On every commit (CI)

### Integration Tests
- **Coverage:** All API endpoints
- **Framework:** pytest
- **Run Frequency:** Before merge to main

### E2E Tests
- **Tool:** Playwright
- **Browsers:** Chrome, Firefox, Safari
- **Scenarios:** Critical user flows
- **Run Frequency:** Before release

### Manual Testing
- **Arabic Interface:** Every feature in Arabic
- **RTL Layout:** All pages in RTL
- **Mobile:** Real device testing
- **Accessibility:** Keyboard + screen reader

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Security scan completed
- [ ] Performance tested
- [ ] Documentation updated
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] Backup strategy confirmed

### Deployment Steps
- [ ] Stop old services
- [ ] Backup database
- [ ] Run migrations
- [ ] Deploy new code
- [ ] Start services
- [ ] Health check
- [ ] Smoke tests
- [ ] Monitor logs

### Post-Deployment
- [ ] Verify all features working
- [ ] Check performance metrics
- [ ] Monitor error logs
- [ ] Notify stakeholders
- [ ] Update documentation

---

## 📖 Technical Decisions

### Decision Log
(Important architectural and technical decisions will be logged here)

#### Decision 1: Use Shadcn UI (Date: [DATE])
**Reason:** Best-in-class components, accessible, customizable, great Arabic/RTL support  
**Alternatives Considered:** Ant Design, Material UI, Chakra UI  
**Impact:** Consistent UI, faster development, ministry-level quality

#### Decision 2: PostgreSQL Full-Text Search (Date: [DATE])
**Reason:** Better Arabic text search, built-in, no extra service needed  
**Alternatives Considered:** Elasticsearch (keeping for hybrid approach)  
**Impact:** Faster Arabic searches, simpler architecture

---

## 🎯 Next Steps

### Immediate Priority (This Week)
1. [ ] [No tasks yet - waiting for first feature request]

### Short-term (This Month)
1. [ ] [To be determined based on priorities]

### Long-term (This Quarter)
1. [ ] [To be determined based on roadmap]

---

## 💡 Lessons Learned

(Important lessons from development will be captured here)

### Lesson 1: [Example] Always Test RTL Early
**Situation:** Found RTL issues late in development  
**Learning:** Test RTL layout from day 1, not at the end  
**Solution:** Added RTL to initial component template

---

## 📞 Contact & Resources

### Team
- **Project Lead:** [Name]
- **Backend Lead:** [Name]
- **Frontend Lead:** [Name]
- **DevOps:** [Name]

### Resources
- **Repository:** https://github.com/jaleelaaa/Library-Management-System
- **Documentation:** [URL]
- **Design System:** [URL]
- **API Docs:** http://localhost:8000/docs

### Support
- **Issues:** GitHub Issues
- **Questions:** [Communication channel]
- **Ministry Contact:** [Contact info]

---

## 📈 Metrics & Analytics

### Current Metrics
(To be tracked once deployed)

**Usage:**
- Daily Active Users: [TBD]
- Books Cataloged: [TBD]
- Circulations/Day: [TBD]
- Search Queries/Day: [TBD]

**Performance:**
- Average Page Load: [TBD]
- Average API Response: [TBD]
- Error Rate: [TBD]
- Uptime: [TBD]

**User Satisfaction:**
- User Feedback Score: [TBD]
- Support Tickets: [TBD]
- Feature Requests: [TBD]

---

## 🔄 Context Management

### When to Update This File
- ✅ After completing any task
- ✅ When starting a new task
- ✅ When encountering blockers
- ✅ When making technical decisions
- ✅ When learning important lessons
- ✅ Daily status updates

### When to Archive
When this file exceeds 50,000 tokens:
```bash
mv .claude/tasks/context.md .claude/archive/context-$(date +%Y%m%d).md
# Create new context.md with summary and reference to archive
```

### How to Reference Archived Context
```markdown
For detailed history before [DATE], see:
.claude/archive/context-20250115.md
```

---

## 🎉 Milestones

### Milestone 1: Foundation Setup ✅
- [X] Project initialization
- [X] Sub-agent configuration
- [X] Context management setup
- [X] Development environment ready

### Milestone 2: Enhanced UI [Target: Week 2]
- [ ] Modern Shadcn components implemented
- [ ] Arabic-first design applied
- [ ] Mobile responsive
- [ ] Accessibility (WCAG AA)

### Milestone 3: Advanced Features [Target: Week 4]
- [ ] Advanced search
- [ ] Book recommendations
- [ ] Enhanced security
- [ ] Performance optimization

### Milestone 4: Ministry-Ready [Target: Week 8]
- [ ] All features complete
- [ ] Comprehensive testing done
- [ ] Documentation complete
- [ ] Deployed to staging
- [ ] User acceptance testing passed

### Milestone 5: Production Launch [Target: Week 10]
- [ ] Production deployment
- [ ] Training completed
- [ ] Go-live successful
- [ ] Monitoring in place
- [ ] Support established

---

## 🏆 Success Criteria

### Technical Success
- ✅ All features working as specified
- ✅ Performance targets met
- ✅ Security requirements satisfied
- ✅ Test coverage > 80%
- ✅ Zero critical bugs
- ✅ Accessibility compliance

### User Success
- ✅ User satisfaction > 4/5
- ✅ Task completion time reduced by 50%
- ✅ Error rate < 1%
- ✅ Positive ministry feedback
- ✅ Successful training completion

### Ministry Approval
- ✅ Security audit passed
- ✅ Compliance requirements met
- ✅ Arabic interface approved
- ✅ Performance acceptable
- ✅ Documentation complete

---

**Last Updated:** [DATE]  
**Updated By:** Parent Agent  
**Next Review:** [DATE]

---

## 📝 Quick Reference

### File Locations
```
.claude/
├── config.json              # Project config
├── claude.md                # Parent agent rules
├── tasks/
│   └── context.md          # This file (project state)
├── docs/
│   ├── ui-design-*.md      # UI plans
│   ├── backend-plan-*.md   # Backend plans
│   ├── database-plan-*.md  # DB plans
│   └── test-plan-*.md      # Test plans
├── agents/
│   ├── ui-designer.json
│   ├── backend-expert.json
│   ├── database-optimizer.json
│   └── test-engineer.json
├── errors/
│   └── *.log               # Error logs
└── archive/
    └── context-*.md        # Archived context
```

### Common Commands
```bash
# Read context
cat .claude/tasks/context.md

# View recent design docs
ls -lt .claude/docs/

# Check error logs
ls -lt .claude/errors/

# Archive old context
mv .claude/tasks/context.md .claude/archive/context-$(date +%Y%m%d).md

# Start Claude Code
claude-code .
```

### Sub-Agent Delegation Template
```
@[agent-name]

Context:
[Background information from this file]

Goal:
[What you want them to accomplish]

Requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Must Read:
.claude/tasks/context.md

Output Expected:
.claude/docs/[plan-name].md
```

---

**Ready to build amazing features! 🚀**

*This context file is the single source of truth for the project.  
Keep it updated, and success will follow!*
