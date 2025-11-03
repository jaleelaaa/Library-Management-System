# Phase 1, Task 1.1: Install npm Dependencies
## Complete Implementation Guide

**Task ID:** P1-T1.1
**Status:** 🔴 CRITICAL - BLOCKING ALL FRONTEND WORK
**Estimated Time:** 30 minutes
**Priority:** P0
**Difficulty:** ⭐ Easy

---

## 📋 Task Overview

### What This Task Does
Installs all frontend npm dependencies so the React application can run. Currently, `node_modules/` folder is missing, which blocks all frontend development and testing.

### Why This is Critical
- **BLOCKING:** No other frontend work can proceed without this
- **Priority P0:** Must be completed before any other Phase 1 tasks
- **Risk:** Low - straightforward npm install
- **Impact:** Unblocks 100% of frontend development

### Issue Identified
```
❌ node_modules missing
❌ Frontend dev server cannot start
❌ Frontend build cannot run
❌ Frontend tests cannot run
```

**Current Error When Trying to Start:**
```
'vite' is not recognized as an internal or external command
```

---

## 🎯 Success Criteria

At the end of this task, you should have:

- [x] All npm packages installed (60 dependencies, 20 devDependencies)
- [x] `node_modules/` folder exists in `frontend/`
- [x] `npm run dev` starts successfully
- [x] Dev server running on http://localhost:5173
- [x] No peer dependency warnings
- [x] No security vulnerabilities (will handle in Task 1.2)
- [x] Can open application in browser

---

## 🛠️ Prerequisites

### System Requirements
- **Node.js:** v16+ required
- **npm:** v7+ required
- **Disk Space:** ~500MB for node_modules
- **Internet:** Required for package download

### Verify Prerequisites
```bash
# Check Node.js version
node --version
# Expected: v16.x.x or higher

# Check npm version
npm --version
# Expected: v7.x.x or higher

# Check current directory
pwd
# Expected: E:\Library-Management Project\lbs-enhance\Library-Management-System
```

**If Node.js not installed:**
1. Download from https://nodejs.org/
2. Install LTS version (20.x or 18.x)
3. Restart terminal
4. Verify installation

---

## 📂 Files Affected

### Files That Will Be Created
```
frontend/node_modules/          (NEW - ~200,000 files)
frontend/package-lock.json      (UPDATED - dependency lock file)
```

### Files That Will Be Read
```
frontend/package.json           (READ - dependency list)
```

### No Code Changes Required
This task does NOT require any code modifications. It's purely installing dependencies.

---

## 🚀 Step-by-Step Implementation

### Step 1: Navigate to Frontend Directory
```bash
cd frontend
```

**Expected Output:**
```
# No output, just changes directory
```

**Verify You're in the Right Place:**
```bash
ls package.json
```

**Expected:**
```
package.json
```

---

### Step 2: Check Current State
```bash
# Check if node_modules exists (should not exist)
ls node_modules 2>/dev/null || echo "node_modules does not exist - EXPECTED"

# Check package.json exists
cat package.json | head -n 10
```

**Expected Output:**
```
node_modules does not exist - EXPECTED
{
  "name": "folio-lms-frontend",
  "version": "1.0.0",
  ...
}
```

---

### Step 3: Install npm Dependencies
```bash
npm install
```

**What This Command Does:**
- Reads `package.json`
- Downloads 80 packages (60 dependencies + 20 devDependencies)
- Installs to `node_modules/`
- Creates/updates `package-lock.json`
- Takes 3-5 minutes depending on internet speed

**Expected Output (Abbreviated):**
```
npm WARN deprecated inflight@1.0.6: This module is not supported...
npm WARN deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported

added 1234 packages, and audited 1235 packages in 3m

123 packages are looking for funding
  run `npm fund` for details

5 moderate severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.
```

**⚠️ Important Notes:**
- **Deprecation warnings:** Normal, don't worry about them
- **5 moderate vulnerabilities:** Expected, we'll fix in Task 1.2
- **Time:** 3-5 minutes on good internet

**If npm install fails:**
- Check internet connection
- Try: `npm install --legacy-peer-deps`
- Check Node.js version is 16+
- Clear npm cache: `npm cache clean --force`

---

### Step 4: Verify Installation
```bash
# Check node_modules was created
ls node_modules | head -n 20

# Check specific critical packages
ls node_modules/react
ls node_modules/vite
ls node_modules/@radix-ui
```

**Expected Output:**
```
@aashutoshrathi
@babel
@eslint
@hookform
@jridgewell
@nodelib
@playwright
@radix-ui
@reduxjs
@rollup
...

(Should see package folders)
```

---

### Step 5: Test Dev Server Startup
```bash
npm run dev
```

**What This Command Does:**
- Starts Vite dev server
- Compiles React application
- Opens on http://localhost:5173
- Hot reload enabled

**Expected Output:**
```
> folio-lms-frontend@1.0.0 dev
> vite

  VITE v5.0.8  ready in 2341 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**Success Indicators:**
✅ "VITE v5.0.8 ready in XXX ms"
✅ "Local: http://localhost:5173/"
✅ No errors in terminal

---

### Step 6: Verify in Browser
```bash
# Server should still be running from Step 5
# Open browser to http://localhost:5173
```

**Open Browser:**
1. Open Chrome/Edge/Firefox
2. Navigate to: http://localhost:5173
3. You should see the login page

**Expected in Browser:**
- ✅ FOLIO LMS login page loads
- ✅ No console errors (F12 to check)
- ✅ Page is styled correctly
- ✅ Language switcher visible (EN/AR)

**If page doesn't load:**
- Check terminal for errors
- Check browser console (F12)
- Verify dev server is running
- Try hard refresh (Ctrl+Shift+R)

---

### Step 7: Stop Dev Server
```bash
# In terminal where dev server is running
# Press Ctrl+C

# Verify it stopped
```

**Expected Output:**
```
^C
# Server stops, returns to command prompt
```

---

### Step 8: Test Build (Optional but Recommended)
```bash
npm run build
```

**What This Command Does:**
- Compiles production build
- Type checks TypeScript
- Minifies code
- Outputs to `dist/` folder

**Expected Output:**
```
> folio-lms-frontend@1.0.0 build
> tsc && vite build

vite v5.0.8 building for production...
✓ 1234 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-XXXXX.css      123.45 kB │ gzip: 34.56 kB
dist/assets/index-XXXXX.js       567.89 kB │ gzip: 123.45 kB
✓ built in 12.34s
```

**Success Indicators:**
✅ "built in XX.XXs"
✅ No TypeScript errors
✅ dist/ folder created

---

## ✅ Validation Checklist

After completing all steps, verify:

- [ ] `node_modules/` folder exists
- [ ] `package-lock.json` created/updated
- [ ] `npm run dev` starts without errors
- [ ] Browser shows login page at localhost:5173
- [ ] `npm run build` completes successfully
- [ ] No blocking errors in terminal
- [ ] Can stop and restart dev server

---

## 📊 Expected Results

### Before This Task
```
frontend/
├── src/
├── package.json
└── (no node_modules)

❌ Cannot run: npm run dev
❌ Cannot run: npm run build
❌ Cannot run: npm test
```

### After This Task
```
frontend/
├── node_modules/          ✅ NEW (80 packages)
├── package-lock.json      ✅ NEW/UPDATED
├── src/
└── package.json

✅ Can run: npm run dev
✅ Can run: npm run build
✅ Can run: npm test
✅ Frontend development unblocked
```

---

## 🐛 Troubleshooting

### Issue 1: npm install fails with EACCES error
**Symptom:**
```
npm ERR! code EACCES
npm ERR! syscall access
npm ERR! path /usr/local/lib/node_modules
```

**Solution:**
```bash
# Windows: Run terminal as Administrator
# Mac/Linux: Fix npm permissions
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

---

### Issue 2: Peer dependency warnings
**Symptom:**
```
npm WARN ERESOLVE overriding peer dependency
```

**Solution:**
```bash
# Try install with legacy peer deps flag
npm install --legacy-peer-deps
```

---

### Issue 3: Network timeout
**Symptom:**
```
npm ERR! network timeout while trying to download
```

**Solution:**
```bash
# Increase timeout
npm install --fetch-timeout=60000

# Or use different registry
npm install --registry=https://registry.npmmirror.com
```

---

### Issue 4: Disk space error
**Symptom:**
```
npm ERR! ENOSPC: no space left on device
```

**Solution:**
```bash
# Check disk space
df -h  # Linux/Mac
dir    # Windows

# Clean npm cache
npm cache clean --force

# Free up space and try again
```

---

### Issue 5: Dev server won't start
**Symptom:**
```
Port 5173 is already in use
```

**Solution:**
```bash
# Windows: Find and kill process
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Mac/Linux: Kill process
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

---

## 🎯 Sub-Agent Consultation

### Sub-Agents Needed for This Task
**None** - This is a straightforward npm install

### When to Consult Sub-Agents
**Not required for Task 1.1**

*Note: Task 1.2 (Fix Security Vulnerabilities) may require Backend Expert consultation*

---

## 📝 Documentation Updates

### Update context.md After Completion
```markdown
### Completed Tasks ✅
- [x] **Phase 1, Task 1.1:** Install npm dependencies (30 min) ✅
  - npm packages installed: 80 total
  - Dev server verified working
  - Build process verified working
  - Status: COMPLETE
```

### Update Fix Plan Status
Mark Task 1.1 as complete in `.claude/docs/fix-plan.md`

---

## ⏭️ Next Steps

After completing this task:

1. ✅ Mark Task 1.1 as complete in context.md
2. 🔄 Move to **Task 1.2: Fix Security Vulnerabilities**
   - Time: 2-4 hours
   - Run: `npm audit`
   - Fix the 5 moderate vulnerabilities
3. 🔄 Consider Task 1.3 in parallel: **Setup Database Backups**
   - Can be done independently
   - Doesn't block other frontend work

---

## 📊 Time Log

**Estimated Time:** 30 minutes

**Breakdown:**
- Step 1-2 (Setup & Verify): 2 minutes
- Step 3 (npm install): 3-5 minutes (depends on internet)
- Step 4 (Verify installation): 2 minutes
- Step 5 (Test dev server): 3 minutes
- Step 6 (Browser verification): 5 minutes
- Step 7-8 (Build test): 5 minutes
- Documentation: 10 minutes

**Total:** 25-35 minutes

---

## 🎉 Task Completion Criteria

You can mark this task as COMPLETE when:

✅ All validation checklist items checked
✅ Dev server starts and runs without errors
✅ Application loads in browser
✅ Build completes successfully
✅ context.md updated
✅ Ready to move to Task 1.2

---

## 📚 Additional Resources

### Documentation
- **npm documentation:** https://docs.npmjs.com/
- **Vite documentation:** https://vitejs.dev/
- **Node.js downloads:** https://nodejs.org/

### Project Documentation
- **Quick Start Guide:** `.claude/docs/quick-start-guide.md`
- **Fix Plan:** `.claude/docs/fix-plan.md`
- **Implementation Roadmap:** `.claude/docs/implementation-roadmap.md`

---

## 🚀 Ready to Execute?

**Current Status:** 📋 READY TO IMPLEMENT

**Prerequisites Met?** Check before starting:
- [x] Node.js 16+ installed
- [x] Terminal open in project root
- [x] Internet connection available
- [x] ~500MB disk space free

**First Command to Run:**
```bash
cd frontend && npm install
```

**Expected Duration:** 5-10 minutes for install + testing

**Let's get started! 🎯**

---

**Task Status:** 🔴 NOT STARTED
**Last Updated:** 2025-11-03
**Next Task:** Phase 1, Task 1.2 (Fix Security Vulnerabilities)
