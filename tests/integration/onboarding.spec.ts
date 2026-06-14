import { expect } from '@playwright/test';
import { test } from '../fixtures';
import {
  uploadAvatar,
  fillUsername,
  fillBio,
  fillInstagram,
  clickNext,
  clickBack,
  clickFinish,
  selectMetroStation,
  waitForToast,
  expectError,
  completeAllStepsUntilSummary,
} from './helpers/onboarding';
import { gotoAuthenticated } from '../e2e/helpers/auth';
import {
  resetErrorScenario,
  setAvatarError,
  setAvatarNetwork,
  setAvatarSlow,
  setPatchError,
  setPatchNetwork,
} from './helpers/form-errors';

test.beforeEach(async ({ page }) => {
  await gotoAuthenticated(page, '/onboarding', 'NEW');
  await page.getByRole('button', { name: 'Empezar' }).click();
  await expect(page.getByRole('heading', { name: 'Tu perfil' })).toBeVisible({
    timeout: 5_000,
  });
});

test('should show intro screen on first visit', async ({ page }) => {
  await gotoAuthenticated(page, '/onboarding', 'NEW');
  await expect(page.getByRole('heading', { name: '¡Arma tu perfil!' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Empezar' })).toBeVisible();
});

test('should navigate to step 1 when clicking Empezar', async ({ page }) => {
  await gotoAuthenticated(page, '/onboarding', 'NEW');
  await page.getByRole('button', { name: 'Empezar' }).click();
  await expect(page.getByRole('heading', { name: 'Tu perfil' })).toBeVisible();
});

test('should show step 1 with StepProgress', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Tu perfil' })).toBeVisible();
  await expect(page.getByText('1', { exact: true }).first()).toBeVisible();
});

test('should block step 1 without avatar, username, or bio', async ({ page }) => {
  await clickNext(page);
  await expectError(page, 'Avatar es requerido');
  await expectError(page, 'Username es requerido');
  await expectError(page, 'Bio es requerida');
});

test('should block step 1 without avatar when username and bio filled', async ({ page }) => {
  await fillUsername(page, 'testuser');
  await fillBio(page, 'Bio de prueba');
  await clickNext(page);
  await expectError(page, 'Avatar es requerido');
  await expect(page.getByText('Username es requerido')).not.toBeVisible();
});

test('should advance from step 2 without filling anything', async ({ page }) => {
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await fillBio(page, 'Bio de prueba');
  await clickNext(page);

  await expect(page.getByRole('heading', { name: 'Tu estilo' })).toBeVisible();
  await clickNext(page);
  await expect(page.getByRole('heading', { name: 'Contacto' })).toBeVisible();
});

test('should block step 3 when all contact fields are empty', async ({ page }) => {
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await fillBio(page, 'Bio de prueba');
  await clickNext(page);
  await clickNext(page);
  await expect(page.getByRole('heading', { name: 'Contacto' })).toBeVisible();

  await clickNext(page);
  await expectError(page, 'Agrega al menos un medio de contacto');
});

test('should block summary when no metro station selected', async ({ page }) => {
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await fillBio(page, 'Bio de prueba');
  await clickNext(page);
  await clickNext(page);
  await fillInstagram(page, 'testuser');
  await clickNext(page);

  await expect(page.getByRole('heading', { name: 'Tu zona' })).toBeVisible();
  await clickNext(page);
  await expectError(page, 'Selecciona al menos una estación de metro');
});

test('should preserve step 1 values when going back from step 2', async ({ page }) => {
  await uploadAvatar(page);
  await fillUsername(page, 'persisteduser');
  await fillBio(page, 'Bio que persiste');
  await clickNext(page);

  await expect(page.getByRole('heading', { name: 'Tu estilo' })).toBeVisible();
  await clickBack(page);

  await expect(page.getByPlaceholder('Escribe tu username')).toHaveValue('persisteduser');
  await expect(page.getByPlaceholder('Escribe una breve biografía sobre ti...')).toHaveValue(
    'Bio que persiste',
  );
});

test('should go back from summary to step 4', async ({ page }) => {
  await completeAllStepsUntilSummary(page);
  await expect(page.getByRole('heading', { name: 'Resumen' })).toBeVisible();

  await clickBack(page);
  await expect(page.getByRole('heading', { name: 'Tu zona' })).toBeVisible();
});

test('should display entered data on summary screen', async ({ page }) => {
  await completeAllStepsUntilSummary(page);
  await expect(page.getByRole('heading', { name: 'Resumen' })).toBeVisible();
  await expect(page.getByText('@testuser')).toBeVisible();
  await expect(page.getByText('Bio de prueba')).toBeVisible();
});

test('should complete onboarding successfully', async ({ page }) => {
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await waitForToast(page, 'Perfil completado');
});

test('should redirect to session-expired when avatar returns 401', async ({ page }) => {
  await setAvatarError(page, 401);
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await page.waitForURL('**/session-expired', { timeout: 8_000 });
});

test('should show field error when avatar returns 422', async ({ page }) => {
  await setAvatarError(page, 422);
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await expectError(page, 'File must be a WebP image');
  await expect(page.getByRole('heading', { name: 'Tu perfil' })).toBeVisible();
});

test('should show server error toast on avatar 500 response', async ({ page }) => {
  await setAvatarError(page, 500);
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await waitForToast(page, 'Internal server error');
});

test('should show network error toast on avatar connection failure', async ({ page }) => {
  await setAvatarNetwork(page);
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await waitForToast(page, 'Error de red');
});

test('should show loading spinner on slow avatar upload', async ({ page }) => {
  await setAvatarSlow(page);
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await expect(page.getByRole('button', { name: 'Guardando...' })).toBeVisible({ timeout: 3_000 });
  await waitForToast(page, 'Perfil completado', 15_000);
});

test('should allow retry after avatar error', async ({ page }) => {
  await setAvatarError(page, 500);
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await waitForToast(page, 'Internal server error');

  await resetErrorScenario(page);
  await clickFinish(page);
  await waitForToast(page, 'Perfil completado');
});

test('should persist form values after avatar submit error', async ({ page }) => {
  await setAvatarError(page, 500);
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await waitForToast(page, 'Internal server error');

  await clickBack(page);
  await clickBack(page);
  await clickBack(page);
  await clickBack(page);
  await expect(page.getByPlaceholder('Escribe tu username')).toHaveValue('testuser');
});

test('should show avatar preview after file selection', async ({ page }) => {
  const preview = page.locator('img[alt="Vista previa del avatar"]');
  await expect(preview).toHaveCount(0);
  await uploadAvatar(page);
  await expect(preview).toHaveAttribute('src', /^blob:/);
  await expect(preview).toBeVisible();
});

test('should redirect to session-expired when PATCH user returns 401', async ({ page }) => {
  await setPatchError(page, 401);
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await page.waitForURL('**/session-expired', { timeout: 8_000 });
});

test('should show field error and return to step 1 when username is already taken', async ({ page }) => {
  await setPatchError(page, 409);
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await expectError(page, 'Username already taken');
  await expect(page.getByRole('heading', { name: 'Tu perfil' })).toBeVisible();
});

test('should show server error toast on PATCH user 500 response', async ({ page }) => {
  await setPatchError(page, 500);
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await waitForToast(page, 'Internal server error');
});

test('should show network error toast when PATCH user connection fails', async ({ page }) => {
  await setPatchNetwork(page);
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await waitForToast(page, 'Error de red');
});
