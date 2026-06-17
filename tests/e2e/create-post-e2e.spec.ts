import { test, expect } from '@playwright/test';

test.describe('Create Post E2E (real backend)', () => {
  // Needs a test user with completed onboarding (bio filled) in the real backend.
  test.fixme(true, 'TODO: implement with dedicated test account');

  test('authenticated user can open create-post modal', async ({ page }) => {
    await page.goto('/posts');
    await page.getByRole('button', { name: 'Nueva Publicación' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('completing all steps creates a post', async ({ page }) => {
    // TODO: fill title, upload photos, select tags, publish
  });
});
