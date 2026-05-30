import { test, expect } from '@playwright/test';
import { gotoAuthenticated } from './helpers/auth';

const NO_AUTH = { storageState: { cookies: [], origins: [] } };

test.describe('Login — sin sesión', () => {
  test.use(NO_AUTH);

  test('GET /login redirige a Auth0 Universal Login', async ({ page }) => {
    const authorizeReq = page.waitForRequest(req => req.url().includes('/authorize'));
    await page.goto('/login');
    await expect(page).toHaveURL(/auth0\.com/, { timeout: 10_000 });
    expect((await authorizeReq).url()).toContain('client_id=');
  });

  test('GET /signup redirige a Auth0 con screen_hint=signup', async ({ page }) => {
    const authorizeReq = page.waitForRequest(req => req.url().includes('/authorize'));
    await page.goto('/signup');
    await expect(page).toHaveURL(/auth0\.com/, { timeout: 10_000 });
    expect((await authorizeReq).url()).toContain('screen_hint=signup');
  });
});

test.describe('Login — con sesión', () => {
  test('usuario FULL accede a /profile sin redirect', async ({ page }) => {
    await gotoAuthenticated(page, '/profile', 'FULL');
    await expect(page).toHaveURL('/profile');
    await expect(page.getByText('profile')).toBeVisible();
  });
});

test.describe('Logout', () => {
  test('GET /logout limpia sesión y redirige a /', async ({ page }) => {
    await gotoAuthenticated(page, '/profile', 'FULL');
    await page.goto('/logout', { waitUntil: 'commit' });
    await page.waitForURL('http://localhost:3000/', { timeout: 15_000 });

    await page.goto('/profile', { waitUntil: 'commit' });
    await page.waitForURL(/\/login/, { timeout: 10_000 });
  });

  test('después del logout, /profile redirige con returnTo', async ({ page }) => {
    await page.goto('/logout', { waitUntil: 'commit' });
    await page.waitForURL('http://localhost:3000/', { timeout: 15_000 });

    const loginReq = page.waitForRequest(
      req => req.url().includes('localhost:3000/login') && req.url().includes('returnTo='),
      { timeout: 10_000 }
    );
    await page.goto('/profile', { waitUntil: 'commit' });
    expect((await loginReq).url()).toContain('returnTo=%2Fprofile');
  });
});
