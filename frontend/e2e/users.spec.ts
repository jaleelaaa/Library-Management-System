/**
 * E2E Tests - User Management Workflows
 * Tests user CRUD operations, search, and filters
 */

import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display users list', async ({ page }) => {
    await page.goto('/users');

    await expect(page.getByRole('heading', { name: /users/i })).toBeVisible();
    await expect(page.getByText(/username/i)).toBeVisible();
    await expect(page.getByText(/email/i)).toBeVisible();
  });

  test('should create a new user', async ({ page }) => {
    await page.goto('/users');

    // Click new user button
    await page.getByRole('button', { name: /new user/i }).click();

    // Fill user form
    await page.getByLabel(/username/i).fill('testuser');
    await page.getByLabel(/first name/i).fill('Test');
    await page.getByLabel(/last name/i).fill('User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/barcode/i).fill('TEST001');
    await page.getByLabel(/password/i).fill('password123');

    // Submit
    await page.getByRole('button', { name: /create/i }).click();

    // Verify success
    await expect(page.getByText(/user created/i)).toBeVisible();
    await expect(page.getByText('testuser')).toBeVisible();
  });

  test('should search for users', async ({ page }) => {
    await page.goto('/users');

    // Type in search box
    await page.getByPlaceholder(/search users/i).fill('test');

    // Wait for search results
    await page.waitForTimeout(500);

    // Verify URL contains search query
    await expect(page).toHaveURL(/q=test/);
  });

  test('should edit a user', async ({ page }) => {
    await page.goto('/users');

    // Click edit button for first user
    await page.getByRole('button', { name: /edit/i }).first().click();

    // Update fields
    await page.getByLabel(/first name/i).fill('Updated');

    // Submit
    await page.getByRole('button', { name: /update/i }).click();

    // Verify success
    await expect(page.getByText(/updated successfully/i)).toBeVisible();
  });

  test('should filter users by status', async ({ page }) => {
    await page.goto('/users');

    // Select status filter
    await page.getByLabel(/status/i).selectOption('active');

    // Verify filter applied
    await expect(page).toHaveURL(/status=active/);
  });

  test('should view user details', async ({ page }) => {
    await page.goto('/users');

    // Click view button for first user
    await page.getByRole('button', { name: /view/i }).first().click();

    // Verify details modal/page
    await expect(page.getByText(/user details/i)).toBeVisible();
  });

  test('should delete a user', async ({ page }) => {
    await page.goto('/users');

    // Click delete button
    await page.getByRole('button', { name: /delete/i }).first().click();

    // Confirm deletion
    await page.getByRole('button', { name: /confirm/i }).click();

    // Verify deletion
    await expect(page.getByText(/deleted successfully/i)).toBeVisible();
  });

  test('should paginate users', async ({ page }) => {
    await page.goto('/users');

    // Click next page
    const nextButton = page.getByRole('button', { name: /next/i });
    if (await nextButton.isEnabled()) {
      await nextButton.click();

      // Verify pagination updated
      await expect(page).toHaveURL(/skip=10/);
    }
  });
});
