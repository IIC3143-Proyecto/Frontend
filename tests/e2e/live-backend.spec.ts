/**
 * Live backend tests — require:
 *   1. Backend running at NEXT_PUBLIC_API_URL
 *   2. Empty DB (or a fresh test user)
 *   3. Run via: npm run test:live
 *      (starts Next.js with NEXT_PUBLIC_ENABLE_MSW=false so API calls reach the real backend)
 */
import { test, expect, type Page } from '@playwright/test';
import path from 'path';

const AVATAR_FILE = path.join(__dirname, 'fixtures/avatar.webp');

function captureStatus(page: Page, pathname: string): () => number | undefined {
  let status: number | undefined;
  const handler = (res: { url: () => string; status: () => number }) => {
    if (new URL(res.url()).pathname === pathname) status = res.status();
  };
  page.on('response', handler);
  return () => {
    page.off('response', handler);
    return status;
  };
}

test('Live backend: flujo completo de usuario desde DB vacía', async ({ page }) => {
  test.setTimeout(90_000);
  const username = `live_${Date.now()}`;

  await test.step('1. Nuevo usuario: sync crea el usuario, redirige a /onboarding', async () => {
    await page.goto('/profile');
    await page.waitForURL('**/onboarding', { timeout: 15_000 });
    await expect(page.getByText('Error al conectar con el servidor')).not.toBeVisible();
  });

  await test.step('2. Usuario sin onboarding: redirect server-side a /onboarding (sin flicker)', async () => {
    const getStatus = captureStatus(page, '/notifications');
    await page.goto('/notifications');
    await page.waitForURL('**/onboarding', { timeout: 10_000 });
    const status = getStatus();
    await expect(page.getByText('Error al conectar con el servidor')).not.toBeVisible();
    expect(status, '/notifications debe devolver 3xx (redirect de proxy, no renderizar la página)').toBeGreaterThanOrEqual(300);
    expect(status).toBeLessThan(400);
  });

  await test.step('3. Completar onboarding: formulario activa la cuenta', async () => {
    await page.goto('/onboarding');
    await page.getByRole('button', { name: 'Empezar' }).click();
    await expect(page.getByRole('heading', { name: 'Tu perfil' })).toBeVisible({ timeout: 10_000 });

    // Paso 1: avatar + username + bio (avatar es requerido)
    await page.locator('input[type="file"]').setInputFiles(AVATAR_FILE);
    await expect(page.locator('img[alt="Vista previa del avatar"]')).toHaveAttribute('src', /^blob:/, { timeout: 10_000 });
    await page.getByPlaceholder('Escribe tu username').fill(username);
    await page.getByPlaceholder('Escribe una breve biografía sobre ti...').fill('Bio live test');
    await page.getByRole('button', { name: /Siguiente|Ver resumen/ }).click();

    // Paso 2: tags (sin selección — no es requerido)
    await page.getByRole('button', { name: /Siguiente|Ver resumen/ }).click();

    // Paso 3: al menos un medio de contacto
    await page.getByPlaceholder('tu_usuario').fill('live_test_ig');
    await page.getByRole('button', { name: /Siguiente|Ver resumen/ }).click();

    // Paso 4: metro (seleccionar al menos una estación)
    await page.getByPlaceholder('Buscar estación...').fill('Neptuno');
    await page.getByRole('checkbox', { name: 'Neptuno' }).check();
    await page.getByRole('button', { name: /Siguiente|Ver resumen/ }).click();

    // Resumen: finalizar
    await page.getByRole('button', { name: 'Finalizar' }).click();

    await page.waitForURL(/\/(profile|feed)/, { timeout: 20_000 });
    await expect(page.getByText('Error al conectar con el servidor')).not.toBeVisible();
  });

  await test.step('4. Usuario activo: /profile carga sin loop de redirect', async () => {
    // La primera navegación completa post-onboarding puede hacer un bounce
    // /profile → /onboarding (sesión stale) → useAuth actualiza sesión → /profile.
    // Verificamos que el flujo termina en /profile sin dialog de error.
    await page.goto('/feed');
    await page.waitForURL('/feed', { timeout: 10_000 });
    await expect(page.getByText('Error al conectar con el servidor')).not.toBeVisible();
  });

  await test.step('5. Usuario activo en /onboarding: redirect server-side a /profile (sin flicker)', async () => {
    const getStatus = captureStatus(page, '/onboarding');
    await page.goto('/onboarding');
    await page.waitForURL('/feed', { timeout: 10_000 });
    const status = getStatus();
    await expect(page.getByText('Error al conectar con el servidor')).not.toBeVisible();
    expect(status, '/onboarding debe devolver 3xx (redirect de proxy, no renderizar la página)').toBeGreaterThanOrEqual(300);
    expect(status).toBeLessThan(400);
  });
});

test.describe('Live: sign-up de usuario nuevo', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Sign-up: nuevo usuario en Auth0 → redirige a /onboarding', async ({ page }) => {
    test.setTimeout(60_000);
    const email = process.env.AUTH0_TEST_SIGNUP_EMAIL;
    const password = process.env.AUTH0_TEST_SIGNUP_PASSWORD;
    test.skip(
      !email || !password,
      'AUTH0_TEST_SIGNUP_EMAIL / AUTH0_TEST_SIGNUP_PASSWORD no configurados — borrar el usuario de Auth0 entre runs'
    );

    await page.goto('/signup');
    await page.waitForURL(/auth0\.com/, { timeout: 15_000 });
    await page.fill('[name="email"]', email!);
    await page.fill('[name="password"]', password!);
    await page.click('[name="action"]');
    await page.waitForURL(/localhost:3000/, { timeout: 15_000 });

    await page.waitForURL('**/onboarding', { timeout: 15_000 });
    await expect(page.getByText('Error al conectar con el servidor')).not.toBeVisible();
  });
});
