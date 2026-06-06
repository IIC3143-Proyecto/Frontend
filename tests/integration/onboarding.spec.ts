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
} from './helpers/form-errors';

test.beforeEach(async ({ page }) => {
  await gotoAuthenticated(page, '/onboarding', 'NEW');
  await expect(page.getByRole('heading', { name: 'Tu perfil' })).toBeVisible({
    timeout: 15_000,
  });
});

// ── Step 1 validation ────────────────────────────────────────────────────────

test('should show step 1 with StepProgress', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Tu perfil' })).toBeVisible();
  // StepProgress renders step indicators
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

// ── Step 2 (optional) ────────────────────────────────────────────────────────

test('should advance from step 2 without filling anything', async ({ page }) => {
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await fillBio(page, 'Bio de prueba');
  await clickNext(page);

  await expect(page.getByRole('heading', { name: 'Tu estilo' })).toBeVisible();
  await clickNext(page);
  await expect(page.getByRole('heading', { name: 'Contacto' })).toBeVisible();
});

// ── Step 3 validation ────────────────────────────────────────────────────────

test('should block step 3 when all contact fields are empty', async ({ page }) => {
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await fillBio(page, 'Bio de prueba');
  await clickNext(page);
  await clickNext(page); // skip estilo
  await expect(page.getByRole('heading', { name: 'Contacto' })).toBeVisible();

  await clickNext(page);
  await expectError(page, 'Agrega al menos un medio de contacto');
});

// ── Step 4 validation ────────────────────────────────────────────────────────

test('should block summary when no metro station selected', async ({ page }) => {
  await uploadAvatar(page);
  await fillUsername(page, 'testuser');
  await fillBio(page, 'Bio de prueba');
  await clickNext(page);
  await clickNext(page); // skip estilo
  await fillInstagram(page, '@testuser');
  await clickNext(page);

  await expect(page.getByRole('heading', { name: 'Tu zona' })).toBeVisible();
  await clickNext(page); // "Ver resumen"
  await expectError(page, 'Selecciona al menos una estación de metro');
});

// ── Navigation ────────────────────────────────────────────────────────────────

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

// ── Summary ────────────────────────────────────────────────────────────────────

test('should display entered data on summary screen', async ({ page }) => {
  await completeAllStepsUntilSummary(page);
  await expect(page.getByRole('heading', { name: 'Resumen' })).toBeVisible();
  await expect(page.getByText('@testuser')).toBeVisible();
  await expect(page.getByText('Bio de prueba')).toBeVisible();
});

// ── Happy path ────────────────────────────────────────────────────────────────

test('should complete onboarding successfully', async ({ page }) => {
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await waitForToast(page, 'Perfil completado');
});

// ── Error scenarios ────────────────────────────────────────────────────────────

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
  // Should return to step 1 to show the avatar error
  await expect(page.getByRole('heading', { name: 'Tu perfil' })).toBeVisible();
});

test('should show server error toast on 500 response', async ({ page }) => {
  await setAvatarError(page, 500);
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await waitForToast(page, 'Internal server error');
});

test('should show network error toast on connection failure', async ({ page }) => {
  await setAvatarNetwork(page);
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await waitForToast(page, 'Error de red');
});

test('should show loading spinner on slow response', async ({ page }) => {
  await setAvatarSlow(page);
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await expect(page.getByRole('button', { name: 'Guardando...' })).toBeVisible({ timeout: 3_000 });
  await waitForToast(page, 'Perfil completado', 15_000);
});

test('should allow retry after error', async ({ page }) => {
  await setAvatarError(page, 500);
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await waitForToast(page, 'Internal server error');

  await resetErrorScenario(page);
  await clickFinish(page);
  await waitForToast(page, 'Perfil completado');
});

test('should persist form values after submit error', async ({ page }) => {
  await setAvatarError(page, 500);
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await waitForToast(page, 'Internal server error');

  // Navigate back to step 1 to verify
  await clickBack(page); // back to step 4
  await clickBack(page); // back to step 3
  await clickBack(page); // back to step 2
  await clickBack(page); // back to step 1
  await expect(page.getByPlaceholder('Escribe tu username')).toHaveValue('testuser');
});

test('should show avatar preview after file selection', async ({ page }) => {
  const preview = page.locator('img[alt="Vista previa del avatar"]');
  await expect(preview).toHaveCount(0);
  await uploadAvatar(page);
  await expect(preview).toHaveAttribute('src', /^blob:/);
  await expect(preview).toBeVisible();
});

// TODO: enable when backend #46 (PATCH /api/user/:id) is implemented
test.fixme('should show error when username is already taken', async ({ page }) => {
  await setPatchError(page, 409);
  await completeAllStepsUntilSummary(page);
  await clickFinish(page);
  await expectError(page, 'Username already taken');
});
