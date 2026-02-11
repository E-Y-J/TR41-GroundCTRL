import { test } from '@playwright/test';

/**
 * RAW DIAGNOSTIC TEST - No Error Filtering
 * This test shows ALL errors to diagnose why React isn't mounting
 */

test.describe('DIAGNOSTIC: Raw Errors (No Filtering)', () => {
  test('should show all errors without filtering', async ({ page }) => {
    console.log('\n========================================');
    console.log('🔍 DIAGNOSTIC MODE: Capturing ALL errors');
    console.log('========================================\n');
    
    const allConsoleMessages = [];
    const allPageErrors = [];
    const allNetworkErrors = [];
    
    // Capture ALL console messages (not just errors)
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();
      allConsoleMessages.push({ type, text });
      console.log(`[CONSOLE ${type.toUpperCase()}]:`, text);
    });
    
    // Capture ALL page errors
    page.on('pageerror', error => {
      allPageErrors.push(error.message);
      console.error(`[PAGE ERROR]:`, error.message);
      console.error('  Stack:', error.stack);
    });
    
    // Capture ALL failed requests
    page.on('requestfailed', request => {
      const failure = request.failure();
      allNetworkErrors.push({
        url: request.url(),
        error: failure?.errorText || 'Unknown'
      });
      console.error(`[NETWORK FAILED]:`, request.url());
      console.error('  Error:', failure?.errorText);
    });
    
    // Capture response status codes
    page.on('response', response => {
      const status = response.status();
      const url = response.url();
      
      // Log non-200 responses
      if (status >= 400) {
        console.warn(`[HTTP ${status}]:`, url);
      }
    });
    
    console.log('\n📄 Navigating to http://localhost:5173...\n');
    
    const startTime = Date.now();
    const response = await page.goto('http://localhost:5173', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    
    console.log(`\n✅ Page loaded in ${Date.now() - startTime}ms`);
    console.log(`   Status: ${response?.status()}`);
    console.log(`   URL: ${page.url()}\n`);
    
    // Wait a bit for JavaScript to execute
    await page.waitForTimeout(3000);
    
    // Check what's actually in the page
    const htmlContent = await page.content();
    const bodyText = await page.locator('body').textContent();
    const rootHTML = await page.locator('#root').innerHTML();
    const rootVisible = await page.locator('#root').isVisible();
    
    console.log('\n========================================');
    console.log('📊 PAGE STATE');
    console.log('========================================');
    console.log('HTML length:', htmlContent.length);
    console.log('Body text length:', bodyText?.length || 0);
    console.log('Body text preview:', (bodyText || '').substring(0, 200));
    console.log('\n#root innerHTML length:', rootHTML.length);
    console.log('#root innerHTML:', rootHTML || '(empty)');
    console.log('#root visible:', rootVisible);
    
    // Check if main.jsx was loaded
    const scripts = await page.locator('script').count();
    console.log('\nScript tags found:', scripts);
    
    // Try to detect React
    const hasReact = await page.evaluate(() => {
      return typeof window.React !== 'undefined' || 
             document.querySelector('[data-reactroot]') !== null ||
             document.querySelector('._react') !== null;
    });
    console.log('React detected:', hasReact);
    
    // Check if main.jsx console.log fires
    const mainJsxLogged = allConsoleMessages.some(m => m.text.includes('main.jsx loaded'));
    console.log('main.jsx loaded:', mainJsxLogged);
    
    console.log('\n========================================');
    console.log('📋 ERROR SUMMARY');
    console.log('========================================');
    console.log('Total console messages:', allConsoleMessages.length);
    console.log('Total page errors:', allPageErrors.length);
    console.log('Total network errors:', allNetworkErrors.length);
    
    if (allPageErrors.length > 0) {
      console.log('\n❌ PAGE ERRORS:');
      allPageErrors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
    }
    
    if (allNetworkErrors.length > 0) {
      console.log('\n🌐 NETWORK ERRORS:');
      allNetworkErrors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.url}`);
        console.log(`     ${err.error}`);
      });
    }
    
    // Get all error messages
    const errorMessages = allConsoleMessages.filter(m => m.type === 'error');
    if (errorMessages.length > 0) {
      console.log('\n🔴 CONSOLE ERRORS:');
      errorMessages.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err.text}`);
      });
    }
    
    // Take screenshot
    await page.screenshot({ path: 'test-results/diagnostic-page-state.png', fullPage: true });
    console.log('\n📸 Screenshot saved to: test-results/diagnostic-page-state.png');
    
    console.log('\n========================================\n');
    
    // Don't fail the test intentionally - just gather info
  });
});
