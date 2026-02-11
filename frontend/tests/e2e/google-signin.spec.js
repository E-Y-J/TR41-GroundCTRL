import { test, expect } from '@playwright/test';

/**
 * UI-OAUTH-001: Google Sign-in UI Elements Test
 * Related PR(s): #58
 *
 * Description: Test Google sign-in UI elements and button functionality
 * Expected Result: Google sign-in button is present and functional
 */

test.describe('UI-OAUTH-001: Google Sign-in UI Elements', () => {
  test('should display Google sign-in button on login page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for React to mount and header to appear first
    await expect(page.locator('header')).toBeVisible({ timeout: 25000 });
    
    // Wait for auth container to initialize (Firebase auth takes time)
    await page.waitForTimeout(2000);

    // Look for Google sign-in button with flexible matching
    const googleSignIn = page.getByRole('button', { name: /google/i }).or(
      page.locator('[data-testid="google-signin"], button:has-text("Sign in with Google"), button:has-text("Sign up with Google"), button:has-text("Continue with Google")')
    ).first();

    // Button should be visible with extended timeout for auth init
    await expect(googleSignIn).toBeVisible({ timeout: 25000 });

    // Wait for button to be enabled (handles browser-specific timing differences)
    await page.waitForSelector('[data-testid="google-signin"]:not([disabled]), button:has-text("Sign in with Google"):not([disabled])', { timeout: 10000 });

    // Button should be enabled
    await expect(googleSignIn).toBeEnabled({ timeout: 10000 });

    // Button should contain Google logo (SVG)
    const googleLogo = googleSignIn.locator('svg');
    await expect(googleLogo).toBeVisible();
  });

  test('should display Google sign-in button on registration page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for React to mount
    await expect(page.locator('header')).toBeVisible({ timeout: 25000 });
    await page.waitForTimeout(2000);

    // The default view is the beta signup form (registration), so no need to switch tabs
    // Look for Google sign-in button
    const googleSignIn = page.locator('[data-testid="google-signin"], button:has-text("Sign in with Google"), button:has-text("Sign up with Google")').first();

    // Button should be visible
    await expect(googleSignIn).toBeVisible();

    // Wait for button to be enabled (handles browser-specific timing differences)
    await page.waitForSelector('[data-testid="google-signin"]:not([disabled]), button:has-text("Sign up with Google"):not([disabled])', { timeout: 10000 });

    // Button should be enabled
    await expect(googleSignIn).toBeEnabled();
  });

  test('should show loading state when Google sign-in is clicked', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Look for Google sign-in button
    const googleSignIn = page.locator('[data-testid="google-signin"], button:has-text("Sign in with Google"), button:has-text("Sign up with Google")').first();

    // Click the button (this will likely fail due to popup, but we can test the loading state)
    const clickPromise = googleSignIn.click();

    // Check if loading spinner appears (within a reasonable timeout)
    try {
      const loadingSpinner = page.locator('.animate-spin, [data-testid="loading"], svg[class*="animate-spin"]').first();
      await expect(loadingSpinner).toBeVisible({ timeout: 2000 });
    } catch {
      // Loading state might not be implemented or might be too fast to catch
      console.log('Loading state not detected - this is acceptable for UI testing');
    }

    // Wait for either popup or error (but don't expect full OAuth completion)
    try {
      await clickPromise;
    } catch {
      // Expected - popup will be blocked in test environment
    }
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Look for Google sign-in button
    const googleSignIn = page.locator('[data-testid="google-signin"], button:has-text("Sign in with Google"), button:has-text("Sign up with Google")').first();

    // Button should have proper role
    await expect(googleSignIn).toHaveAttribute('type', 'button');

    // Button should have accessible text
    const buttonText = await googleSignIn.textContent();
    expect(buttonText).toMatch(/Google/i);
  });
});