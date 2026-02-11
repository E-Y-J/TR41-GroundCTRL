import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration for GroundCTRL Frontend
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  /* Global setup - warm up Vite dev server before tests */
  globalSetup: './tests/e2e/global-setup.js',
  
  /* Increase timeout for slow tests */
  timeout: process.env.CI ? 120 * 1000 : 90 * 1000, // 120 seconds on CI, 90 locally
  
  /* Run tests in files in parallel */
  fullyParallel: true,
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 3 : 0,
  
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  
  /* Reporter to use */
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
    
    /* Global timeout for actions (click, fill, etc.) - helps with slow API responses */
    actionTimeout: process.env.CI ? 25000 : 15000, // 25 seconds on CI, 15 locally (increased for React hydration)
    
    /* Navigation timeout - generous timeout for page loads during API delays */
    navigationTimeout: process.env.CI ? 60000 : 30000, // 60 seconds on CI, 30 locally
    
    /* Wait for at least some network activity to settle before considering page loaded */
    waitForLoadState: 'domcontentloaded', // More lenient than 'networkidle' for slow APIs
  },
  
  /* Global expect timeout for assertions - increased for React hydration delays on CI */
  expect: {
    timeout: process.env.CI ? 20000 : 10000, // 20 seconds on CI, 10 locally
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        // Firefox has intermittent browser protocol errors on context close
        // This doesn't affect test validity, just cleanup
        contextOptions: {
          // Disable session restore to prevent Firefox protocol errors
          ignoreDefaultArgs: ['--restore-session'],
        },
      },
      // Retry Firefox tests once to handle intermittent protocol errors
      retries: 1,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  /* Only start webServer when testing locally (not against deployed URLs) */
  ...(process.env.SKIP_WEBSERVER !== 'true' && {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: process.env.CI ? 180 * 1000 : 120 * 1000, // 3 minutes on CI, 2 minutes locally
      stdout: 'pipe', // Capture output for debugging
      stderr: 'pipe',
      // Wait for server to be truly ready (not just first response)
      // This prevents tests from hitting rate limits during warmup
      env: {
        CI: process.env.CI ? 'true' : undefined,
      },
      // Vite automatically loads .env files - don't override
    },
  }),
});
