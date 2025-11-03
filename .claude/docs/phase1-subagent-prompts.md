# Phase 1 Sub-Agent Consultation Prompts
## Ready-to-Paste Prompts for All Sub-Agents

**Created:** 2025-11-03
**Phase:** 1 - Critical Security & Dependency Fixes
**Purpose:** Complete prompts for consulting specialized sub-agents

---

## 📋 Sub-Agent Requirements by Task

| Task | Backend Expert | Database Optimizer | UI Designer | Test Engineer |
|------|----------------|-------------------|-------------|---------------|
| 1.1 Install npm | ❌ Not needed | ❌ Not needed | ❌ Not needed | ✅ Verification |
| 1.2 Fix vulnerabilities | ✅ Required | ❌ Not needed | ❌ Not needed | ✅ Required |
| 1.3 DB backups | ❌ Not needed | ✅ Required | ❌ Not needed | ✅ Required |
| 1.4 Update FastAPI | ✅ Required | ❌ Not needed | ❌ Not needed | ✅ Required |
| 1.5 Update Uvicorn | ✅ Required | ❌ Not needed | ❌ Not needed | ✅ Required |
| 1.6 Update packages | ✅ Required | ❌ Not needed | ❌ Not needed | ✅ Required |

---

## 1️⃣ Task 1.1: Install npm Dependencies

### No Sub-Agents Required ✅

Task 1.1 is straightforward package installation with no code changes or architectural decisions.

**Testing Approach:**
- Manual verification (dev server starts)
- Build test (npm run build)
- Browser test (application loads)

---

## 2️⃣ Task 1.2: Fix Security Vulnerabilities

### @backend-expert Prompt

**Configuration File:** `.claude/agents/backend-expert.json`

**Copy-Paste This Prompt:**

```markdown
# CONSULTATION REQUEST: Security Vulnerability Fix Analysis

## Context
I need to fix 5 moderate security vulnerabilities in the frontend build tools (esbuild/vite) as part of Phase 1, Task 1.2 of our ministry-level enhancement project.

## Current Situation
- **npm audit result:** 5 moderate severity vulnerabilities
- **CVE:** GHSA-67mh-4wv8-2f99
- **Affected packages:** esbuild (bundled with vite)
- **Current version:** vite 5.0.8
- **Latest version:** vite 7.1.12+
- **Project:** React 18.2 + TypeScript 5.3 + Vite frontend

## Your Task
Provide a comprehensive analysis and update strategy for fixing these vulnerabilities.

## Required Analysis

### 1. Breaking Changes Assessment
- What breaking changes exist between Vite 5.0.8 and 7.1.12?
- Will our existing configuration need updates?
- Are there any plugin compatibility issues?
- Will React 18.2 work with Vite 7.x?
- Any TypeScript configuration changes needed?

### 2. Risk Analysis
- What's the risk level of this update? (Low/Medium/High)
- What could potentially break?
- Do we need a rollback plan?
- Should we update to 7.1.12 or an intermediate version?

### 3. Update Strategy
Provide step-by-step update procedure:
- Should we update vite directly or use npm audit fix?
- Which dependencies need manual updates?
- Configuration file changes required
- Environment variable changes needed

### 4. Testing Checklist
Create a comprehensive testing checklist:
- Unit tests to run
- Build verification steps
- Dev server validation
- Production build testing
- Performance regression checks
- What to watch for during manual testing

### 5. Rollback Procedure
If the update fails:
- How to revert to vite 5.0.8?
- What files to restore?
- How to verify rollback successful?

## Project Context
- **System:** FOLIO Library Management System
- **Environment:** Ministry-level production deployment
- **Users:** 10,000+ concurrent users expected
- **Criticality:** HIGH - government system
- **Current State:** All tests passing, build working
- **Dependencies:** shadcn/ui components, Radix UI, Tailwind CSS

## Files That May Be Affected
- `frontend/package.json` - dependency versions
- `frontend/vite.config.ts` - vite configuration
- `frontend/tsconfig.json` - typescript configuration
- `frontend/.env.example` - environment variables (if needed)

## Expected Output Format

Please create a specification document at:
**`.claude/docs/backend-spec-vite-security-fix.md`**

### Document Structure:
```markdown
# Vite Security Vulnerability Fix Specification

## Executive Summary
- Risk assessment
- Recommended approach
- Estimated time

## Breaking Changes Analysis
- Version comparison table
- Impact on our codebase
- Compatibility matrix

## Update Procedure
### Step 1: Pre-update Backup
### Step 2: Update Dependencies
### Step 3: Configuration Updates
### Step 4: Testing
### Step 5: Verification

## Testing Checklist
- [ ] Unit tests pass
- [ ] Build succeeds
- [ ] Dev server starts
- [ ] Application loads in browser
- [ ] Production build works
- [ ] Performance metrics stable

## Rollback Procedure
- Commands to execute
- Files to restore
- Verification steps

## Timeline Estimate
- Preparation: X hours
- Execution: X hours
- Testing: X hours
- Documentation: X hours
```

## Additional Requirements
- Prioritize stability over latest features
- Focus on security patches
- Minimize disruption to development workflow
- Ensure compatibility with existing tooling

## Success Criteria
- [ ] All 5 vulnerabilities resolved
- [ ] npm audit shows 0 vulnerabilities
- [ ] All existing functionality preserved
- [ ] No performance regression
- [ ] All tests passing
- [ ] Clear rollback plan documented

## Questions to Answer
1. Should we update to latest 7.x or use an intermediate version?
2. Are there security patches in 5.x we could use instead?
3. Will this affect our development workflow?
4. Any impact on CI/CD pipeline?
5. Estimated downtime during update?
```

**Expected Response Time:** 1-2 hours for analysis
**Output Location:** `.claude/docs/backend-spec-vite-security-fix.md`

---

### @test-engineer Prompt

**Configuration File:** `.claude/agents/test-engineer.json`

**Copy-Paste This Prompt:**

```markdown
# TEST PLAN REQUEST: Vite Security Update Validation

## Context
After fixing 5 moderate security vulnerabilities by updating vite from 5.0.8 to 7.1.12+, we need comprehensive testing to ensure nothing broke.

## Your Task
Create a detailed test plan to validate the vite security update.

## Testing Scope

### 1. Pre-Update Baseline
Create baseline metrics before update:
- Current build time
- Bundle sizes
- Dev server startup time
- Test suite execution time
- Memory usage during build

### 2. Unit Testing
- [ ] All existing unit tests must pass
- [ ] No new test failures introduced
- [ ] Test coverage maintained (should not decrease)
- [ ] Any test configuration updates needed?

### 3. Integration Testing
- [ ] API calls work correctly
- [ ] Redux state management functional
- [ ] React Router navigation works
- [ ] WebSocket connections stable
- [ ] File upload/download features work

### 4. Build Verification
- [ ] Development build succeeds
- [ ] Production build succeeds
- [ ] Bundle sizes reasonable (document before/after)
- [ ] No console errors during build
- [ ] Source maps generated correctly

### 5. Dev Server Testing
- [ ] Dev server starts without errors
- [ ] Hot module replacement (HMR) works
- [ ] Page refresh works correctly
- [ ] No console errors in browser
- [ ] Network requests handled correctly

### 6. Browser Compatibility Testing
Test in multiple browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Safari (if available)

### 7. Performance Testing
Compare before/after metrics:
- [ ] Build time (should not increase >10%)
- [ ] Bundle size (should not increase significantly)
- [ ] Dev server startup time
- [ ] Page load time
- [ ] Runtime performance (no regression)

### 8. Functional Testing
Key user flows to test:
- [ ] Login flow works
- [ ] Dashboard loads correctly
- [ ] CRUD operations functional
- [ ] Search functionality works
- [ ] Language switching (EN/AR) works
- [ ] File operations work

### 9. Arabic/RTL Testing
- [ ] Arabic language displays correctly
- [ ] RTL layout works properly
- [ ] No UI breaking in Arabic mode
- [ ] All translations load

## Test Scenarios

### Scenario 1: Fresh Build
```bash
1. Clean build directory
2. Run npm run build
3. Verify no errors
4. Check bundle sizes
5. Test production preview
```

### Scenario 2: Development Workflow
```bash
1. Start dev server
2. Make code changes
3. Verify HMR updates
4. Check console for errors
5. Test page navigation
```

### Scenario 3: Complete User Flow
```bash
1. Open application
2. Login with test user
3. Navigate all pages
4. Perform CRUD operations
5. Switch language to Arabic
6. Logout
```

## Expected Output Format

Please create a test plan document at:
**`.claude/docs/test-plan-vite-security-update.md`**

### Document Structure:
```markdown
# Test Plan: Vite Security Update Validation

## Test Summary
- Total test cases: X
- Estimated execution time: X hours
- Test types: Unit, Integration, E2E, Performance

## Pre-Update Baseline Metrics
| Metric | Current Value |
|--------|---------------|
| Build time | X seconds |
| Bundle size | X MB |
| Dev server startup | X seconds |
| Unit test time | X seconds |

## Test Cases

### TC-001: Build Verification
- **Priority:** P0
- **Type:** Build
- **Steps:** ...
- **Expected:** ...
- **Status:** Not Started

[Continue for all test cases]

## Performance Comparison
| Metric | Before | After | Change | Status |
|--------|--------|-------|--------|--------|
| Build time | X | X | +/-X% | PASS/FAIL |

## Test Execution Log
- Date: YYYY-MM-DD
- Tester: Name
- Environment: Dev/Staging
- Results: X passed, Y failed

## Issues Found
[List any issues discovered during testing]

## Sign-off Checklist
- [ ] All critical tests passed
- [ ] No new regressions
- [ ] Performance acceptable
- [ ] Ready for deployment
```

## Success Criteria
- [ ] All test cases pass
- [ ] No performance regression >10%
- [ ] No new console errors
- [ ] All browsers tested
- [ ] Arabic/RTL functionality verified
- [ ] Ready for production

## Timeline
- Test plan creation: 2 hours
- Test execution: 3-4 hours
- Documentation: 1 hour
- Total: 6-7 hours
```

**Expected Response Time:** 2 hours for test plan
**Output Location:** `.claude/docs/test-plan-vite-security-update.md`

---

## 3️⃣ Task 1.3: Setup Automated Database Backups

### @database-optimizer Prompt

**Configuration File:** `.claude/agents/database-optimizer.json`

**Copy-Paste This Prompt:**

```markdown
# CONSULTATION REQUEST: Automated PostgreSQL Backup System

## Context
We need to implement an automated backup system for our PostgreSQL 15 database as part of Phase 1, Task 1.3. This is a ministry-level production system where data loss would be catastrophic.

## Your Task
Design and specify a comprehensive automated backup solution for our PostgreSQL database.

## Current System
- **Database:** PostgreSQL 15
- **Location:** Docker container (postgres:15-alpine)
- **Database Name:** folio_lms
- **Size:** TBD (expect growth to 100GB+)
- **Users:** 10,000+ concurrent expected
- **Criticality:** HIGH - government/ministry system
- **Current Backup:** NONE (critical gap)

## Requirements

### 1. Backup Strategy Design
- **Frequency:** Daily full backups minimum
- **Time:** Non-peak hours (2 AM suggested)
- **Retention:** 30 days minimum
- **Compression:** Required (gzip)
- **Encryption:** Required for off-site backups
- **Verification:** Automatic backup verification

### 2. Backup Types Needed
Recommend which backup types to implement:
- Full backups (pg_dump)
- Incremental backups (WAL archiving)
- Point-in-time recovery (PITR) capability
- Snapshot-based backups

### 3. Storage Strategy
- **On-site:** Local storage location
- **Off-site:** Cloud storage (S3, Azure, etc.)
- **Retention policy:** 30 days on-site, 90 days off-site
- **Storage size estimates:** Calculate based on database size

### 4. Implementation Details

#### Backup Script Specification
Create specification for Python backup script:
- **Location:** `backend/scripts/backup_database.py`
- **Functionality:**
  - pg_dump execution
  - Compression (gzip)
  - Timestamp naming
  - Verification
  - Off-site upload
  - Old backup cleanup
  - Error notification

#### Scheduling
- **Linux/Mac:** Cron job configuration
- **Windows:** Task Scheduler configuration
- **Docker:** Container-based scheduling

### 5. Restore Procedure
Document complete restore procedure:
- How to restore from backup
- Point-in-time recovery process
- Disaster recovery steps
- Recovery time objective (RTO)
- Recovery point objective (RPO)

### 6. Monitoring & Alerting
- Backup success/failure notifications
- Disk space monitoring
- Backup integrity checks
- Alert channels (email, Slack, etc.)

### 7. Testing Plan
- How to test backup creation
- How to test backup restoration
- Frequency of restore tests
- Documentation of test results

## Expected Output Format

Please create a specification document at:
**`.claude/docs/db-optimization-backup-system.md`**

### Document Structure:
```markdown
# PostgreSQL Automated Backup System Specification

## Executive Summary
- Backup strategy: Daily full + WAL archiving
- RPO: 24 hours
- RTO: 2 hours
- Storage: On-site + AWS S3

## Backup Strategy

### Daily Full Backups
- **Frequency:** Daily at 2:00 AM
- **Method:** pg_dump with custom format
- **Compression:** gzip -9
- **Retention:** 30 days on-site

### WAL Archiving (Optional)
- **Frequency:** Continuous
- **Method:** archive_command
- **Retention:** 7 days

## Implementation

### Backup Script
**File:** `backend/scripts/backup_database.py`

```python
#!/usr/bin/env python3
"""
PostgreSQL Automated Backup Script
Creates compressed backups with verification
"""

import subprocess
import datetime
import os
import gzip
import shutil
from pathlib import Path

# Configuration
DB_NAME = "folio_lms"
DB_USER = "folio"
DB_HOST = "localhost"
DB_PORT = "5432"
BACKUP_DIR = "/var/backups/postgresql"
RETENTION_DAYS = 30

# [Complete implementation specification]
```

### Cron Configuration
```bash
# Daily backup at 2:00 AM
0 2 * * * /usr/bin/python3 /path/to/backup_database.py >> /var/log/pg_backup.log 2>&1
```

### Windows Task Scheduler
```xml
[Task Scheduler XML configuration]
```

## Restore Procedure

### Full Database Restore
```bash
# Step 1: Stop application
docker-compose stop backend

# Step 2: Drop existing database
psql -U postgres -c "DROP DATABASE folio_lms;"

# Step 3: Create new database
psql -U postgres -c "CREATE DATABASE folio_lms;"

# Step 4: Restore backup
gunzip -c backup_2025-11-03.sql.gz | psql -U folio folio_lms

# Step 5: Verify restoration
psql -U folio folio_lms -c "SELECT COUNT(*) FROM users;"

# Step 6: Restart application
docker-compose start backend
```

## Monitoring

### Backup Success Verification
- Check backup file size >0
- Verify gzip integrity
- Test pg_restore --list on backup
- Upload verification to off-site

### Alerting Configuration
```python
# Email alerts on failure
# Slack webhook on success/failure
# Disk space warnings
```

## Testing

### Monthly Restore Test
1. Select random backup from last 30 days
2. Restore to test database
3. Verify data integrity
4. Document results
5. Time the restoration

## Cost Estimates
- On-site storage: 50GB (daily * 30 days)
- Off-site storage (AWS S3): $1.50/month
- Transfer costs: ~$0.50/month

## Timeline
- Script development: 3 hours
- Testing: 1 hour
- Scheduling setup: 30 minutes
- Documentation: 30 minutes
- Total: 5 hours
```

## Success Criteria
- [ ] Backup script created and tested
- [ ] Scheduled execution configured
- [ ] Test restoration successful
- [ ] Off-site storage configured
- [ ] Monitoring/alerting active
- [ ] Documentation complete

## Additional Considerations
- Docker volume backup (if needed)
- Redis backup (if persisted data)
- Application file backup (uploads, etc.)
- Database migration scripts backup
```

**Expected Response Time:** 2-3 hours for specification
**Output Location:** `.claude/docs/db-optimization-backup-system.md`

---

### @test-engineer Prompt (Task 1.3)

**Copy-Paste This Prompt:**

```markdown
# TEST PLAN REQUEST: Database Backup System Validation

## Context
After implementing the automated PostgreSQL backup system, we need to validate that backups are created correctly and can be restored successfully.

## Your Task
Create a comprehensive test plan for the database backup system.

## Testing Scope

### 1. Backup Creation Tests
- [ ] Backup script executes without errors
- [ ] Backup file created with correct timestamp
- [ ] Backup file is compressed (gzip)
- [ ] Backup file size is reasonable
- [ ] Backup completes within acceptable time

### 2. Backup Content Validation
- [ ] All database schemas included
- [ ] All tables included
- [ ] All data included
- [ ] All indexes included
- [ ] All constraints included
- [ ] All sequences included

### 3. Backup Restoration Tests
- [ ] Backup can be decompressed
- [ ] Backup can be restored to test database
- [ ] Restored data matches source data
- [ ] Restored database is functional
- [ ] All relationships intact

### 4. Scheduling Tests
- [ ] Cron job/Task Scheduler configured correctly
- [ ] Backup runs at scheduled time
- [ ] Backup runs even if manual run in progress
- [ ] Failed backups retry or alert

### 5. Retention Tests
- [ ] Old backups deleted after 30 days
- [ ] Deletion runs automatically
- [ ] Sufficient backups retained

### 6. Off-site Backup Tests
- [ ] Upload to cloud storage works
- [ ] Upload is encrypted
- [ ] Download from cloud storage works
- [ ] Cloud backup can be restored

### 7. Monitoring Tests
- [ ] Success notifications sent
- [ ] Failure notifications sent
- [ ] Disk space warnings work
- [ ] Log files created correctly

## Test Scenarios

### Scenario 1: Initial Backup Test
```bash
1. Run backup script manually
2. Verify backup file created
3. Check backup file integrity
4. Verify backup can be listed with pg_restore
```

### Scenario 2: Full Restore Test
```bash
1. Create test database
2. Restore backup to test database
3. Compare data with production
4. Verify application works with test DB
5. Cleanup test database
```

### Scenario 3: Disaster Recovery Simulation
```bash
1. Stop all services
2. Simulate data loss (drop database)
3. Restore from latest backup
4. Verify all data recovered
5. Restart services
6. Test application functionality
```

## Expected Output Format

Please create a test plan document at:
**`.claude/docs/test-plan-database-backup.md`**

## Success Criteria
- [ ] Backup creation tested and passing
- [ ] Restoration tested and passing
- [ ] Scheduling verified working
- [ ] Monitoring/alerting tested
- [ ] Disaster recovery procedure documented
- [ ] RTO/RPO validated

## Timeline
- Test plan creation: 1 hour
- Test execution: 2-3 hours
- Documentation: 1 hour
- Total: 4-5 hours
```

**Expected Response Time:** 1 hour for test plan
**Output Location:** `.claude/docs/test-plan-database-backup.md`

---

## 4️⃣ Tasks 1.4, 1.5, 1.6: Backend Package Updates

### @backend-expert Prompt (Combined for Tasks 1.4-1.6)

**Copy-Paste This Prompt:**

```markdown
# CONSULTATION REQUEST: Backend Framework & Package Updates

## Context
We need to update core backend packages as part of Phase 1, Tasks 1.4-1.6. These updates include security patches and bug fixes critical for ministry-level deployment.

## Packages to Update

### Task 1.4: FastAPI
- **Current:** 0.109.0
- **Latest:** 0.121.0
- **Versions Behind:** 12 minor versions
- **Priority:** P1 - HIGH

### Task 1.5: Uvicorn
- **Current:** 0.27.0
- **Latest:** 0.38.0
- **Versions Behind:** 11 minor versions
- **Priority:** P1 - HIGH

### Task 1.6: Critical Packages
- **pydantic:** 2.11.9 → 2.12.3
- **alembic:** 1.13.1 → 1.17.1
- **python-socketio:** 5.11.0 → 5.14.3

## Your Task
Provide comprehensive analysis and update strategy for all backend package updates.

## Required Analysis

### 1. Breaking Changes Assessment
For each package:
- List breaking changes between versions
- Impact on our codebase
- Required code modifications
- Configuration changes needed

### 2. Dependency Compatibility
- Check compatibility between updated packages
- Any conflicting dependencies?
- Any deprecated APIs we're using?
- Third-party package compatibility

### 3. Update Strategy
Provide phased update approach:
- **Phase 1:** Update FastAPI
- **Phase 2:** Update Uvicorn
- **Phase 3:** Update remaining packages
- Or: Update all at once (with pros/cons)

### 4. Code Changes Required
Document all code changes needed:
- **FastAPI changes:** Deprecated API usage
- **Pydantic changes:** Schema modifications
- **Alembic changes:** Migration script updates
- **Socket.IO changes:** WebSocket handling

### 5. Testing Requirements
- Which tests to run after each update
- New tests to add
- Performance testing needed
- Load testing recommendations

## Project Context
- **Backend:** FastAPI + async/await
- **Database:** PostgreSQL 15 with async SQLAlchemy
- **ORM:** SQLAlchemy 2.0 with AsyncSession
- **Migrations:** Alembic
- **Authentication:** JWT tokens
- **WebSocket:** Socket.IO for real-time features
- **Task Queue:** Celery with Redis
- **Current Status:** All tests passing

## Expected Output Format

Please create a specification document at:
**`.claude/docs/backend-spec-package-updates.md`**

### Document Structure:
```markdown
# Backend Package Updates Specification

## Executive Summary
- Total packages: 6
- Total time: 12-17 hours
- Risk level: MEDIUM
- Recommended approach: Phased updates

## Breaking Changes Analysis

### FastAPI 0.109.0 → 0.121.0
**Breaking Changes:**
1. [List breaking changes]
2. [Impact on our code]

**Code Changes Required:**
```python
# Before
@app.get("/users")
async def get_users():
    ...

# After (if needed)
@app.get("/users")
async def get_users():
    ...
```

### Pydantic 2.11.9 → 2.12.3
[Similar analysis]

### Other Packages
[Similar analysis]

## Update Procedure

### Phase 1: FastAPI Update
```bash
# Step 1: Update requirements.txt
# Step 2: Create backup
# Step 3: Run update
# Step 4: Run tests
# Step 5: Verify API docs
```

### Phase 2: Uvicorn Update
[Similar steps]

### Phase 3: Other Packages
[Similar steps]

## Code Modifications

### File: backend/app/api/v1/users.py
**Line 45:** Update deprecated Pydantic validator
```python
# Before
class UserCreate(BaseModel):
    @validator('email')
    def validate_email(cls, v):
        ...

# After
class UserCreate(BaseModel):
    @field_validator('email')
    def validate_email(cls, v):
        ...
```

### File: backend/alembic/versions/xyz.py
[List any migration changes]

## Testing Checklist
- [ ] All unit tests pass (pytest)
- [ ] API endpoints functional (/docs accessible)
- [ ] WebSocket connections stable
- [ ] Celery tasks running
- [ ] Database migrations work
- [ ] JWT authentication functional
- [ ] No performance regression

## Rollback Procedure
[Complete rollback steps]

## Timeline Estimate
- FastAPI update: 4-6 hours
- Uvicorn update: 2-3 hours
- Other packages: 6-8 hours
- Total: 12-17 hours

## Risk Mitigation
- Test in development first
- Create database backup
- Document all changes
- Have rollback plan ready
```

## Success Criteria
- [ ] All packages updated to target versions
- [ ] All tests passing
- [ ] No breaking changes in functionality
- [ ] API documentation accessible
- [ ] Performance maintained or improved
- [ ] Clear documentation of changes

## Timeline
- Analysis: 2-3 hours
- FastAPI update: 4-6 hours
- Uvicorn update: 2-3 hours
- Other packages: 6-8 hours
- Testing: 2-3 hours
- Total: 16-23 hours
```

**Expected Response Time:** 2-3 hours for analysis
**Output Location:** `.claude/docs/backend-spec-package-updates.md`

---

### @test-engineer Prompt (Tasks 1.4-1.6)

**Copy-Paste This Prompt:**

```markdown
# TEST PLAN REQUEST: Backend Package Updates Validation

## Context
After updating FastAPI, Uvicorn, and other critical backend packages, we need comprehensive testing to ensure system stability and functionality.

## Your Task
Create a complete test plan for validating all backend package updates.

## Testing Scope

### 1. Unit Testing
- [ ] All existing unit tests pass
- [ ] No new test failures
- [ ] Test coverage maintained
- [ ] Async tests functional

### 2. API Testing
- [ ] All endpoints return correct responses
- [ ] Authentication still works (JWT)
- [ ] Authorization checks functional (RBAC)
- [ ] Request validation working (Pydantic)
- [ ] Error handling correct
- [ ] API documentation accessible

### 3. Database Testing
- [ ] SQLAlchemy queries work
- [ ] Migrations run successfully
- [ ] CRUD operations functional
- [ ] Transactions working correctly
- [ ] Connection pooling stable

### 4. WebSocket Testing
- [ ] Socket.IO connections establish
- [ ] Real-time updates working
- [ ] Connection stability maintained
- [ ] Reconnection logic functional

### 5. Celery Task Testing
- [ ] Background tasks execute
- [ ] Scheduled tasks run on time
- [ ] Task results correct
- [ ] Error handling works

### 6. Performance Testing
- [ ] Response times maintained
- [ ] No memory leaks
- [ ] Concurrent request handling
- [ ] Database query performance

## Test Scenarios

### Scenario 1: Complete API Flow
```bash
1. Start backend: uvicorn app.main:app --reload
2. Login via POST /auth/login
3. Get user profile GET /users/me
4. Perform CRUD operations
5. Test WebSocket connection
6. Verify audit logs created
7. Logout
```

### Scenario 2: Load Testing
```bash
1. Simulate 100 concurrent users
2. Execute various API calls
3. Monitor response times
4. Check error rates
5. Verify system stability
```

## Expected Output Format

Please create a test plan document at:
**`.claude/docs/test-plan-backend-updates.md`**

## Success Criteria
- [ ] All tests passing
- [ ] No regressions identified
- [ ] Performance acceptable
- [ ] WebSocket stable
- [ ] Celery tasks functional
- [ ] Ready for production

## Timeline
- Test plan creation: 2 hours
- Test execution: 4-6 hours
- Documentation: 1 hour
- Total: 7-9 hours
```

**Expected Response Time:** 2 hours for test plan
**Output Location:** `.claude/docs/test-plan-backend-updates.md`

---

## 📊 Summary: Sub-Agent Usage by Task

### Phase 1 Sub-Agent Requirements

| Task | Time | Backend Expert | Database Optimizer | UI Designer | Test Engineer |
|------|------|----------------|-------------------|-------------|---------------|
| 1.1 | 30 min | ❌ | ❌ | ❌ | ✅ Verify only |
| 1.2 | 2-4 hrs | ✅ Required | ❌ | ❌ | ✅ Required |
| 1.3 | 3-4 hrs | ❌ | ✅ Required | ❌ | ✅ Required |
| 1.4 | 4-6 hrs | ✅ Required | ❌ | ❌ | ✅ Required |
| 1.5 | 2-3 hrs | ✅ Required | ❌ | ❌ | ✅ Required |
| 1.6 | 6-8 hrs | ✅ Required | ❌ | ❌ | ✅ Required |

**Total Consultations Needed:**
- **Backend Expert:** 4 times (Tasks 1.2, 1.4, 1.5, 1.6)
- **Database Optimizer:** 1 time (Task 1.3)
- **UI Designer:** 0 times (none needed for Phase 1)
- **Test Engineer:** 6 times (all tasks)

---

## 🎯 How to Use These Prompts

### Step 1: Identify Which Sub-Agent Needed
Check the table above for your current task.

### Step 2: Copy the Appropriate Prompt
Find the prompt for your task and sub-agent, copy the entire markdown block.

### Step 3: Paste and Submit
Paste the prompt to me, specifying which sub-agent you want to consult.

### Step 4: Review Output
The sub-agent will create a specification document in `.claude/docs/`

### Step 5: Implement Based on Spec
Follow the specification document to implement the changes.

---

## ✅ Validation

All prompts include:
- Clear context
- Specific requirements
- Expected output format
- Success criteria
- Timeline estimates
- Output file location

**Status:** 🟢 ALL PROMPTS READY TO USE

---

**Created:** 2025-11-03
**Total Prompts:** 8 (for 6 tasks)
**Coverage:** Complete Phase 1
**Next:** Use appropriate prompt when needed
