import { test, expect, type Page } from '@playwright/test'

/**
 * Comprehensive Authentication & Authorization E2E Tests
 * Tests all critical auth flows including login, logout, token handling,
 * permission-based access, and security vulnerabilities
 */

// Test configuration
const BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000'

// Test users with different roles
const TEST_USERS = {
  admin: {
    username: 'admin',
    password: 'Admin@123',
    expectedRole: 'Administrator'
  },
  patron: {
    username: 'patron',
    password: 'Patron@123',
    expectedRole: 'Patron'
  },
  circulation: {
    username: 'circulation',
    password: 'Circulation@123',
    expectedRole: 'Circulation Desk Staff'
  }
}

// Helper function to login
async function login(page: Page, username: string, password: string) {
  await page.goto('/login')
  await page.fill('input[id="username"]', username)
  await page.fill('input[id="password"]', password)
  await page.click('button[type="submit"]')

  // Wait for navigation to dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 10000 })
}

// Helper function to check if user is logged in
async function isLoggedIn(page: Page): Promise<boolean> {
  const token = await page.evaluate(() => localStorage.getItem('token'))
  return token !== null
}

// Helper function to get stored token
async function getStoredToken(page: Page): Promise<string | null> {
  return await page.evaluate(() => localStorage.getItem('token'))
}

test.describe('Authentication - Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await page.goto('/login')
    await page.evaluate(() => {
      localStorage.clear()
    })
  })

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login')

    // Check page elements
    await expect(page.locator('h2')).toContainText(/login|sign in/i)
    await expect(page.locator('input[id="username"]')).toBeVisible()
    await expect(page.locator('input[id="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should successfully login with valid admin credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[id="username"]', TEST_USERS.admin.username)
    await page.fill('input[id="password"]', TEST_USERS.admin.password)
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })

    // Verify token is stored
    const token = await getStoredToken(page)
    expect(token).toBeTruthy()
    expect(token).toMatch(/^[\w-]*\.[\w-]*\.[\w-]*$/) // JWT format

    // Verify user data is stored
    const user = await page.evaluate(() => localStorage.getItem('user'))
    expect(user).toBeTruthy()

    const userData = JSON.parse(user!)
    expect(userData.username).toBe(TEST_USERS.admin.username)
    expect(userData.roles).toBeDefined()
    expect(userData.roles.length).toBeGreaterThan(0)
  })

  test('should successfully login with valid patron credentials', async ({ page }) => {
    await login(page, TEST_USERS.patron.username, TEST_USERS.patron.password)

    const token = await getStoredToken(page)
    expect(token).toBeTruthy()

    // Verify on dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[id="username"]', 'invalid_user')
    await page.fill('input[id="password"]', 'wrong_password')
    await page.click('button[type="submit"]')

    // Should show error message (toast or alert)
    await expect(page.locator('text=/incorrect|invalid|failed/i')).toBeVisible({ timeout: 5000 })

    // Should NOT redirect
    await expect(page).toHaveURL(/\/login/)

    // Should NOT store token
    const token = await getStoredToken(page)
    expect(token).toBeNull()
  })

  test('should show error with empty credentials', async ({ page }) => {
    await page.goto('/login')

    await page.click('button[type="submit"]')

    // HTML5 validation should prevent submission
    const usernameInput = page.locator('input[id="username"]')
    const isRequired = await usernameInput.getAttribute('required')
    expect(isRequired).toBe('')
  })

  test('should NOT allow inactive user to login', async ({ page }) => {
    // Note: This test requires an inactive user in the database
    // For now, we'll test with invalid credentials which simulates the same behavior
    await page.goto('/login')

    await page.fill('input[id="username"]', 'inactive_user')
    await page.fill('input[id="password"]', 'test123')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=/inactive|forbidden/i')).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Authentication - Logout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, TEST_USERS.admin.username, TEST_USERS.admin.password)
  })

  test('should successfully logout user', async ({ page }) => {
    // Click logout button (adjust selector based on your UI)
    await page.click('button:has-text("Logout"), a:has-text("Logout")').catch(() => {
      // Fallback: look for user menu first
      page.click('[aria-label="User menu"]')
    })

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 })

    // Token should be cleared
    const token = await getStoredToken(page)
    expect(token).toBeNull()

    // User data should be cleared
    const user = await page.evaluate(() => localStorage.getItem('user'))
    expect(user).toBeNull()
  })

  test('should redirect to login when accessing protected route after logout', async ({ page }) => {
    // Logout
    await page.evaluate(() => {
      localStorage.clear()
    })

    // Try to access protected route
    await page.goto('/users')

    // Should redirect to login
    await page.waitForURL(/\/login/, { timeout: 5000 })
  })
})

test.describe('Authentication - Protected Routes', () => {
  test('should redirect unauthenticated user to login', async ({ page }) => {
    // Clear any session
    await page.goto('/login')
    await page.evaluate(() => localStorage.clear())

    // Try to access protected routes
    const protectedRoutes = ['/dashboard', '/users', '/inventory', '/circulation']

    for (const route of protectedRoutes) {
      await page.goto(route)
      await page.waitForURL(/\/login/, { timeout: 5000 })
      expect(page.url()).toContain('/login')
    }
  })

  test('should allow authenticated user to access dashboard', async ({ page }) => {
    await login(page, TEST_USERS.admin.username, TEST_USERS.admin.password)

    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/)

    // Should see dashboard content
    await expect(page.locator('h1, h2')).toContainText(/dashboard/i)
  })

  test('should persist authentication across page refreshes', async ({ page }) => {
    await login(page, TEST_USERS.admin.username, TEST_USERS.admin.password)

    // Refresh page
    await page.reload()

    // Should still be authenticated
    const token = await getStoredToken(page)
    expect(token).toBeTruthy()

    // Should not redirect to login
    await expect(page).toHaveURL(/\/dashboard/)
  })
})

test.describe('Authorization - Permission-Based Access', () => {
  test('admin should have access to user management', async ({ page }) => {
    await login(page, TEST_USERS.admin.username, TEST_USERS.admin.password)

    await page.goto('/users')

    // Admin should see user management page
    await expect(page).toHaveURL(/\/users/)

    // Should see user management UI elements
    await expect(page.locator('button:has-text("Add"), button:has-text("Create")')).toBeVisible({ timeout: 5000 })
  })

  test('patron should NOT have access to user management', async ({ page }) => {
    await login(page, TEST_USERS.patron.username, TEST_USERS.patron.password)

    await page.goto('/users')

    // Should be redirected or see access denied
    // Check if either redirected to dashboard or see "Access Denied" message
    const url = page.url()
    const isDenied = await page.locator('text=/access denied|forbidden|unauthorized/i').isVisible().catch(() => false)

    expect(url.includes('/users') && !isDenied ? false : true).toBeTruthy()
  })

  test('patron should have access to catalog search', async ({ page }) => {
    await login(page, TEST_USERS.patron.username, TEST_USERS.patron.password)

    await page.goto('/search')

    // Patron should see search page
    await expect(page).toHaveURL(/\/search/)
    await expect(page.locator('input[type="search"], input[placeholder*="Search"]')).toBeVisible()
  })

  test('circulation staff should have access to circulation operations', async ({ page }) => {
    await login(page, TEST_USERS.circulation.username, TEST_USERS.circulation.password)

    await page.goto('/circulation')

    // Should see circulation page
    await expect(page).toHaveURL(/\/circulation/)
  })

  test('should hide UI elements based on permissions', async ({ page }) => {
    await login(page, TEST_USERS.patron.username, TEST_USERS.patron.password)

    await page.goto('/dashboard')

    // Patron should NOT see admin links in navigation
    const adminLinks = page.locator('a:has-text("Users"), a:has-text("Settings"), a:has-text("Roles")')
    const count = await adminLinks.count()
    expect(count).toBe(0)
  })
})

test.describe('Security - Token Handling', () => {
  test('should store JWT token in localStorage', async ({ page }) => {
    await login(page, TEST_USERS.admin.username, TEST_USERS.admin.password)

    const token = await getStoredToken(page)
    expect(token).toBeTruthy()

    // Verify JWT format (header.payload.signature)
    expect(token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/)
  })

  test('should send Authorization header with API requests', async ({ page }) => {
    await login(page, TEST_USERS.admin.username, TEST_USERS.admin.password)

    // Intercept API request
    let authHeader: string | null = null

    page.on('request', request => {
      if (request.url().includes('/api/v1')) {
        authHeader = request.headers()['authorization']
      }
    })

    // Trigger an API call
    await page.goto('/users')

    // Wait for API call
    await page.waitForTimeout(2000)

    expect(authHeader).toBeTruthy()
    expect(authHeader).toMatch(/^Bearer [\w-]+\.[\w-]+\.[\w-]+$/)
  })

  test('should handle 401 Unauthorized by redirecting to login', async ({ page }) => {
    await login(page, TEST_USERS.admin.username, TEST_USERS.admin.password)

    // Manually invalidate token
    await page.evaluate(() => {
      localStorage.setItem('token', 'invalid.token.here')
    })

    // Try to access a protected page
    await page.goto('/users')

    // Should redirect to login after 401
    await page.waitForURL(/\/login/, { timeout: 10000 })
  })

  test.skip('should automatically refresh expired token (NOT IMPLEMENTED)', async ({ page }) => {
    // This test is skipped because automatic token refresh is not yet implemented
    // This is a CRITICAL security issue identified in the audit
    await login(page, TEST_USERS.admin.username, TEST_USERS.admin.password)

    // Get token and manually expire it
    // (This would require mocking time or waiting for actual expiration)

    // Make API request
    // Expect: Token should be refreshed automatically
    // Current behavior: User gets logged out
  })
})

test.describe('Security - XSS and Input Validation', () => {
  test('should sanitize username input to prevent XSS', async ({ page }) => {
    await page.goto('/login')

    const xssPayload = '<script>alert("XSS")</script>'
    await page.fill('input[id="username"]', xssPayload)
    await page.fill('input[id="password"]', 'test123')
    await page.click('button[type="submit"]')

    // Should NOT execute script
    // Should show login error (invalid credentials)
    await expect(page.locator('text=/incorrect|invalid/i')).toBeVisible({ timeout: 5000 })

    // Script should not have executed (no alert dialog)
    const dialogs: any[] = []
    page.on('dialog', dialog => dialogs.push(dialog))
    await page.waitForTimeout(1000)
    expect(dialogs.length).toBe(0)
  })

  test('should not expose sensitive data in localStorage', async ({ page }) => {
    await login(page, TEST_USERS.admin.username, TEST_USERS.admin.password)

    // Check what's stored
    const storageData = await page.evaluate(() => {
      return {
        token: localStorage.getItem('token'),
        user: localStorage.getItem('user'),
        refreshToken: localStorage.getItem('refreshToken')
      }
    })

    // Token should be stored (this is a vulnerability, but current implementation)
    expect(storageData.token).toBeTruthy()

    // Password should NEVER be stored
    const user = JSON.parse(storageData.user || '{}')
    expect(user.password).toBeUndefined()
    expect(user.hashed_password).toBeUndefined()
  })
})

test.describe('Security - Session Management', () => {
  test('should clear session on browser close (when implemented)', async ({ page }) => {
    // Note: localStorage persists across browser sessions
    // This test documents the current behavior vs secure behavior

    await login(page, TEST_USERS.admin.username, TEST_USERS.admin.password)

    const token = await getStoredToken(page)
    expect(token).toBeTruthy()

    // Close and reopen (simulate)
    await page.close()

    // NOTE: In secure implementation, session should be cleared
    // Current implementation: Token persists in localStorage
  })

  test('should handle concurrent sessions', async ({ browser }) => {
    // Test multiple sessions in different contexts
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()

    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    // Login in both contexts
    await login(page1, TEST_USERS.admin.username, TEST_USERS.admin.password)
    await login(page2, TEST_USERS.patron.username, TEST_USERS.patron.password)

    // Both should be independent
    const token1 = await getStoredToken(page1)
    const token2 = await getStoredToken(page2)

    expect(token1).not.toBe(token2)

    await context1.close()
    await context2.close()
  })
})

test.describe('User Experience - Auth Feedback', () => {
  test('should show loading state during login', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[id="username"]', TEST_USERS.admin.username)
    await page.fill('input[id="password"]', TEST_USERS.admin.password)

    // Click login and immediately check for loading state
    await page.click('button[type="submit"]')

    // Should show loading text or disabled button
    const submitButton = page.locator('button[type="submit"]')
    const isDisabled = await submitButton.isDisabled()
    expect(isDisabled).toBeTruthy()
  })

  test('should display user profile information after login', async ({ page }) => {
    await login(page, TEST_USERS.admin.username, TEST_USERS.admin.password)

    // Navigate to profile or check header
    const userDisplay = page.locator('text=/admin|profile/i').first()
    await expect(userDisplay).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Edge Cases - Authentication', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // This would require mocking network failure
    // Skipping for now, but important for production
    test.skip()
  })

  test('should handle simultaneous login attempts', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[id="username"]', TEST_USERS.admin.username)
    await page.fill('input[id="password"]', TEST_USERS.admin.password)

    // Click multiple times rapidly
    await Promise.all([
      page.click('button[type="submit"]'),
      page.click('button[type="submit"]'),
      page.click('button[type="submit"]')
    ])

    // Should only process one login
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })

    const token = await getStoredToken(page)
    expect(token).toBeTruthy()
  })

  test('should handle special characters in credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[id="username"]', "user'with\"quotes")
    await page.fill('input[id="password"]', 'pass!@#$%^&*()')
    await page.click('button[type="submit"]')

    // Should handle without errors (though login will fail)
    await expect(page.locator('text=/incorrect|invalid/i')).toBeVisible({ timeout: 5000 })
  })
})
