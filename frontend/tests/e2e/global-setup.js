/**
 * Playwright Global Setup
 * 
 * This runs once before all tests to ensure Vite dev server is fully warmed up
 * and ready to serve assets without rate limiting issues.
 */

import { chromium } from '@playwright/test';

export default async function globalSetup() {
  console.log('🔧 Global Setup: Warming up Vite dev server...');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Give Vite extra time to start after webServer reports ready
    console.log('⏱️  Waiting 5 seconds for Vite to fully initialize...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Make a test request to warm up the server
    console.log('🌡️  Making warmup request to prime Vite cache...');
    const response = await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ Warmup request completed:', response?.status());
    
    // Wait for all assets to load
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Give time for HMR to settle
    console.log('⏱️  Waiting 3 more seconds for HMR to settle...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ Global Setup: Vite dev server is warmed up and ready!');
    
  } catch (error) {
    console.error('❌ Global Setup failed:', error.message);
    console.error('⚠️  Tests may experience issues with cold server');
  } finally {
    await browser.close();
  }
}
