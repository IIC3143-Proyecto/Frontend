import { type Page, expect } from '@playwright/test';
import path from 'path';

export const AVATAR_FILE = path.join(__dirname, 'fixtures/avatar.webp');

export type ErrorScenario =
  | 'NONE'
  | 'AVATAR_401'
  | 'AVATAR_422'
  | 'AVATAR_500'
  | 'AVATAR_TIMEOUT'
  | 'AVATAR_NETWORK'
  | 'AVATAR_SLOW'
  | 'PATCH_401'
  | 'PATCH_409'
  | 'PATCH_500'
  | 'PATCH_TIMEOUT'
  | 'PATCH_NETWORK';

/** Navigate to /onboarding and wait for MSW + form to be ready. */
export async function gotoOnboarding(page: Page) {
  await page.goto('/onboarding');
  await expect(page.getByRole('heading', { name: 'Completa tu perfil' })).toBeVisible({
    timeout: 15_000,
  });
}

/** Set an MSW error scenario in the running page context. */
export async function setErrorScenario(page: Page, scenario: ErrorScenario) {
  await page.evaluate((s) => {
    (window as Window & { __setErrorScenario: (s: string) => void }).__setErrorScenario(s);
  }, scenario);
}

/** Reset the MSW error scenario to NONE without navigating away. */
export async function resetErrorScenario(page: Page) {
  await page.evaluate(() => {
    (window as Window & { __resetErrorScenario: () => void }).__resetErrorScenario();
  });
}

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
