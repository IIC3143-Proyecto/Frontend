import { test, expect } from '@playwright/test';
import {
  uploadAvatar,
  fillUsername,
  fillBio,
  submitForm,
  waitForToast,
  expectError,
} from './helpers/onboarding';
import { gotoAuthenticated } from '../e2e/helpers/auth';
import {
  mockDefaultHandlers,
  mockAvatarSuccess,
  mockAvatarError,
  mockAvatarNetwork,
  mockAvatarSlow,
  mockPatchError,
} from './helpers/form-errors';

test.beforeEach(async ({ page }) => {
  await mockDefaultHandlers(page);
  await gotoAuthenticated(page, '/onboarding', 'NEW');
  await expect(page.getByRole('heading', { name: 'Completa tu perfil' })).toBeVisible({
    timeout: 15_000,
  });
});

// TODO: fix avatar preview — imageCompression uses WebWorkers that may be restricted in Playwright
test.skip('should complete onboarding successfully', async ({ page }) => {
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await fillBio(page, 'Una bio de prueba');
  await submitForm(page);
  await waitForToast(page, 'Perfil actualizado!');
});

test('should show validation errors when submitting empty form', async ({ page }) => {
  await submitForm(page);
  await expectError(page, 'Avatar es requerido');
  await expectError(page, 'Username es requerido');
  await expectError(page, 'Bio es requerida');
});

test('should require avatar before form submission', async ({ page }) => {
  await fillUsername(page, 'testuser');
  await fillBio(page, 'Bio de prueba');
  await submitForm(page);
  await expectError(page, 'Avatar es requerido');
  await expect(page.getByText('Username es requerido')).not.toBeVisible();
});

test('should redirect to session-expired when avatar returns 401', async ({ page }) => {
  await mockAvatarError(page, 401);
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await fillBio(page, 'Bio de prueba');
  await submitForm(page);
  await page.waitForURL('**/session-expired', { timeout: 8_000 });
});

test('should show error when file is not valid WebP', async ({ page }) => {
  await mockAvatarError(page, 422);
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await fillBio(page, 'Bio de prueba');
  await submitForm(page);
  await expectError(page, 'File must be a WebP image');
});

test('should show error when username is already taken', async ({ page }) => {
  await mockPatchError(page, 409);
  await uploadAvatar(page);
  await fillUsername(page, 'takenuser');
  await fillBio(page, 'Bio de prueba');
  await submitForm(page);
  await expectError(page, 'Username already taken');
});

test('should show server error toast on 500 response', async ({ page }) => {
  await mockAvatarError(page, 500);
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await fillBio(page, 'Bio de prueba');
  await submitForm(page);
  await waitForToast(page, 'Internal server error');
});

test('should show network error toast on connection failure', async ({ page }) => {
  await mockAvatarNetwork(page);
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await fillBio(page, 'Bio de prueba');
  await submitForm(page);
  await waitForToast(page, 'Error de red');
});

test('should show loading spinner on slow response', async ({ page }) => {
  await mockAvatarSlow(page);
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await fillBio(page, 'Bio de prueba');

  await submitForm(page);
  await expect(page.getByRole('button', { name: 'Guardando...' })).toBeVisible({ timeout: 3_000 });

  await waitForToast(page, 'Perfil actualizado!', 15_000);
});

test('should allow retry after error', async ({ page }) => {
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await fillBio(page, 'Bio de prueba');

  await mockAvatarError(page, 500);
  await submitForm(page);
  await waitForToast(page, 'Internal server error');

  await mockAvatarSuccess(page);
  await submitForm(page);
  await waitForToast(page, 'Perfil actualizado!');
});

test('should persist form values after error', async ({ page }) => {
  await uploadAvatar(page);
  await fillUsername(page, 'persisteduser');
  await fillBio(page, 'Bio que debe persistir');

  await mockAvatarError(page, 500);
  await submitForm(page);
  await waitForToast(page, 'Internal server error');

  await expect(page.getByPlaceholder('Escribe tu username')).toHaveValue('persisteduser');
  await expect(
    page.getByPlaceholder('Escribe una breve biografía sobre ti...'),
  ).toHaveValue('Bio que debe persistir');
});

test('should show avatar preview after file selection', async ({ page }) => {
  const preview = page.locator('img[alt="Vista previa del avatar"]');

  await expect(preview).toHaveCount(0);

  await uploadAvatar(page);

  await expect(preview).toHaveAttribute('src', /^blob:/);
  await expect(preview).toBeVisible();
});
