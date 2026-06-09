import { test as setup, expect } from '@playwright/test';
import { mkdir } from 'fs/promises';
import path from 'path';

const authFile = path.join(__dirname, '.auth/user.json');

setup('authenticate with Auth0', async ({ page }) => {
  if (!process.env.AUTH0_TEST_EMAIL || !process.env.AUTH0_TEST_PASSWORD) {
    await mkdir(path.dirname(authFile), { recursive: true });
    await page.context().storageState({ path: authFile });
    setup.skip(true, 'AUTH0_TEST_EMAIL / AUTH0_TEST_PASSWORD no configurados en .env.local');
  }

  await page.route('**/sync-user', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'auth0|setup-user',
        username: 'SetupUser',
        email: process.env.AUTH0_TEST_EMAIL!,
        onboardingCompleted: true,
        name: 'SetupUser',
        providerId: 'auth0|setup-user',
      }),
    })
  );

  await page.goto('/login');
  await page.waitForURL(/auth0\.com/, { timeout: 15_000 });
  await page.fill('[name="username"]', process.env.AUTH0_TEST_EMAIL!);
  await page.fill('[name="password"]', process.env.AUTH0_TEST_PASSWORD!);
  await page.click('[name="action"]');
  await page.waitForURL(/localhost:3000/, { timeout: 15_000 });

  await expect(page.getByText('Cargando')).not.toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Sincronizando con VTRNA')).not.toBeVisible({ timeout: 15_000 });

  await page.context().storageState({ path: authFile });
});
