import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';

import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] ?? 'http://localhost:4200';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  /* Maximum time one test can run for. */
  timeout: 60 * 1000, // Increased from 30s to 60s
  testMatch: ['**/*.spec.ts', '**/*.spec.tsx'],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  /* webServer configuration removed.
      - In CI: Server is started manually in the workflow using http-server.
      - In CI: Server is started manually in the workflow using http-server.
      - Locally: Playwright starts the server using the config below.
   */
  // Conditionally configure webServer for local development only
  ...(!process.env.CI && {
    webServer: {
      command: 'npx nx run starrealms-assistant:serve-static', // Build and serve locally
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env.CI, // Always false here, but good practice
      cwd: workspaceRoot,
      timeout: 120 * 1000, // Longer timeout for local build+serve
    },
  }),
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Uncomment for mobile browsers support
    /* {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

    // Uncomment for branded browsers
    /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
  ],
  // globalSetup: join(__dirname, 'global-setup.ts'),
});
