import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/journeys',
  testMatch: '**/*.spec.ts',

  workers: 1,
  fullyParallel: false,

  timeout:  60_000,
  retries:  process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL:       process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
    trace:         'on-first-retry',
    screenshot:    'only-on-failure',
    video:         'retain-on-failure',
    actionTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url:     process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },

  outputDir: 'e2e/test-results',
})
