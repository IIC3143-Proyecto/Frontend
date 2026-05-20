import { test, expect, Page } from '@playwright/test';
import path from 'path';

const AVATAR_FILE = path.join(__dirname, 'fixtures/avatar.webp');

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function waitForMSW(page: Page) {
  await page.waitForFunction(
    () => typeof (window as any).__resetErrorScenario === 'function',
    { timeout: 10_000 }
  );
}

async function setScenario(page: Page, scenario: string) {
  await page.evaluate((s) => (window as any).__setErrorScenario(s), scenario);
}

async function uploadAvatar(page: Page, file = AVATAR_FILE) {
  await page.locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByText('Converting to WebP…')).toBeHidden({ timeout: 10_000 });
}

async function submitForm(page: Page) {
  await page.getByRole('button', { name: /Guardar perfil/i }).click();
}

// ✅ CORREGIDO: Buscar toast por texto específico
async function waitForToast(page: Page, text: string, options?: { timeout?: number }) {
  await expect(
    page.locator('[data-sonner-toast]').filter({ hasText: text })
  ).toBeVisible(options);
}

// ─── Setup ───────────────────────────────────────────────────────────────────

test.beforeEach(async ({ page }) => {
  await page.goto('/onboarding');
  await waitForMSW(page);
  await page.evaluate(() => (window as any).__resetErrorScenario());
  await expect(page.getByRole('heading', { name: 'Completa tu perfil' })).toBeVisible();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

test('1. happy path — completes profile successfully', async ({ page }) => {
  await uploadAvatar(page);
  await page.getByRole('textbox', { name: /username/i }).fill('valid_user');
  await page.getByRole('textbox', { name: /bio/i }).fill('A short bio');
  await submitForm(page);
  await waitForToast(page, 'Perfil actualizado!');
});

test('2. client validation — shows error for short username', async ({ page }) => {
  await page.getByRole('textbox', { name: /username/i }).fill('ab');
  await page.keyboard.press('Tab');
  await expect(page.getByText('Username debe tener al menos 3 caracteres')).toBeVisible();
});

test('3. avatar required — shows error when avatar is missing', async ({ page }) => {
  await page.getByRole('textbox', { name: /username/i }).fill('valid_user');
  await submitForm(page);
  await expect(page.getByText('Avatar es requerido')).toBeVisible();
});

test('4. API 401 — redirects to session-expired', async ({ page }) => {
  await setScenario(page, 'AVATAR_401');
  await uploadAvatar(page);
  await page.getByRole('textbox', { name: /username/i }).fill('valid_user');
  await submitForm(page);
  await expect(page).toHaveURL('/session-expired', { timeout: 8_000 });
});

test('5. API 422 — shows avatar error for invalid format', async ({ page }) => {
  await setScenario(page, 'AVATAR_422');
  await uploadAvatar(page);
  await page.getByRole('textbox', { name: /username/i }).fill('valid_user');
  await submitForm(page);
  await expect(page.getByText('File must be a WebP image')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Completa tu perfil' })).toBeVisible();
});

test('6. API 409 — shows username field error for duplicate', async ({ page }) => {
  await setScenario(page, 'PATCH_409');
  await uploadAvatar(page);
  await page.getByRole('textbox', { name: /username/i }).fill('taken_username');
  await submitForm(page);
  await expect(page.getByText('Username already taken')).toBeVisible();
  await expect(page.locator('[data-sonner-toast]')).not.toBeAttached();
});

test('7. API 500 — shows error alert for server error', async ({ page }) => {
  await setScenario(page, 'AVATAR_500');
  await uploadAvatar(page);
  await page.getByRole('textbox', { name: /username/i }).fill('valid_user');
  await submitForm(page);
  await waitForToast(page, 'Internal server error');
  await expect(page.getByRole('button', { name: /Guardar perfil/i })).toBeEnabled();
});

test('8. network error — shows connection error alert', async ({ page }) => {
  await setScenario(page, 'AVATAR_NETWORK');
  await uploadAvatar(page);
  await page.getByRole('textbox', { name: /username/i }).fill('valid_user');
  await submitForm(page);
  await waitForToast(page, 'Error de red');
});

test('9. slow response — spinner visible then success', async ({ page }) => {
  await setScenario(page, 'AVATAR_SLOW');
  await uploadAvatar(page);
  await page.getByRole('textbox', { name: /username/i }).fill('valid_user');
  await submitForm(page);
  await expect(page.getByRole('button', { name: /Guardando\.\.\./i })).toBeVisible();
  await waitForToast(page, 'Profile saved!', { timeout: 8_000 });
});

test('10. retry after error — succeeds on second attempt', async ({ page }) => {
  await setScenario(page, 'AVATAR_500');
  await uploadAvatar(page);
  await page.getByRole('textbox', { name: /username/i }).fill('valid_user');
  await submitForm(page);
  await waitForToast(page, 'Internal server error');

  await setScenario(page, 'NONE');
  await submitForm(page);
  await waitForToast(page, 'Perfil actualizado!');
});

test('11. field values persist — form maintains typed values', async ({ page }) => {
  await page.getByRole('textbox', { name: /username/i }).fill('John123');
  await page.getByRole('textbox', { name: /bio/i }).fill('Developer');
  await expect(page.getByRole('textbox', { name: /username/i })).toHaveValue('John123');
  await expect(page.getByRole('textbox', { name: /bio/i })).toHaveValue('Developer');
});

test('12. avatar preview — shows preview after file selection', async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles(AVATAR_FILE);
  await expect(page.getByText('Converting to WebP…')).toBeHidden({ timeout: 10_000 });
  await expect(
    page.locator('[role="img"][aria-label*="Upload avatar"] img')
  ).toBeVisible({ timeout: 5_000 });
});