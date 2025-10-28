/**
 * E2E Tests - Search & Discovery
 * Tests catalog search, autocomplete, and faceted navigation
 */

import { test, expect } from '@playwright/test';

test.describe('Search & Discovery', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should navigate to search page', async ({ page }) => {
    await page.goto('/search');

    await expect(page.getByRole('heading', { name: /search/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search catalog/i)).toBeVisible();
  });

  test('should perform basic search', async ({ page }) => {
    await page.goto('/search');

    // Type search query
    await page.getByPlaceholder(/search catalog/i).fill('introduction');
    await page.getByRole('button', { name: /search/i }).click();

    // Verify results displayed
    await expect(page.getByText(/results/i)).toBeVisible();
  });

  test('should show autocomplete suggestions', async ({ page }) => {
    await page.goto('/search');

    // Type in search box
    await page.getByPlaceholder(/search catalog/i).fill('intro');

    // Wait for autocomplete
    await page.waitForTimeout(400);

    // Verify suggestions appear
    const suggestions = page.getByRole('listbox');
    await expect(suggestions).toBeVisible();
  });

  test('should filter search results by type', async ({ page }) => {
    await page.goto('/search');

    // Perform search
    await page.getByPlaceholder(/search catalog/i).fill('book');
    await page.getByRole('button', { name: /search/i }).click();

    // Apply type filter
    await page.getByLabel(/type/i).selectOption('text');

    // Verify filter applied
    await expect(page).toHaveURL(/instance_type=text/);
  });

  test('should filter by language', async ({ page }) => {
    await page.goto('/search');

    // Perform search
    await page.getByPlaceholder(/search catalog/i).fill('test');
    await page.getByRole('button', { name: /search/i }).click();

    // Apply language filter
    await page.getByLabel(/language/i).selectOption('eng');

    // Verify filter
    await expect(page).toHaveURL(/language=eng/);
  });

  test('should display facets', async ({ page }) => {
    await page.goto('/search?q=test');

    // Verify facets section visible
    await expect(page.getByText(/filters/i)).toBeVisible();
  });

  test('should paginate search results', async ({ page }) => {
    await page.goto('/search?q=test');

    // Click next page if available
    const nextButton = page.getByRole('button', { name: /next/i });
    if (await nextButton.isEnabled()) {
      await nextButton.click();

      // Verify page changed
      await expect(page).toHaveURL(/skip=10/);
    }
  });

  test('should view item details from search results', async ({ page }) => {
    await page.goto('/search?q=test');

    // Click on first result
    await page.getByRole('link', { name: /view details/i }).first().click();

    // Verify details page
    await expect(page.getByText(/instance details/i)).toBeVisible();
  });
});
