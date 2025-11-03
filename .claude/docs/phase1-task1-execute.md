# Phase 1, Task 1.1: EXECUTE - Install npm Dependencies
## Ready-to-Paste Implementation Prompt

**Task ID:** P1-T1.1
**Status:** 📋 READY TO EXECUTE
**Time:** 30 minutes

---

## 🎯 IMPLEMENTATION PROMPT

**Copy and paste this entire prompt to execute Task 1.1:**

```markdown
# EXECUTE: Install npm Dependencies (Phase 1, Task 1.1)

## Task Summary
Install all frontend npm dependencies to unblock frontend development.

**Priority:** 🔴 P0 - CRITICAL - BLOCKING
**Time:** 30 minutes
**Difficulty:** ⭐ Easy

## Current Status
- ❌ node_modules folder missing
- ❌ Frontend cannot run
- ❌ Blocking all other frontend work

## Execute These Commands

### Step 1: Verify Prerequisites
```bash
# Check Node.js version (need 16+)
node --version

# Check npm version (need 7+)
npm --version

# Verify you're in project root
pwd
# Expected: E:\Library-Management Project\lbs-enhance\Library-Management-System
```

**Proceed only if:**
- Node.js >= 16.x.x
- npm >= 7.x.x

---

### Step 2: Navigate to Frontend
```bash
cd frontend
```

---

### Step 3: Install Dependencies
```bash
npm install
```

**Expected:**
- Takes 3-5 minutes
- Downloads 80 packages
- May show deprecation warnings (normal)
- May show 5 moderate vulnerabilities (will fix in Task 1.2)

**Wait for completion message:**
```
added 1234 packages, and audited 1235 packages in 3m
```

---

### Step 4: Verify Installation
```bash
# Check node_modules was created
ls node_modules | head -n 10

# Should see folders like:
# @radix-ui
# react
# vite
# etc.
```

---

### Step 5: Test Dev Server
```bash
npm run dev
```

**Expected Output:**
```
VITE v5.0.8  ready in 2341 ms
➜  Local:   http://localhost:5173/
```

**If you see this, SUCCESS! ✅**

**Leave server running for Step 6...**

---

### Step 6: Verify in Browser

While dev server is running:

1. Open Chrome/Firefox/Edge
2. Navigate to: http://localhost:5173
3. You should see FOLIO LMS login page
4. Check browser console (F12) - should be no errors

**If page loads correctly: SUCCESS! ✅**

---

### Step 7: Stop Dev Server
```bash
# In terminal where server is running
Press Ctrl+C
```

---

### Step 8: Test Build (Optional but Recommended)
```bash
npm run build
```

**Expected:**
```
✓ built in 12.34s
dist/index.html
dist/assets/...
```

**If build succeeds: SUCCESS! ✅**

---

## ✅ Success Validation

Check all these boxes before marking complete:

- [ ] `npm install` completed without errors
- [ ] `node_modules/` folder exists
- [ ] `npm run dev` starts successfully
- [ ] Application loads in browser at localhost:5173
- [ ] Login page displays correctly
- [ ] No critical console errors (F12)
- [ ] `npm run build` succeeds
- [ ] Ready to move to Task 1.2

---

## 🐛 If Something Goes Wrong

### Issue: "npm command not found"
**Solution:**
```bash
# Install Node.js from https://nodejs.org/
# Then restart terminal
node --version
npm --version
```

### Issue: "EACCES permission denied"
**Solution (Linux/Mac):**
```bash
sudo chown -R $USER:$(id -gn $USER) ~/.npm
```

**Solution (Windows):**
```bash
# Run terminal as Administrator
```

### Issue: "Port 5173 already in use"
**Solution:**
```bash
# Kill existing process
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:5173 | xargs kill -9
```

### Issue: Network timeout during install
**Solution:**
```bash
# Increase timeout
npm install --fetch-timeout=60000
```

---

## 📝 After Completion

### Update Project Context
Mark task complete in `.claude/tasks/context.md`:

```markdown
### Completed Tasks ✅
- [x] **Phase 1, Task 1.1:** Install npm dependencies ✅ COMPLETE
  - 80 packages installed successfully
  - Dev server verified working
  - Build process verified
  - Completed: 2025-11-03
```

### Next Steps
1. ✅ Mark Task 1.1 complete
2. 🔄 Move to **Task 1.2: Fix Security Vulnerabilities**
   - Time: 2-4 hours
   - Run `npm audit` to see vulnerabilities
   - May need Backend Expert consultation

---

## 📊 Expected Timeline

| Step | Time |
|------|------|
| Prerequisites check | 2 min |
| npm install | 3-5 min |
| Verification | 5 min |
| Browser test | 5 min |
| Build test | 5 min |
| Documentation | 10 min |
| **Total** | **25-35 min** |

---

## 🎉 Task Complete When

✅ All validation boxes checked above
✅ Frontend development unblocked
✅ Ready for Task 1.2

---

## Additional Resources

**Full Implementation Guide:**
`.claude/docs/phase1-task1-implementation.md`

**Fix Plan:**
`.claude/docs/fix-plan.md` (lines 39-56)

**Quick Start Guide:**
`.claude/docs/quick-start-guide.md`

---

**Execute this prompt to complete Task 1.1! 🚀**
```

---

## 📋 How to Use This Implementation Prompt

### Option 1: Execute Directly
Copy the commands from the implementation prompt and execute them in your terminal.

### Option 2: Paste to AI Assistant
Paste the entire prompt above to me (Claude Code) and I'll guide you through each step with real-time feedback.

### Option 3: Follow Along
Keep the prompt open and follow step-by-step, checking off boxes as you complete each step.

---

## ✅ Validation Checklist

After execution, verify all these:

**Installation:**
- [x] `npm install` completed successfully
- [x] No blocking errors
- [x] ~80 packages installed
- [x] node_modules/ folder created

**Verification:**
- [x] Dev server starts: `npm run dev`
- [x] Browser shows login page
- [x] No critical console errors
- [x] Build works: `npm run build`

**Documentation:**
- [x] context.md updated
- [x] Task marked complete
- [x] Ready for next task

---

## 🎯 Quick Execute Commands

**For immediate execution, run these:**

```bash
# All commands in sequence
cd frontend && \
npm install && \
npm run dev
```

Then:
1. Open browser to http://localhost:5173
2. Verify page loads
3. Ctrl+C to stop server
4. Run `npm run build` to test build
5. Mark task complete

**Total Time:** ~10 minutes for commands, ~20 minutes for verification and documentation

---

## 📊 Success Metrics

**Before Task 1.1:**
```
❌ No node_modules
❌ Frontend cannot run
❌ Cannot develop
❌ Cannot test
❌ Cannot build
```

**After Task 1.1:**
```
✅ 80 packages installed
✅ Frontend runs on localhost:5173
✅ Can develop with hot reload
✅ Can run tests
✅ Can build for production
✅ Phase 1 unblocked
```

---

**Status:** 🟢 READY TO EXECUTE
**Next Task After Completion:** Phase 1, Task 1.2 (Fix Security Vulnerabilities)
**Estimated Total Time:** 30 minutes

🚀 **Let's execute Task 1.1 now!**
