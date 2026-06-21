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
  waitForToast,
  expectError,
  completeAllStepsUntilSummary,
} from './helpers/onboarding';
import { gotoAuthenticated } from '../e2e/helpers/auth';
import {
  resetErrorScenario,
  setAvatarError,
  setAvatarSlow,
  setPatchError,
} from './helpers/form-errors';

// Happy path starts from the intro screen, so it handles its own navigation.
test('happy path', async ({ page }) => {
  await gotoAuthenticated(page, '/onboarding', 'NEW');

  await test.step('intro screen visible', async () => {
    await expect(page.getByRole('heading', { name: '¡Arma tu perfil!' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Empezar' })).toBeVisible();
    await page.getByRole('button', { name: 'Empezar' }).click();
    await expect(page.getByRole('heading', { name: 'Tu perfil' })).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('1', { exact: true }).first()).toBeVisible();
  });

  await test.step('complete all steps until summary', async () => {
    await completeAllStepsUntilSummary(page);
    await expect(page.getByRole('heading', { name: 'Resumen' })).toBeVisible();
    await expect(page.getByText('@testuser')).toBeVisible();
    await expect(page.getByText('Bio de prueba')).toBeVisible();
  });

  await test.step('finish shows profile completed toast', async () => {
    await clickFinish(page);
    await waitForToast(page, 'Perfil completado');
  });
});

test.describe('from step 1', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, '/onboarding', 'NEW');
    await page.getByRole('button', { name: 'Empezar' }).click();
    await expect(page.getByRole('heading', { name: 'Tu perfil' })).toBeVisible({ timeout: 5_000 });
  });

  test('form validation', async ({ page }) => {
    await test.step('step 1 without any fields shows 3 errors', async () => {
      await clickNext(page);
      await expectError(page, 'Avatar es requerido');
      await expectError(page, 'Username es requerido');
      await expectError(page, 'Bio es requerida');
    });

    await test.step('step 1 with username and bio but no avatar shows only avatar error', async () => {
      await fillUsername(page, 'testuser');
      await fillBio(page, 'Bio de prueba');
      await clickNext(page);
      await expectError(page, 'Avatar es requerido');
      await expect(page.getByText('Username es requerido')).not.toBeVisible();
    });

    // Completar step 1 y navegar hasta step 3
    await uploadAvatar(page);
    await clickNext(page);
    await clickNext(page);

    await test.step('step 3 without contact shows required error', async () => {
      await expect(page.getByRole('heading', { name: 'Contacto' })).toBeVisible();
      await clickNext(page);
      await expectError(page, 'Agrega al menos un medio de contacto');
    });

    // Completar step 3 y navegar a step 4
    await fillInstagram(page, 'contacto_test');
    await clickNext(page);

    await test.step('step 4 without metro station shows required error', async () => {
      await expect(page.getByRole('heading', { name: 'Tu zona' })).toBeVisible();
      await clickNext(page);
      await expectError(page, 'Selecciona al menos una estación de metro');
    });
  });

  test('back navigation and state persistence', async ({ page }) => {
    await test.step('avatar preview shows blob URL', async () => {
      const preview = page.locator('img[alt="Vista previa del avatar"]');
      await expect(preview).toHaveCount(0);
      await uploadAvatar(page);
      await expect(preview).toHaveAttribute('src', /^blob:/);
      await expect(preview).toBeVisible();
    });

    await test.step('going back from step 2 preserves step 1 values', async () => {
      await fillUsername(page, 'persisteduser');
      await fillBio(page, 'Bio que persiste');
      await clickNext(page);
      await expect(page.getByRole('heading', { name: 'Tu estilo' })).toBeVisible();
      await clickBack(page);
      await expect(page.getByPlaceholder('Escribe tu username')).toHaveValue('persisteduser');
      await expect(page.getByPlaceholder('Escribe una breve biografía sobre ti...')).toHaveValue('Bio que persiste');
    });

    // Navegar fresh para el test de back desde summary
    await gotoAuthenticated(page, '/onboarding', 'NEW');
    await page.getByRole('button', { name: 'Empezar' }).click();
    await expect(page.getByRole('heading', { name: 'Tu perfil' })).toBeVisible({ timeout: 5_000 });

    await test.step('going back from summary shows step 4', async () => {
      await completeAllStepsUntilSummary(page);
      await expect(page.getByRole('heading', { name: 'Resumen' })).toBeVisible();
      await clickBack(page);
      await expect(page.getByRole('heading', { name: 'Tu zona' })).toBeVisible();
    });
  });

  test('avatar errors', async ({ page }) => {
    await test.step('422 shows WebP field error and returns to step 1', async () => {
      await setAvatarError(page, 422);
      await completeAllStepsUntilSummary(page);
      await clickFinish(page);
      await expectError(page, 'File must be a WebP image');
      await expect(page.getByRole('heading', { name: 'Tu perfil' })).toBeVisible();
    });

    await test.step('slow upload shows Guardando spinner', async () => {
      await resetErrorScenario(page);
      await gotoAuthenticated(page, '/onboarding', 'NEW');
      await page.getByRole('button', { name: 'Empezar' }).click();
      await expect(page.getByRole('heading', { name: 'Tu perfil' })).toBeVisible({ timeout: 5_000 });
      await setAvatarSlow(page);
      await completeAllStepsUntilSummary(page);
      await clickFinish(page);
      await expect(page.getByRole('button', { name: 'Guardando...' })).toBeVisible({ timeout: 3_000 });
      await waitForToast(page, 'Perfil completado', 15_000);
    });

    await test.step('500 shows error toast and retry succeeds', async () => {
      await resetErrorScenario(page);
      await gotoAuthenticated(page, '/onboarding', 'NEW');
      await page.getByRole('button', { name: 'Empezar' }).click();
      await expect(page.getByRole('heading', { name: 'Tu perfil' })).toBeVisible({ timeout: 5_000 });
      await setAvatarError(page, 500);
      await completeAllStepsUntilSummary(page);
      await clickFinish(page);
      await waitForToast(page, 'Internal server error');
      await resetErrorScenario(page);
      await clickFinish(page);
      await waitForToast(page, 'Perfil completado');
    });
  });

  test('patch user errors', async ({ page }) => {
    await test.step('401 redirects to session-expired', async () => {
      await setPatchError(page, 401);
      await completeAllStepsUntilSummary(page);
      await clickFinish(page);
      await page.waitForURL('**/session-expired', { timeout: 8_000 });
    });

    await gotoAuthenticated(page, '/onboarding', 'NEW');
    await page.getByRole('button', { name: 'Empezar' }).click();
    await expect(page.getByRole('heading', { name: 'Tu perfil' })).toBeVisible({ timeout: 5_000 });

    await test.step('409 shows username taken error and returns to step 1', async () => {
      await setPatchError(page, 409);
      await completeAllStepsUntilSummary(page);
      await clickFinish(page);
      await expectError(page, 'Username already taken');
      await expect(page.getByRole('heading', { name: 'Tu perfil' })).toBeVisible();
    });

    await resetErrorScenario(page);
    await gotoAuthenticated(page, '/onboarding', 'NEW');
    await page.getByRole('button', { name: 'Empezar' }).click();
    await expect(page.getByRole('heading', { name: 'Tu perfil' })).toBeVisible({ timeout: 5_000 });

    await test.step('500 shows error toast', async () => {
      await setPatchError(page, 500);
      await completeAllStepsUntilSummary(page);
      await clickFinish(page);
      await waitForToast(page, 'Internal server error');
    });
  });
});
