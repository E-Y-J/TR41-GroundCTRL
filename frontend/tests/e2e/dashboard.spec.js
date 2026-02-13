import { test, expect } from '@playwright/test';

/**
 * UI-DASHBOARD-001: Dashboard Page Functionality Test
 * Related PR(s): Dashboard implementation
 *
 * Description: Test dashboard page loading and user-specific content
 * Expected Result: Dashboard loads with user data and navigation options
 */

test.describe('UI-DASHBOARD-001: Dashboard Page Functionality', () => {
  test('should redirect unauthenticated users to home', async ({ page }) => {
    // Dashboard is now a protected route - unauthenticated users should be redirected
    await page.goto('/dashboard', { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for React to mount and header to appear
    await expect(page.locator('header')).toBeVisible({ timeout: 25000 });
    await page.waitForTimeout(2000);

    // Should be redirected to home page (protected route behavior)
    await expect(page).toHaveURL('/');
    console.log('Unauthenticated user correctly redirected from /dashboard to /');
  });

  test.skip('should display dashboard cards or widgets (requires authentication)', async ({ page }) => {
    // Dashboard is now protected - skipping test that requires authenticated user
    // TODO: Add authentication setup to test authenticated dashboard features
    console.log('Skipped: Dashboard tests require authentication setup');
  });

  test.skip('should have navigation to other sections (requires authentication)', async ({ page }) => {
    // Dashboard is now protected - skipping test that requires authenticated user
    // TODO: Add authentication setup to test authenticated dashboard features
    console.log('Skipped: Dashboard navigation tests require authentication setup');
  });

  test.skip('should be responsive on mobile devices (requires authentication)', async ({ page }) => {
    // Dashboard is now protected - skipping test that requires authenticated user
    // TODO: Add authentication setup to test authenticated dashboard features
    console.log('Skipped: Dashboard responsive tests require authentication setup');
  });
});