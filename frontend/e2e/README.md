# E2E Authentication Tests - Setup Guide

## Overview

Comprehensive E2E tests for authentication and authorization using Playwright.

## Test Coverage

### Authentication Tests
- ✅ Login with valid credentials (admin, patron, circulation staff)
- ✅ Login with invalid credentials
- ✅ Empty credentials validation
- ✅ Inactive user blocking
- ✅ Logout functionality
- ✅ Session persistence across refreshes

### Authorization Tests
- ✅ Protected route access control
- ✅ Permission-based UI rendering
- ✅ Role-based feature access
- ✅ Admin vs Patron permission differences

### Security Tests
- ✅ Token storage validation
- ✅ Authorization header transmission
- ✅ 401 handling
- ✅ XSS input sanitization
- ✅ Sensitive data exposure checks
- ✅ Concurrent session handling

### Edge Cases
- ✅ Simultaneous login attempts
- ✅ Special characters in credentials
- ✅ Loading states
- ✅ User profile display

## Prerequisites

### 1. Install Dependencies

```bash
cd frontend
npm install
npx playwright install
```

### 2. Start Backend Services

Using Docker Compose (recommended):
```bash
cd ../
docker-compose up -d
```

Or manually:
```bash
# Terminal 1: Start PostgreSQL, Redis, Elasticsearch
# (See main README.md for manual setup)

# Terminal 2: Start Backend
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload

# Terminal 3: Start Celery worker (optional for tests)
celery -A app.core.celery_app worker --loglevel=info
```

### 3. Initialize Database

```bash
cd backend
python -m app.db.init_db
```

This creates:
- Default tenant
- 5 roles with permissions
- Test users (admin, patron, circulation, cataloger, librarian)

### 4. Verify Services

- Backend: http://localhost:8000/docs
- Frontend: http://localhost:3000

## Running Tests

### Run All Auth Tests

```bash
cd frontend
npm run test:e2e e2e/auth-comprehensive.spec.ts
```

### Run Specific Test Suite

```bash
npx playwright test --grep "Authentication - Login Flow"
```

### Run in UI Mode (Interactive)

```bash
npm run test:e2e:ui e2e/auth-comprehensive.spec.ts
```

### Run with Specific Browser

```bash
# Chromium only
npx playwright test --project=chromium e2e/auth-comprehensive.spec.ts

# Firefox only
npx playwright test --project=firefox e2e/auth-comprehensive.spec.ts

# Mobile Chrome
npx playwright test --project="Mobile Chrome" e2e/auth-comprehensive.spec.ts
```

### Debug Mode

```bash
npx playwright test --debug e2e/auth-comprehensive.spec.ts
```

## Test Results

After running tests, view the HTML report:

```bash
npx playwright show-report
```

## Test Configuration

Configuration in `playwright.config.ts`:

```typescript
{
  testDir: './e2e',
  baseURL: 'http://localhost:3000',
  workers: process.env.CI ? 1 : undefined,
  retries: process.env.CI ? 2 : 0
}
```

## Known Issues & Skipped Tests

### ❌ Automatic Token Refresh (CRITICAL)
**Status:** NOT IMPLEMENTED
**Test:** `should automatically refresh expired token`
**Issue:** Users are logged out when token expires instead of automatic refresh

**Fix Required:**
- Implement token refresh interceptor
- Retry failed 401 requests after refresh
- Only logout if refresh token is invalid

### ⚠️ Network Error Handling
**Status:** NOT IMPLEMENTED
**Test:** `should handle network errors gracefully`
**Note:** Requires network mocking

## Test Data

All tests use default seeded users:

| Username | Password | Role | Use Case |
|----------|----------|------|----------|
| `admin` | `Admin@123` | Administrator | Full system access tests |
| `patron` | `Patron@123` | Patron | Limited permission tests |
| `circulation` | `Circulation@123` | Circulation Staff | Circulation feature tests |
| `cataloger` | `Cataloger@123` | Cataloger | Inventory feature tests |
| `librarian` | `Librarian@123` | Librarian | Operational access tests |

## Troubleshooting

### Test Fails: "Timeout waiting for URL"
**Cause:** Backend not running or slow to respond
**Fix:**
```bash
# Check backend is running
curl http://localhost:8000/health

# Check frontend is running
curl http://localhost:3000
```

### Test Fails: "User not found"
**Cause:** Database not initialized
**Fix:**
```bash
cd backend
python -m app.db.init_db
```

### Test Fails: "Cannot connect to database"
**Cause:** PostgreSQL not running
**Fix:**
```bash
docker-compose up -d postgres
# Or start PostgreSQL manually
```

### Tests Are Slow
**Cause:** Multiple browser instances running
**Fix:**
```bash
# Run with single worker
npx playwright test --workers=1

# Or run only chromium
npx playwright test --project=chromium
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Auth Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd frontend
          npm ci
          npx playwright install --with-deps

      - name: Start services
        run: docker-compose up -d

      - name: Wait for services
        run: |
          timeout 60 bash -c 'until curl -f http://localhost:8000/health; do sleep 2; done'
          timeout 60 bash -c 'until curl -f http://localhost:3000; do sleep 2; done'

      - name: Run tests
        run: |
          cd frontend
          npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

## Adding New Tests

### Test Template

```typescript
test('should <expected behavior>', async ({ page }) => {
  // 1. Setup
  await page.goto('/your-page')

  // 2. Action
  await page.click('button')

  // 3. Assert
  await expect(page.locator('result')).toBeVisible()
})
```

### Best Practices

1. **Use helper functions** for common operations (login, logout)
2. **Clear state** in `beforeEach` hooks
3. **Use specific selectors** (id, data-testid, aria-label)
4. **Add timeouts** for async operations
5. **Test both success and failure** paths
6. **Check security** (XSS, token handling, permissions)
7. **Document skipped tests** with reasons

## Security Testing Checklist

When adding new auth features, test:

- [ ] XSS prevention in inputs
- [ ] SQL injection prevention
- [ ] Token validation
- [ ] Permission enforcement
- [ ] Session management
- [ ] CSRF protection (when implemented)
- [ ] Rate limiting (when implemented)
- [ ] Account lockout (when implemented)

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Test Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)
- [FOLIO LMS Auth Documentation](../docs/AUTH_ARCHITECTURE.md)

## Support

For issues or questions:
1. Check [AUTH_SECURITY_AUDIT_REPORT.md](../../AUTH_SECURITY_AUDIT_REPORT.md)
2. Review test output: `npx playwright show-report`
3. Run in debug mode: `npx playwright test --debug`
4. Check backend logs: `docker-compose logs backend`
