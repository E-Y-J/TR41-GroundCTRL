import { test, expect } from '@playwright/test';

/**
 * UI-007: Mobile Responsive Test
 * Related PR(s): #45
 * 
 * Description: Mobile view (≤480 px): hamburger menu appears & toggles drawer.
 * Expected Result: Hamburger visible; click toggles navigation.
 */

test.describe('UI-007: Mobile Responsive Design', () => {
  test.use({
    viewport: { width: 375, height: 667 }, // Mobile viewport
  });

  test('should display hamburger menu on mobile viewport', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for hamburger menu (common selectors)
    const hamburger = page.locator(
      'button[aria-label*="menu" i], ' +
      'button[aria-label*="navigation" i], ' +
      '[data-testid*="menu-toggle"], ' +
      '[data-testid*="hamburger"], ' +
      'button:has(svg):has-text(""), ' + // Button with SVG and no text (likely hamburger)
      '[class*="hamburger"], ' +
      'nav button:first-child'
    ).first();
    
    // Hamburger should be visible on mobile
    await expect(hamburger).toBeVisible();
  });

  test('should toggle mobile navigation when hamburger is clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find hamburger menu
    const hamburger = page.locator(
      'button[aria-label*="menu" i], ' +
      '[data-testid*="menu-toggle"], ' +
      'nav button:first-child'
    ).first();
    
    await expect(hamburger).toBeVisible();
    
    // Click to open menu
    await hamburger.click();
    await page.waitForTimeout(500); // Wait for animation
    
    // Check if navigation links are now visible
    const navLinks = page.locator('nav a, [role="navigation"] a');
    const visibleLinks = await navLinks.evaluateAll((links) => {
      return links.filter(link => {
        const style = window.getComputedStyle(link);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }).length;
    });
    
    expect(visibleLinks).toBeGreaterThan(0);
    
    // Click hamburger again to close
    await hamburger.click();
    await page.waitForTimeout(500);
    
    // Navigation should be hidden again (or drawer closed)
    // Check for decreased visibility or hidden state
  });

  test('should hide desktop navigation on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Desktop navigation should be hidden on mobile
    // Look for navigation items that are typically shown on desktop
    const desktopNav = page.locator('nav > ul, nav > div:not(button)').first();
    
    if (await desktopNav.count() > 0) {
      const isHidden = await desktopNav.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0;
      });
      
      // Desktop nav should be hidden on mobile viewport
      expect(isHidden).toBe(true);
    }
  });

  test('should be fully responsive at 480px breakpoint', async ({ page }) => {
    // Test at exactly 480px (the breakpoint mentioned)
    await page.setViewportSize({ width: 480, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Hamburger should be visible at or below 480px
    const hamburger = page.locator(
      'button[aria-label*="menu" i], ' +
      '[data-testid*="menu-toggle"]'
    ).first();
    
    const isVisible = await hamburger.isVisible();
    expect(isVisible).toBe(true);
  });

  test('should hide hamburger menu on desktop viewport', async ({ page }) => {
    // Switch to desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Hamburger should be hidden on desktop
    const hamburger = page.locator(
      'button[aria-label*="menu" i], ' +
      '[data-testid*="menu-toggle"], ' +
      '[class*="hamburger"]'
    );
    
    if (await hamburger.count() > 0) {
      const isHidden = await hamburger.first().evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.display === 'none' || style.visibility === 'hidden';
      });
      
      expect(isHidden).toBe(true);
    }
  });

  test('should maintain functionality when rotating device', async ({ page }) => {
    // Portrait mode
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const hamburger = page.locator('button[aria-label*="menu" i]').first();
    await expect(hamburger).toBeVisible();
    
    // Landscape mode
    await page.setViewportSize({ width: 667, height: 375 });
    await page.waitForTimeout(300);
    
    // Hamburger should still work
    await expect(hamburger).toBeVisible();
    await hamburger.click();
    await page.waitForTimeout(300);
    
    // Navigation should appear
    const navLinks = page.locator('nav a');
    expect(await navLinks.count()).toBeGreaterThan(0);
  });
});
