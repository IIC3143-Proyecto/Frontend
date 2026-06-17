import { test, expect } from '@playwright/test';

test.describe('Onboarding E2E (real backend)', () => {
  test('new user sees onboarding intro screen', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.getByRole('heading', { name: '¡Arma tu perfil!' }))
      .toBeVisible({ timeout: 15_000 });
  });

  test.fixme('completing onboarding redirects to /profile', async ({ page }) => {
    // TODO: upload avatar, fill username + bio, submit, expect /profile
  });
});
