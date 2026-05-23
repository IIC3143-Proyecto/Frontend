import { test, expect } from '@playwright/test';
import {
  gotoOnboarding,
  setErrorScenario,
  resetErrorScenario,
  uploadAvatar,
  fillUsername,
  fillBio,
  submitForm,
  waitForToast,
  expectError,
} from './helpers';

test.beforeEach(async ({ page }) => {
  await gotoOnboarding(page);
});

test('should complete onboarding successfully', async ({ page }) => {
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
});

test('should require avatar before form submission', async ({ page }) => {
  await fillUsername(page, 'testuser');
  await submitForm(page);
  await expectError(page, 'Avatar es requerido');
  // Username field must not show an error
  await expect(page.getByText('Username es requerido')).not.toBeVisible();
});

test('should redirect to session-expired when avatar returns 401', async ({ page }) => {
  await setErrorScenario(page, 'AVATAR_401');
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await submitForm(page);
  await page.waitForURL('**/session-expired', { timeout: 8_000 });
});

test('should show error when file is not valid WebP', async ({ page }) => {
  await setErrorScenario(page, 'AVATAR_422');
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await submitForm(page);
  await expectError(page, 'File must be a WebP image');
});

test('should show error when username is already taken', async ({ page }) => {
  await setErrorScenario(page, 'PATCH_409');
  await uploadAvatar(page);
  await fillUsername(page, 'takenuser');
  await submitForm(page);
  await expectError(page, 'Username already taken');
});

test('should show server error toast on 500 response', async ({ page }) => {
  await setErrorScenario(page, 'AVATAR_500');
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await submitForm(page);
  await waitForToast(page, 'Internal server error');
});

test('should show network error toast on connection failure', async ({ page }) => {
  await setErrorScenario(page, 'AVATAR_NETWORK');
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await submitForm(page);
  await waitForToast(page, 'Error de red');
});

test('should show loading spinner on slow response', async ({ page }) => {
  await setErrorScenario(page, 'AVATAR_SLOW');
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');

  await submitForm(page);
  await expect(page.getByRole('button', { name: 'Guardando...' })).toBeVisible();

  await waitForToast(page, 'Perfil actualizado!', 15_000);
});

test('should allow retry after error', async ({ page }) => {
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');

  await setErrorScenario(page, 'AVATAR_500');
  await submitForm(page);
  await waitForToast(page, 'Internal server error');

  await resetErrorScenario(page);
  await submitForm(page);
  await waitForToast(page, 'Perfil actualizado!');
});

test('should persist form values after error', async ({ page }) => {
  await uploadAvatar(page);
  await fillUsername(page, 'persisteduser');
  await fillBio(page, 'Bio que debe persistir');

  await setErrorScenario(page, 'AVATAR_500');
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
