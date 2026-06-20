import { test as setup, expect } from '@playwright/test';
import { mkdir } from 'fs/promises';
import path from 'path';

const authFile = path.join(__dirname, '.auth/user.json');

setup.setTimeout(90_000);

setup('authenticate with Auth0', async ({ page }) => {
  if (!process.env.AUTH0_TEST_EMAIL || !process.env.AUTH0_TEST_PASSWORD) {
    await mkdir(path.dirname(authFile), { recursive: true });
    await page.context().storageState({ path: authFile });
    setup.skip(true, 'AUTH0_TEST_EMAIL / AUTH0_TEST_PASSWORD no configurados en .env.local');
  }

  if (!process.env.LIVE_TEST) {
    // Mock sync-user so setup doesn't require the backend — real sync happens on first page navigation.
    // Skip when LIVE_TEST=true so the real BFF runs and populates dbUserId + status in the session.
    await page.route('**/sync-user', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'setup-user-id',
          username: 'SetupUser',
          email: process.env.AUTH0_TEST_EMAIL!,
          name: 'SetupUser',
          status: 'Activo',
          providerAuth0: 'auth0|setup-user',
          createdAtUtcMinus3: new Date().toISOString(),
          updatedAtUtcMinus3: new Date().toISOString(),
          posts: [],
          interactions: [],
        }),
      })
    );
  }

  await page.goto('/login');
  await page.waitForURL(/auth0\.com/, { timeout: 15_000 });
  await page.fill('[name="username"]', process.env.AUTH0_TEST_EMAIL!);
  await page.fill('[name="password"]', process.env.AUTH0_TEST_PASSWORD!);
  await page.click('[name="action"]');
  await page.waitForURL(/localhost:3000/, { timeout: 15_000 });

  await expect(page.getByText('Sincronizando con VTRNA')).not.toBeVisible({ timeout: 20_000 });
  // Wait for useAuth to process and any client-side redirects to settle
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});

  await page.context().storageState({ path: authFile });
});
