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

test('happy path: completa el perfil exitosamente', async ({ page }) => {
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await fillBio(page, 'Una bio de prueba');
  await submitForm(page);
  await waitForToast(page, 'Perfil actualizado!');
});

test('validación local: muestra errores de cliente al enviar vacío', async ({ page }) => {
  await submitForm(page);
  await expectError(page, 'Avatar es requerido');
  await expectError(page, 'Username es requerido');
});

test('avatar requerido: muestra error si no se sube avatar', async ({ page }) => {
  await fillUsername(page, 'testuser');
  await submitForm(page);
  await expectError(page, 'Avatar es requerido');
  // Username field must not show an error
  await expect(page.getByText('Username es requerido')).not.toBeVisible();
});

test('redirección 401: redirige a /session-expired si avatar devuelve 401', async ({ page }) => {
  await setErrorScenario(page, 'AVATAR_401');
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await submitForm(page);
  await page.waitForURL('**/session-expired', { timeout: 8_000 });
});

test('error 422 avatar: muestra error cuando el archivo no es WebP', async ({ page }) => {
  await setErrorScenario(page, 'AVATAR_422');
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await submitForm(page);
  await expectError(page, 'File must be a WebP image');
});

test('error 409 username: muestra error si el username está tomado', async ({ page }) => {
  await setErrorScenario(page, 'PATCH_409');
  await uploadAvatar(page);
  await fillUsername(page, 'takenuser');
  await submitForm(page);
  await expectError(page, 'Username already taken');
});

test('error 500: muestra toast de error del servidor', async ({ page }) => {
  await setErrorScenario(page, 'AVATAR_500');
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await submitForm(page);
  await waitForToast(page, 'Internal server error');
});

test('error de red: muestra toast de error de conexión', async ({ page }) => {
  await setErrorScenario(page, 'AVATAR_NETWORK');
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await submitForm(page);
  await waitForToast(page, 'Error de red');
});

test('respuesta lenta: muestra spinner mientras carga', async ({ page }) => {
  await setErrorScenario(page, 'AVATAR_SLOW');
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');

  await submitForm(page);
  await expect(page.getByRole('button', { name: 'Guardando...' })).toBeVisible();

  await waitForToast(page, 'Perfil actualizado!', 15_000);
});

test('reintento: después de un error puede reintentarlo exitosamente', async ({ page }) => {
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');

  await setErrorScenario(page, 'AVATAR_500');
  await submitForm(page);
  await waitForToast(page, 'Internal server error');

  await resetErrorScenario(page);
  await submitForm(page);
  await waitForToast(page, 'Perfil actualizado!');
});

test('persistencia: mantiene los valores del formulario tras un error', async ({ page }) => {
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

test('preview avatar: muestra la imagen de preview al seleccionar un archivo', async ({ page }) => {
  const preview = page.locator('img[alt="Vista previa del avatar"]');

  await expect(preview).toHaveCount(0);

  await uploadAvatar(page);

  await expect(preview).toHaveAttribute('src', /^blob:/);
  await expect(preview).toBeVisible();
});
