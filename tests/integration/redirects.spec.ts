import { test, expect } from '@playwright/test';
import { gotoAuthenticated } from '../e2e/helpers/auth';

test.describe('Onboarding redirects (useAuth)', () => {
  test('FULL: /onboarding redirige a /profile (onboardingCompleted=true)', async ({ page }) => {
    await gotoAuthenticated(page, '/onboarding', 'FULL');
    await expect(page).toHaveURL('/profile');
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

test.describe('Proxy redirect server-side (sin flicker)', () => {
  // TODO: activar cuando se implemente el endpoint de sesión de test.
  // page.route() intercepta sync-user antes del BFF, por lo que updateSession()
  // nunca corre y el proxy no tiene onboardingCompleted en sesión.
  test.fixme('ONBOARDING_PENDING: /posts redirige a /onboarding sin renderizar la página', async ({ page }) => {
    // Primera visita: sync-user corre y updateSession() persiste onboardingCompleted en la sesión
    await gotoAuthenticated(page, '/posts', 'ONBOARDING_PENDING');
    await expect(page).toHaveURL('/onboarding');

    // Segunda visita: el proxy tiene onboardingCompleted en sesión → redirect server-side
    const statuses: number[] = [];
    page.on('response', res => {
      if (new URL(res.url()).pathname === '/posts') statuses.push(res.status());
    });

    await page.goto('/posts');
    await page.waitForURL('**/onboarding');

    // El servidor nunca devolvió 200 para /posts — fue un redirect directo
    expect(statuses.every(s => s >= 300 && s < 400)).toBe(true);
  });
});
