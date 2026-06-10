import { type Page, expect } from '@playwright/test';
import path from 'path';

export const AVATAR_FILE = path.join(__dirname, '../../e2e/fixtures/avatar.webp');

/**
 * Upload the fixture avatar via the hidden react-dropzone input.
 * Waits for the WebP conversion to complete by asserting the blob preview.
 */
export async function uploadAvatar(page: Page) {
  await page.locator('input[type="file"]').setInputFiles(AVATAR_FILE);
  await expect(page.locator('img[alt="Vista previa del avatar"]')).toHaveAttribute(
    'src',
    /^blob:/,
    { timeout: 5_000 },
  );
}

export async function fillUsername(page: Page, value: string) {
  await page.getByPlaceholder('Escribe tu username').fill(value);
}

export async function fillBio(page: Page, value: string) {
  await page.getByPlaceholder('Escribe una breve biografía sobre ti...').fill(value);
}

export async function clickEmpezar(page: Page) {
  await page.getByRole('button', { name: 'Empezar' }).click();
}

export async function fillInstagram(page: Page, value: string) {
  await page.getByPlaceholder('tu_usuario').fill(value);
}

export async function clickNext(page: Page) {
  await page.getByRole('button', { name: /Siguiente|Ver resumen/ }).click();
}

export async function clickBack(page: Page) {
  await page.getByRole('button', { name: 'Atrás' }).click();
}

export async function clickFinish(page: Page) {
  await page.getByRole('button', { name: 'Finalizar' }).click();
}

/**
 * Search for a metro station and select it via its checkbox.
 */
export async function selectMetroStation(page: Page, stationName: string) {
  await page.getByPlaceholder('Buscar estación...').fill(stationName);
  await page.getByRole('checkbox', { name: stationName }).check();
}

/** Wait for any visible Sonner toast containing the given text. */
export async function waitForToast(page: Page, text: string | RegExp, timeout = 8_000) {
  await expect(
    page.locator('[data-sonner-toast]').filter({ hasText: text }),
  ).toBeVisible({ timeout });
}

/** Assert a validation or server error message is visible anywhere on the page. */
export async function expectError(page: Page, message: string) {
  await expect(page.getByText(message, { exact: false })).toBeVisible();
}

/**
 * Navigate through all 4 steps with minimal valid data and reach the summary screen.
 * Step 1: avatar + username + bio. Step 2: skipped. Step 3: instagram. Step 4: one metro station.
 */
export async function completeAllStepsUntilSummary(page: Page) {
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await fillBio(page, 'Bio de prueba');
  await clickNext(page);

  await clickNext(page);

  await fillInstagram(page, 'testuser');
  await clickNext(page);

  await selectMetroStation(page, 'Baquedano');
  await clickNext(page);
}
