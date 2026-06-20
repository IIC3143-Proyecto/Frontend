import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

export default defineConfig({
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
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
      name: 'live',
      testDir: 'tests/e2e',
      testMatch: '**/live-backend.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        serviceWorkers: 'block',
        storageState: 'tests/e2e/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
  webServer: [
    {
      // MSW disabled so remote() resolves to absolute backend URLs
      command: 'NEXT_PUBLIC_ENABLE_MSW=false npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
    ...(BACKEND_URL ? [{
      command: 'echo "waiting for backend..."',
      url: `${BACKEND_URL}/health`,
      reuseExistingServer: true,
      timeout: 120_000,
    }] : []),
  ],
});
