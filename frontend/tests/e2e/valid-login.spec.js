import { test, expect } from '@playwright/test';
import { login } from './helpers.js';

/**
 * UI-002: Valid Login Test
 * Related PR(s): #39
 * 
 * Description: Login with valid credentials → redirect to Home; avatar appears.
 * Expected Result: 302 → Home; Navbar shows avatar.
 */

test.describe('UI-002: Valid Login', () => {
  // Note: These tests require a test user to exist in the system
  // In a real scenario, you'd use test fixtures or a seeded database
  
  const testUser = {
    email: process.env.TEST_USER_EMAIL || 'test-user@groundctrl.test',
    password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
  };

  test('should login successfully and redirect to home page', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill in login form
    await page.fill('input[name="email"], input[type="email"]', testUser.email);
    await page.fill('input[name="password"], input[type="password"]', testUser.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    
    // Verify redirect to home or dashboard
    const url = page.url();
    expect(url).toMatch(/\/(home|dashboard|$)/);
  });

  test('should display user avatar after successful login', async ({ page }) => {
    // Login using helper
    await login(page, testUser.email, testUser.password);
    
    // Wait for navigation and load
    await page.waitForLoadState('networkidle');
    
    // Look for avatar in various possible locations
    const avatar = page.locator('[role="img"], img[alt*="avatar"], img[alt*="Avatar"], [data-testid*="avatar"]').first();
    
    // Avatar should be visible in navbar
    await expect(avatar).toBeVisible();
  });

  test('should maintain session after page refresh', async ({ page }) => {
    // Login
    await login(page, testUser.email, testUser.password);
    await page.waitForLoadState('networkidle');
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // User should still be logged in (check for avatar or user indicator)
    const url = page.url();
    expect(url).not.toContain('/login');
  });

  test('should show user-specific navigation after login', async ({ page }) => {
    await login(page, testUser.email, testUser.password);
    await page.waitForLoadState('networkidle');
    
    // Check for authenticated navigation items (logout button, profile, etc.)
    const navbar = page.locator('nav, [role="navigation"]');
    await expect(navbar).toBeVisible();
    
    // Look for common authenticated UI elements
    const hasAuthElements = await page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Profile"), [data-testid*="user-menu"]').count();
    expect(hasAuthElements).toBeGreaterThan(0);
  });
});
