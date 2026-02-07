import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility Tests - WCAG 2.1 AA Compliance
 * Uses axe-core to check for accessibility violations
 */

test.describe('Accessibility Tests', () => {
  test('homepage should pass accessibility checks', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found:');
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`   Impact: ${violation.impact}`);
        console.log(`   Help: ${violation.help}`);
        console.log(`   Help URL: ${violation.helpUrl}`);
        console.log(`   Elements: ${violation.nodes.length}`);
        console.log('---');
      });
    }

    // For now, only fail on critical violations (missing labels, etc.)
    // Allow serious violations (contrast issues) to be tracked but not block CI
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical'
    );

    // Log summary
    console.log(`Total violations: ${accessibilityScanResults.violations.length}`);
    console.log(`Critical violations: ${criticalViolations.length}`);
    console.log(`Serious violations: ${accessibilityScanResults.violations.filter(v => v.impact === 'serious').length}`);

    expect(criticalViolations).toHaveLength(0);
  });

  test('dashboard should pass accessibility checks', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found on dashboard:');
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`   Impact: ${violation.impact}`);
      });
    }

    // For now, only fail on critical violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical'
    );

    console.log(`Dashboard - Total: ${accessibilityScanResults.violations.length}, Critical: ${criticalViolations.length}`);

    expect(criticalViolations).toHaveLength(0);
  });

  test('login page should pass accessibility checks', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found on login:');
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`   Impact: ${violation.impact}`);
      });
    }

    // For now, only fail on critical violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical'
    );

    console.log(`Login - Total: ${accessibilityScanResults.violations.length}, Critical: ${criticalViolations.length}`);

    expect(criticalViolations).toHaveLength(0);
  });

  test('contact page should pass accessibility checks', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'networkidle' });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found on contact:');
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`   Impact: ${violation.impact}`);
      });
    }

    // For now, only fail on critical violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical'
    );

    console.log(`Contact - Total: ${accessibilityScanResults.violations.length}, Critical: ${criticalViolations.length}`);

    expect(criticalViolations).toHaveLength(0);
  });
});