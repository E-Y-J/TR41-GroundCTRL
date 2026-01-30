import { test, expect } from '@playwright/test';

/**
 * UI-001: Basic App Rendering Test
 * Related PR(s): #3, #45
 * 
 * Description: Load the app; verify Navbar, Footer, Home page render without JS errors.
 * Expected Result: All three components visible; console-free.
 */

test.describe('UI-001: Basic App Rendering', () => {
  test('should load app with Navbar, Footer, and Home page without console errors', async ({ page }) => {
    // Track console errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to home page
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check that Navbar is visible
    const navbar = page.locator('nav, [role="navigation"], header').first();
    await expect(navbar).toBeVisible();

    // Check that Footer is visible
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();

    // Check that main content/home page is visible
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible();

    // Verify no console errors occurred
    expect(consoleErrors).toHaveLength(0);
  });

  test('should have no JavaScript errors on initial load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });

  test('should load all critical page elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify page title is set
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Verify basic structure
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
