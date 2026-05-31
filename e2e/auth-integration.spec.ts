import { test, expect } from '@playwright/test';

/**
 * True integration tests — no mocks.
 * Validates the full chain: Auth0 session → BFF /auth/sync-user → real backend.
 * Requires BACKEND_API_URL to be set in .env.local.
 */

test.describe('Auth0 + backend integration', () => {
  test('backend is reachable', async ({ request }) => {
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    test.skip(!base, 'NEXT_PUBLIC_API_URL not set — skipping real backend tests');

    const res = await request.get(`${base}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json() as { status: string };
    expect(body.status).toBe('ok');
  });

  test('sync-user reaches real backend after Auth0 login', async ({ page }) => {
    test.skip(!process.env.BACKEND_API_URL, 'BACKEND_API_URL not set — skipping real backend tests');

    const [response] = await Promise.all([
      page.waitForResponse('**/auth/sync-user'),
      page.goto('/profile'),
    ]);

    expect(response.status()).toBe(200);

    await expect(page).toHaveURL(/\/(profile|onboarding)/, { timeout: 10_000 });
  });

  test('sync-user response contains expected user fields', async ({ page }) => {
    test.skip(!process.env.BACKEND_API_URL, 'BACKEND_API_URL not set — skipping real backend tests');

    const [response] = await Promise.all([
      page.waitForResponse('**/auth/sync-user'),
      page.goto('/profile'),
    ]);

    expect(response.status()).toBe(200);
    const body = await response.json() as Record<string, unknown>;
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email');
    expect(body).toHaveProperty('onboardingCompleted');
    expect(body).toHaveProperty('providerAuth0');
  });

  test('onboardingCompleted is a boolean derived from bio', async ({ page }) => {
    test.skip(!process.env.BACKEND_API_URL, 'BACKEND_API_URL not set — skipping real backend tests');

    const [response] = await Promise.all([
      page.waitForResponse('**/auth/sync-user'),
      page.goto('/profile'),
    ]);

    expect(response.status()).toBe(200);
    const body = await response.json() as Record<string, unknown>;
    expect(typeof body.onboardingCompleted).toBe('boolean');
    const hasBio = typeof body.bio === 'string' && body.bio.length > 0;
    expect(body.onboardingCompleted).toBe(hasBio);
  });
});
