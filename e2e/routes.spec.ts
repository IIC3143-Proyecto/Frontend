import { test, expect } from '@playwright/test';
import { gotoAuthenticated, waitForMSW } from './helpers/auth';

const NO_AUTH = { storageState: { cookies: [], origins: [] } };

const PRIVATE_ROUTES = [
  '/notifications',
  '/profile',
  '/publications',
  '/shopping-history',
  '/onboarding',
] as const;

test.describe('Rutas públicas — sin sesión', () => {
  test.use(NO_AUTH);

  test('GET / accesible y no muestra spinner de auth', async ({ page }) => {
    await page.goto('/');
    await waitForMSW(page);
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('button', { name: 'Health Check' })).toBeVisible();
    await expect(page.getByText('Sincronizando con VTRNA')).not.toBeVisible();
  });

  for (const route of ['/about-us', '/faq'] as const) {
    test(`GET ${route} accesible sin sesión`, async ({ page }) => {
      await page.goto(route);
      await waitForMSW(page);
      await expect(page).toHaveURL(route);
    });
  }
});

test.describe('Rutas privadas — sin sesión (proxy server-side)', () => {
  test.use(NO_AUTH);

  for (const privateRoute of PRIVATE_ROUTES) {
    test(`GET ${privateRoute} redirige a /login con returnTo`, async ({ page }) => {
      const loginReq = page.waitForRequest(
        req => req.url().includes('localhost:3000/login') && req.url().includes('returnTo='),
        { timeout: 10_000 }
      );
      await page.goto(privateRoute, { waitUntil: 'commit' });
      expect((await loginReq).url()).toContain(`returnTo=${encodeURIComponent(privateRoute)}`);
    });
  }
});

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
    await expect(page.getByText('onboarding')).toBeVisible();
  });

  test('NEW: /notifications redirige a /onboarding', async ({ page }) => {
    await gotoAuthenticated(page, '/notifications', 'NEW');
    await expect(page).toHaveURL('/onboarding');
  });
});
