import { type Page, expect } from '@playwright/test';
import path from 'path';

export const AVATAR_FILE = path.join(__dirname, 'fixtures/avatar.webp');

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

export async function submitForm(page: Page) {
  await page.getByRole('button', { name: /Guardar perfil/ }).click();
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
