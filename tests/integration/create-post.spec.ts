import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { waitForToast, expectError } from './helpers/onboarding';
import { gotoAuthenticated } from '../e2e/helpers/auth';
import { resetErrorScenario } from './helpers/form-errors';
import {
  setUploadError,
  setUploadSlow,
  setCreateError,
  setPatchTagsError,
  openModal,
  clickNext,
  clickBack,
  clickPublish,
  fillStep1,
  uploadPhotos,
  selectRequiredTags,
  dismissGeminiSuggestions,
} from './helpers/create-post';

test.describe('Create Post — desktop', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, '/posts', 'FULL');
    await openModal(page);
  });

  test('publishes post with minimum required data', async ({ page }) => {
    await test.step('fill step 1 with minimum data', async () => {
      await fillStep1(page, { title: 'Camiseta Nike azul', price: 25000 });
      await uploadPhotos(page, 3);
      await clickNext(page);
    });
    await test.step('select required tags and publish', async () => {
      await selectRequiredTags(page);
      await clickNext(page);
      await clickPublish(page);
      await waitForToast(page, 'Publicación creada');
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });
  });

  test('shows validation errors for required fields', async ({ page }) => {
    await test.step('empty title shows required error', async () => {
      await page.getByPlaceholder('ej: 25000').fill('25000');
      await uploadPhotos(page, 3);
      await clickNext(page);
      await expectError(page, 'Título requerido');
      await page.getByRole('button', { name: 'Cancelar' }).click();
    });

    await openModal(page);

    await test.step('empty price shows required error', async () => {
      await page.getByPlaceholder('ej: Camiseta Nike azul').fill('Camiseta');
      await uploadPhotos(page, 3);
      await clickNext(page);
      await expectError(page, 'El precio debe ser mayor a 0');
      await page.getByRole('button', { name: 'Cancelar' }).click();
    });

    await openModal(page);

    await test.step('fewer than 3 photos shows required error', async () => {
      await fillStep1(page, { title: 'Camiseta', price: 10000 });
      await uploadPhotos(page, 2);
      await clickNext(page);
      await expectError(page, 'Debes subir al menos 3 fotos');
      await page.getByRole('button', { name: 'Cancelar' }).click();
    });

    await openModal(page);

    await test.step('skipping required tags shows error', async () => {
      await fillStep1(page, { title: 'Camiseta', price: 10000 });
      await uploadPhotos(page, 3);
      await clickNext(page);
      await dismissGeminiSuggestions(page);
      await clickNext(page);
      await expectError(page, 'Selecciona al menos una talla');
    });
  });

  test('navigation', async ({ page }) => {
    await test.step('no back button on step 1', async () => {
      await expect(page.getByRole('button', { name: 'Atrás' })).not.toBeVisible();
    });

    await test.step('back button disabled on step 2 after post is created', async () => {
      await fillStep1(page, { title: 'Camiseta', price: 10000 });
      await uploadPhotos(page, 3);
      await clickNext(page);
      await dismissGeminiSuggestions(page);
      await expect(page.getByText('Tags obligatorios')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Atrás' })).toBeDisabled();
    });

    await test.step('back from step 3 goes to step 2', async () => {
      await selectRequiredTags(page);
      await clickNext(page);
      await expect(page.getByText('Tags opcionales')).toBeVisible();
      await clickBack(page);
      await expect(page.getByText('Tags obligatorios')).toBeVisible();
    });

    await test.step('cancel closes the modal', async () => {
      await page.getByRole('button', { name: 'Cancelar' }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    await test.step('form resets after close and reopen', async () => {
      await openModal(page);
      await expect(page.getByPlaceholder('ej: Camiseta Nike azul')).toHaveValue('');
      await expect(page.getByPlaceholder('ej: 25000')).toHaveValue('');
      await expect(page.locator('img[alt="Foto de prenda"]')).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Atrás' })).not.toBeVisible();
    });
  });

  test('error handling', async ({ page }) => {
    await test.step('upload 500 shows error toast', async () => {
      await setUploadError(page, 500);
      await fillStep1(page, { title: 'Camiseta', price: 10000 });
      await uploadPhotos(page, 3);
      await clickNext(page);
      await waitForToast(page, 'Error al subir fotos');
    });

    await resetErrorScenario(page);
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await openModal(page);

    await test.step('create 500 shows error toast', async () => {
      await setCreateError(page, 500);
      await fillStep1(page, { title: 'Camiseta', price: 10000 });
      await uploadPhotos(page, 3);
      await clickNext(page);
      await waitForToast(page, 'Error al crear publicación');
    });

    await resetErrorScenario(page);
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await openModal(page);

    await test.step('patch-tags 500 shows error toast', async () => {
      await fillStep1(page, { title: 'Camiseta', price: 10000 });
      await uploadPhotos(page, 3);
      await clickNext(page);
      await selectRequiredTags(page);
      await clickNext(page);
      await setPatchTagsError(page, 500);
      await clickPublish(page);
      await waitForToast(page, 'Error al publicar');
    });

    await resetErrorScenario(page);
    await gotoAuthenticated(page, '/posts', 'FULL');
    await openModal(page);

    await test.step('create 401 redirects to session-expired', async () => {
      await setCreateError(page, 401);
      await fillStep1(page, { title: 'Camiseta', price: 10000 });
      await uploadPhotos(page, 3);
      await clickNext(page);
      await page.waitForURL('**/session-expired', { timeout: 8_000 });
    });
  });

  test('slow upload — spinner visible', async ({ page }) => {
    await setUploadSlow(page);
    await fillStep1(page, { title: 'Camiseta', price: 10000 });
    await uploadPhotos(page, 3);
    await clickNext(page);
    await expect(page.getByRole('button', { name: /Subiendo/ })).toBeVisible({ timeout: 3_000 });
  });
});

test.describe('Create Post — mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, '/posts', 'FULL');
    await openModal(page);
  });

  test('5-step mobile flow', async ({ page }) => {
    await test.step('5-step flow publishes successfully', async () => {
      await fillStep1(page, { title: 'Camiseta Nike azul', price: 25000 });
      await clickNext(page);
      await uploadPhotos(page, 3);
      await clickNext(page);
      await selectRequiredTags(page);
      await clickNext(page);
      await clickNext(page);
      await clickPublish(page);
      await waitForToast(page, 'Publicación creada');
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    await gotoAuthenticated(page, '/posts', 'FULL');
    await openModal(page);

    await test.step('fewer than 3 photos on step 2 shows error', async () => {
      await fillStep1(page, { title: 'Camiseta', price: 10000 });
      await clickNext(page);
      await uploadPhotos(page, 2);
      await clickNext(page);
      await expectError(page, 'Debes subir al menos 3 fotos');
    });
  });
});
