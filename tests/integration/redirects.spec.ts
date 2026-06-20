import { test, expect } from '@playwright/test';
import { gotoAuthenticated } from '../e2e/helpers/auth';

test.describe('Onboarding redirects (useAuth)', () => {
  test('FULL: /onboarding redirige a /feed (onboardingCompleted=true)', async ({ page }) => {
    await gotoAuthenticated(page, '/onboarding', 'FULL');
    await expect(page).toHaveURL('/feed');
  });

  test('ONBOARDING_PENDING: /profile redirige a /onboarding', async ({ page }) => {
    await gotoAuthenticated(page, '/profile', 'ONBOARDING_PENDING');
    await expect(page).toHaveURL('/onboarding');
  });

  test('ONBOARDING_PENDING: /onboarding permanece en /onboarding', async ({ page }) => {
    await gotoAuthenticated(page, '/onboarding', 'ONBOARDING_PENDING');
    await expect(page).toHaveURL('/onboarding');
    await expect(page.getByRole('heading', { name: 'Completa tu perfil' })).toBeVisible();
  });

  test('NEW: /notifications redirige a /onboarding', async ({ page }) => {
    await gotoAuthenticated(page, '/notifications', 'NEW');
    await expect(page).toHaveURL('/onboarding');
  });
});

