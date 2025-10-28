import { test, expect, Page } from '@playwright/test';

/**
 * COMPREHENSIVE BILINGUAL E2E TESTS
 * Tests all features in both English and Arabic
 */

const BASE_URL = 'http://localhost:3000';

// Test credentials
const ADMIN_CREDS = { username: 'admin', password: 'Admin@123' };
const PATRON_CREDS = { username: 'patron', password: 'Patron@123' };

// Helper: Login function
async function login(page: Page, username: string, password: string) {
  await page.goto(BASE_URL);
  await page.fill('input[name="username"], input[type="text"]', username);
  await page.fill('input[name="password"], input[type="password"]', password);
  await page.click('button[type="submit"], button:has-text("Sign"), button:has-text("تسجيل")');
  await page.waitForURL(/.*dashboard.*/i, { timeout: 10000 });
}

// Helper: Switch language
async function switchLanguage(page: Page, language: 'en' | 'ar') {
  // Look for language switcher
  const switcher = page.locator('[class*="language"], button:has-text("EN"), button:has-text("عر")').first();
  if (await switcher.isVisible()) {
    await switcher.click();
    const option = language === 'ar' ?
      page.locator('text=العربية, text=Arabic').first() :
      page.locator('text=English').first();
    await option.click();
    await page.waitForTimeout(500); // Wait for language change
  }
}

// Helper: Check RTL
async function checkRTL(page: Page, shouldBeRTL: boolean) {
  const html = page.locator('html');
  const dir = await html.getAttribute('dir');
  expect(dir).toBe(shouldBeRTL ? 'rtl' : 'ltr');
}

test.describe('Phase 1: Authentication & Language Switching', () => {

  test('1.1: Login page displays in English', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for English text
    await expect(page.locator('text=/Sign.*In|Login/i')).toBeVisible();
    await expect(page.locator('text=/Username/i')).toBeVisible();
    await expect(page.locator('text=/Password/i')).toBeVisible();

    // Check LTR direction
    await checkRTL(page, false);
  });

  test('1.2: Switch to Arabic on login page', async ({ page }) => {
    await page.goto(BASE_URL);

    // Switch to Arabic
    await switchLanguage(page, 'ar');

    // Check RTL direction
    await checkRTL(page, true);

    // Check for Arabic text
    const body = await page.textContent('body');
    expect(body).toMatch(/تسجيل|اسم المستخدم|كلمة المرور/);
  });

  test('1.3: Admin login successful', async ({ page }) => {
    await login(page, ADMIN_CREDS.username, ADMIN_CREDS.password);

    // Should be on dashboard
    expect(page.url()).toMatch(/dashboard/i);
  });

  test('1.4: Invalid login shows error', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.fill('input[name="username"], input[type="text"]', 'admin');
    await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/Invalid|Incorrect|Error|خطأ/i')).toBeVisible({ timeout: 5000 });
  });

  test('1.5: Language persists after refresh', async ({ page }) => {
    await page.goto(BASE_URL);
    await switchLanguage(page, 'ar');
    await checkRTL(page, true);

    // Refresh page
    await page.reload();

    // Should still be Arabic
    await checkRTL(page, true);
  });
});

test.describe('Phase 2: Dashboard - Bilingual', () => {

  test('2.1: Dashboard displays in English after login', async ({ page }) => {
    await login(page, ADMIN_CREDS.username, ADMIN_CREDS.password);

    // Check for English dashboard elements
    await expect(page.locator('text=/Dashboard/i')).toBeVisible();
    await expect(page.locator('text=/Total.*Books|Books/i')).toBeVisible();
  });

  test('2.2: Switch to Arabic in dashboard', async ({ page }) => {
    await login(page, ADMIN_CREDS.username, ADMIN_CREDS.password);
    await switchLanguage(page, 'ar');

    // Check RTL
    await checkRTL(page, true);

    // Check for Arabic text
    const body = await page.textContent('body');
    expect(body).toMatch(/لوحة|التحكم|الكتب|المستخدمون/);
  });

  test('2.3: Statistics display correctly in both languages', async ({ page }) => {
    await login(page, ADMIN_CREDS.username, ADMIN_CREDS.password);

    // English
    const englishStats = await page.locator('text=/Total|Available|Borrowed/i').count();
    expect(englishStats).toBeGreaterThan(0);

    // Switch to Arabic
    await switchLanguage(page, 'ar');

    // Arabic stats
    const arabicStats = await page.textContent('body');
    expect(arabicStats).toMatch(/إجمالي|المتاحة|المعارة/);
  });
});

test.describe('Phase 3: Inventory - Books with Arabic', () => {

  test('3.1: Navigate to Inventory in English', async ({ page }) => {
    await login(page, ADMIN_CREDS.username, ADMIN_CREDS.password);

    // Click Inventory/Books link
    await page.click('text=/Inventory|Books|Catalog/i');

    // Should show inventory page
    await expect(page.locator('text=/Add.*Book|New.*Instance/i')).toBeVisible({ timeout: 10000 });
  });

  test('3.2: Add book with Arabic title', async ({ page }) => {
    await login(page, ADMIN_CREDS.username, ADMIN_CREDS.password);

    // Navigate to inventory
    await page.click('text=/Inventory|Books|Catalog/i');
    await page.waitForTimeout(1000);

    // Click Add Book button
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")').first();
    await addButton.click();
    await page.waitForTimeout(500);

    // Fill Arabic title
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    await titleInput.fill('كتاب اختبار تلقائي');

    // Fill type if needed
    const typeSelect = page.locator('select[name="instance_type"], select[name="type"]').first();
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption('text');
    }

    // Submit
    await page.click('button:has-text("Create"), button:has-text("Save"), button[type="submit"]');

    // Should show success message or return to list
    await page.waitForTimeout(2000);
  });

  test('3.3: Search for Arabic book', async ({ page }) => {
    await login(page, ADMIN_CREDS.username, ADMIN_CREDS.password);
    await page.click('text=/Inventory|Books|Catalog/i');
    await page.waitForTimeout(1000);

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await searchInput.fill('كتاب');
    await page.waitForTimeout(1000);

    // Should show results with Arabic text
    const body = await page.textContent('body');
    expect(body).toMatch(/كتاب/);
  });

  test('3.4: Inventory page in Arabic (RTL)', async ({ page }) => {
    await login(page, ADMIN_CREDS.username, ADMIN_CREDS.password);
    await switchLanguage(page, 'ar');

    await page.click('text=/المخزون|الكتب/');
    await page.waitForTimeout(1000);

    // Check RTL
    await checkRTL(page, true);

    // Check for Arabic labels
    const body = await page.textContent('body');
    expect(body).toMatch(/إضافة|عنوان|المؤلف/);
  });
});

test.describe('Phase 4: Users Management - Arabic Names', () => {

  test('4.1: Navigate to Users page', async ({ page }) => {
    await login(page, ADMIN_CREDS.username, ADMIN_CREDS.password);

    await page.click('text=/Users|Members|المستخدمون/i');
    await page.waitForTimeout(1000);

    // Should show users list
    await expect(page.locator('text=/Username|Email|اسم المستخدم/i')).toBeVisible({ timeout: 10000 });
  });

  test('4.2: Add user with Arabic name', async ({ page }) => {
    await login(page, ADMIN_CREDS.username, ADMIN_CREDS.password);
    await page.click('text=/Users|Members/i');
    await page.waitForTimeout(1000);

    // Click Add User
    const addButton = page.locator('button:has-text("Add"), button:has-text("New User"), button:has-text("Create")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);

      // Fill form with Arabic name
      const timestamp = Date.now();
      await page.fill('input[name="username"]', `test_ar_${timestamp}`);
      await page.fill('input[name="email"]', `test${timestamp}@example.com`);
      await page.fill('input[name="password"]', 'Test@12345');

      // First name in Arabic
      const firstNameInput = page.locator('input[name="firstName"], input[name*="first"]').first();
      if (await firstNameInput.isVisible()) {
        await firstNameInput.fill('محمد');
      }

      // Submit
      await page.click('button:has-text("Create"), button:has-text("Save"), button[type="submit"]');
      await page.waitForTimeout(2000);
    }
  });

  test('4.3: Users page in Arabic', async ({ page }) => {
    await login(page, ADMIN_CREDS.username, ADMIN_CREDS.password);
    await switchLanguage(page, 'ar');

    await page.click('text=/المستخدمون|الأعضاء/');
    await page.waitForTimeout(1000);

    // Check RTL
    await checkRTL(page, true);

    // Check for Arabic headers
    const body = await page.textContent('body');
    expect(body).toMatch(/اسم المستخدم|البريد|الحالة/);
  });
});

test.describe('Phase 5: RTL Layout Verification', () => {

  test('5.1: All pages switch to RTL in Arabic', async ({ page }) => {
    await login(page, ADMIN_CREDS.username, ADMIN_CREDS.password);
    await switchLanguage(page, 'ar');

    const pages = [
      'text=/لوحة التحكم/',  // Dashboard
      'text=/المخزون/',      // Inventory
      'text=/المستخدمون/',   // Users
    ];

    for (const pageLink of pages) {
      const link = page.locator(pageLink).first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForTimeout(500);
        await checkRTL(page, true);
      }
    }
  });

  test('5.2: Navigation menu RTL', async ({ page }) => {
    await login(page, ADMIN_CREDS.username, ADMIN_CREDS.password);
    await switchLanguage(page, 'ar');

    // Check navigation is RTL
    const nav = page.locator('nav, [role="navigation"]').first();
    if (await nav.isVisible()) {
      const textAlign = await nav.evaluate((el) =>
        window.getComputedStyle(el).textAlign
      );
      // In RTL, text should be right-aligned
      expect(['right', 'start']).toContain(textAlign);
    }
  });

  test('5.3: Forms RTL aligned', async ({ page }) => {
    await login(page, ADMIN_CREDS.username, ADMIN_CREDS.password);
    await switchLanguage(page, 'ar');

    // Go to add book form
    await page.click('text=/المخزون/');
    await page.waitForTimeout(1000);

    const addButton = page.locator('button:has-text("إضافة")').first();
    if (await addButton.isVisible()) {
      await addButton.click();
      await page.waitForTimeout(500);

      // Check form inputs are right-aligned
      await checkRTL(page, true);
    }
  });
});

test.describe('Phase 6: Patron User Tests', () => {

  test('6.1: Patron can login', async ({ page }) => {
    await login(page, PATRON_CREDS.username, PATRON_CREDS.password);

    // Should reach dashboard
    expect(page.url()).toMatch(/dashboard/i);
  });

  test('6.2: Patron cannot access admin features', async ({ page }) => {
    await login(page, PATRON_CREDS.username, PATRON_CREDS.password);

    // Try to navigate to users (admin feature)
    await page.goto(`${BASE_URL}/users`);
    await page.waitForTimeout(1000);

    // Should be redirected or show error
    const url = page.url();
    const body = await page.textContent('body');

    // Either redirected away from /users or shows 403/forbidden
    expect(url.includes('/users') && !body.match(/forbidden|403|unauthorized/i)).toBe(false);
  });

  test('6.3: Patron dashboard in Arabic', async ({ page }) => {
    await login(page, PATRON_CREDS.username, PATRON_CREDS.password);
    await switchLanguage(page, 'ar');

    await checkRTL(page, true);

    // Check for Arabic patron features
    const body = await page.textContent('body');
    expect(body).toMatch(/الكتب|المعارة|الغرامات|ملفي/);
  });
});

test.describe('Phase 7: Typography & Fonts', () => {

  test('7.1: Arabic text renders correctly', async ({ page }) => {
    await login(page, ADMIN_CREDS.username, ADMIN_CREDS.password);
    await switchLanguage(page, 'ar');

    // Get body text
    const bodyText = await page.textContent('body');

    // Check for Arabic characters
    expect(bodyText).toMatch(/[\u0600-\u06FF]/); // Arabic Unicode range

    // Check text is visible (not size 0 or hidden)
    const bodyElement = page.locator('body');
    const fontSize = await bodyElement.evaluate((el) =>
      window.getComputedStyle(el).fontSize
    );
    expect(parseInt(fontSize)).toBeGreaterThan(0);
  });

  test('7.2: Mixed English-Arabic text displays', async ({ page }) => {
    await login(page, ADMIN_CREDS.username, ADMIN_CREDS.password);

    // Navigate to inventory where we created mixed books
    await page.click('text=/Inventory|Books/i');
    await page.waitForTimeout(1000);

    // Search for bilingual content
    const body = await page.textContent('body');

    // Should have both English and Arabic
    expect(body).toMatch(/[a-zA-Z]/); // English letters
    expect(body).toMatch(/[\u0600-\u06FF]/); // Arabic letters
  });
});

test.describe('Phase 8: Language Persistence', () => {

  test('8.1: Language persists after logout and login', async ({ page }) => {
    await page.goto(BASE_URL);
    await switchLanguage(page, 'ar');

    // Login
    await login(page, ADMIN_CREDS.username, ADMIN_CREDS.password);

    // Should still be Arabic
    await checkRTL(page, true);

    // Logout
    const logoutButton = page.locator('button:has-text("تسجيل الخروج"), button:has-text("Logout"), text=Logout').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForTimeout(500);
    }

    // Should still be Arabic on login page
    await checkRTL(page, true);
  });

  test('8.2: Language persists in new tab', async ({ context }) => {
    const page1 = await context.newPage();
    await page1.goto(BASE_URL);
    await switchLanguage(page1, 'ar');

    // Open new tab
    const page2 = await context.newPage();
    await page2.goto(BASE_URL);
    await page2.waitForTimeout(500);

    // New tab should also be Arabic
    await checkRTL(page2, true);

    await page1.close();
    await page2.close();
  });
});

test.describe('Phase 9: Error Messages', () => {

  test('9.1: Validation errors in English', async ({ page }) => {
    await page.goto(BASE_URL);

    // Try to submit empty login
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Should show English error
    const body = await page.textContent('body');
    expect(body).toMatch(/required|invalid|error|please/i);
  });

  test('9.2: Validation errors in Arabic', async ({ page }) => {
    await page.goto(BASE_URL);
    await switchLanguage(page, 'ar');

    // Try to submit empty login
    await page.click('button[type="submit"]');
    await page.waitForTimeout(500);

    // Should show Arabic error
    const body = await page.textContent('body');
    expect(body).toMatch(/مطلوب|خطأ|الرجاء/);
  });
});

// Summary test
test('10: Complete E2E Flow - Bilingual', async ({ page }) => {
  // 1. Start in English
  await page.goto(BASE_URL);
  await expect(page.locator('text=/Sign.*In|Login/i')).toBeVisible();

  // 2. Switch to Arabic
  await switchLanguage(page, 'ar');
  await checkRTL(page, true);

  // 3. Login
  await login(page, ADMIN_CREDS.username, ADMIN_CREDS.password);

  // 4. Should be on dashboard in Arabic
  await checkRTL(page, true);

  // 5. Navigate to inventory
  await page.click('text=/المخزون|الكتب/');
  await page.waitForTimeout(1000);

  // 6. Search for Arabic text
  const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.fill('كتاب');
    await page.waitForTimeout(1000);
  }

  // 7. Switch back to English
  await switchLanguage(page, 'en');
  await checkRTL(page, false);

  // 8. Should show English labels
  const body = await page.textContent('body');
  expect(body).toMatch(/Title|Author|ISBN|Book/i);

  console.log('✅ Complete bilingual flow successful!');
});
