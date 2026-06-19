import { test, expect } from '@playwright/test';

test.describe('Onboarding E2E (real backend)', () => {
  test('new user sees onboarding intro screen', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.getByRole('heading', { name: '¡Arma tu perfil!' }))
      .toBeVisible({ timeout: 15_000 });
  });

});
