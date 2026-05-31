import { test, expect } from '@playwright/test';
import { mockSyncUserError, waitForMSW } from '../e2e/helpers/auth';

test.describe('Errores de sync-user', () => {
  test.setTimeout(30_000);

  test('401 (AUTH_EXPIRED): redirige a /session-expired sin reintentos', async ({ page }) => {
    await mockSyncUserError(page, 401);
    await page.goto('/profile');
    await waitForMSW(page);
    await expect(page).toHaveURL(/\/session-expired/, { timeout: 5_000 });
  });

  test('500 (SERVER_ERROR): muestra "Error al conectar con el servidor"', async ({ page }) => {
    await mockSyncUserError(page, 500);
    await page.goto('/profile');
    await waitForMSW(page);
    await expect(page.getByText('Error al conectar con el servidor'))
      .toBeVisible({ timeout: 15_000 });
  });

  test('503 (UNAVAILABLE): muestra botón "Reintentar"', async ({ page }) => {
    await mockSyncUserError(page, 503);
    await page.goto('/profile');
    await waitForMSW(page);
    await expect(page.getByRole('button', { name: 'Reintentar' }))
      .toBeVisible({ timeout: 15_000 });
  });

  test('403 (FORBIDDEN): muestra error, no redirige a /login', async ({ page }) => {
    await mockSyncUserError(page, 403);
    await page.goto('/profile');
    await waitForMSW(page);
    await expect(page.getByText('Error al conectar con el servidor'))
      .toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL('/profile');
  });

  test('"Reintentar" recarga la página y el error persiste', async ({ page }) => {
    await mockSyncUserError(page, 500);
    await page.goto('/profile');
    await waitForMSW(page);
    await expect(page.getByRole('button', { name: 'Reintentar' }))
      .toBeVisible({ timeout: 15_000 });

    await Promise.all([
      page.waitForLoadState('load'),
      page.getByRole('button', { name: 'Reintentar' }).click(),
    ]);
    await waitForMSW(page);
    await expect(page.getByText('Error al conectar con el servidor'))
      .toBeVisible({ timeout: 15_000 });
  });
});
