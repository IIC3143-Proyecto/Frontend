import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

export default defineConfig({
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    serviceWorkers: 'block',
  },
  projects: [
    {
      name: 'setup',
      testDir: 'tests/e2e',
      testMatch: '**/auth.setup.ts',
    },
    {
      name: 'e2e',
      testDir: 'tests/e2e',
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'integration',
      testDir: 'tests/integration',
      testMatch: '**/*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
  webServer: [
    {
      command: 'NEXT_PUBLIC_ENABLE_MSW=false npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
    ...(BACKEND_URL ? [{
      // Render puede tardar hasta 2 min en despertar — Playwright hace el polling
      command: 'echo "waiting for backend..."',
      url: `${BACKEND_URL}/health`,
      reuseExistingServer: true,
      timeout: 120_000,
    }] : []),
  ],
});
