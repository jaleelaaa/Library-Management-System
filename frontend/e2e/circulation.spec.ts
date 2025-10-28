/**
 * E2E Tests - Circulation Workflows
 * Tests check-out, check-in, renewals, and requests
 */

import { test, expect } from '@playwright/test';

test.describe('Circulation Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should navigate to circulation page', async ({ page }) => {
    await page.getByRole('link', { name: /circulation/i }).click();
    await expect(page).toHaveURL(/\/circulation/);
    await expect(page.getByText(/check.*out/i)).toBeVisible();
  });

  test('should check out an item', async ({ page }) => {
    await page.goto('/circulation');

    // Fill check-out form
    await page.getByLabel(/user.*barcode/i).fill('USER001');
    await page.getByLabel(/item.*barcode/i).fill('ITEM001');

    // Submit
    await page.getByRole('button', { name: /check.*out/i }).click();

    // Verify success
    await expect(page.getByText(/checked out successfully/i)).toBeVisible();
  });

  test('should check in an item', async ({ page }) => {
    await page.goto('/circulation');

    // Fill check-in form
    await page.getByLabel(/item.*barcode/i).fill('ITEM001');

    // Submit
    await page.getByRole('button', { name: /check.*in/i }).click();

    // Verify success
    await expect(page.getByText(/checked in successfully/i)).toBeVisible();
  });

  test('should display loan list', async ({ page }) => {
    await page.goto('/circulation/loans');

    await expect(page.getByRole('heading', { name: /loans/i })).toBeVisible();
    await expect(page.getByText(/due date/i)).toBeVisible();
  });

  test('should renew a loan', async ({ page }) => {
    await page.goto('/circulation/loans');

    // Find and click renew button
    const renewButton = page.getByRole('button', { name: /renew/i }).first();
    await renewButton.click();

    // Verify renewal
    await expect(page.getByText(/renewed successfully/i)).toBeVisible();
  });

  test('should filter loans by status', async ({ page }) => {
    await page.goto('/circulation/loans');

    // Apply filter
    await page.getByLabel(/status/i).selectOption('overdue');

    // Verify filter applied
    await expect(page).toHaveURL(/status=overdue/);
  });

  test('should create a hold request', async ({ page }) => {
    await page.goto('/circulation/requests');

    // Click new request button
    await page.getByRole('button', { name: /new request/i }).click();

    // Fill request form
    await page.getByLabel(/user/i).fill('USER001');
    await page.getByLabel(/item/i).fill('ITEM002');
    await page.getByLabel(/request type/i).selectOption('hold');

    // Submit
    await page.getByRole('button', { name: /create/i }).click();

    // Verify success
    await expect(page.getByText(/request created/i)).toBeVisible();
  });

  test('should cancel a request', async ({ page }) => {
    await page.goto('/circulation/requests');

    // Find and click cancel button
    const cancelButton = page.getByRole('button', { name: /cancel/i }).first();
    await cancelButton.click();

    // Confirm cancellation
    await page.getByRole('button', { name: /confirm/i }).click();

    // Verify cancellation
    await expect(page.getByText(/cancelled successfully/i)).toBeVisible();
  });
});
