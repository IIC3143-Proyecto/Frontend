import { test, expect } from '@playwright/test';
import { waitForToast, expectError } from './helpers';
import { gotoAuthenticated } from './helpers/auth';
import {
  mockCreatePostHandlers,
  mockUploadError,
  mockUploadNetwork,
  mockUploadSlow,
  mockPostError,
  mockPostNetwork,
  openModal,
  clickNext,
  clickBack,
  clickPublish,
  fillStep1,
  uploadPhotos,
  selectRequiredTags,
  selectMultipleTags,
} from './helpers/create-post';

// ── Desktop (default 1280px from playwright.config.ts) ─────────────────────

test.describe('Create Post — desktop', () => {
  test.beforeEach(async ({ page }) => {
    await mockCreatePostHandlers(page);
    await gotoAuthenticated(page, '/test', 'FULL');
    await openModal(page);
  });

  test('should publish successfully with minimum required data', async ({ page }) => {
    await fillStep1(page, { title: 'Camiseta Nike azul', price: 25000 });
    await uploadPhotos(page, 3);
    await clickNext(page);

    await selectRequiredTags(page);
    await clickNext(page);

    await clickPublish(page);
    await waitForToast(page, 'Publicación creada');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should show validation error when title is empty', async ({ page }) => {
    await page.getByPlaceholder('ej: 25000').fill('25000');
    await uploadPhotos(page, 3);
    await clickNext(page);
    await expectError(page, 'Título requerido');
  });

  test('should show validation error when price is empty', async ({ page }) => {
    await page.getByPlaceholder('ej: Camiseta Nike azul').fill('Camiseta');
    await uploadPhotos(page, 3);
    await clickNext(page);
    await expectError(page, 'El precio debe ser mayor a 0');
  });

  test('should show validation error when fewer than 3 photos are uploaded', async ({ page }) => {
    await fillStep1(page, { title: 'Camiseta', price: 10000 });
    await uploadPhotos(page, 2);
    await clickNext(page);
    await expectError(page, 'Debes subir al menos 3 fotos');
  });

  test('should advance to step 2 without a description (optional field)', async ({ page }) => {
    await fillStep1(page, { title: 'Camiseta', price: 10000 });
    await uploadPhotos(page, 3);
    await clickNext(page);
    await expect(page.getByText('Tags obligatorios')).toBeVisible();
  });

  test('should show validation error when required tags are skipped', async ({ page }) => {
    await fillStep1(page, { title: 'Camiseta', price: 10000 });
    await uploadPhotos(page, 3);
    await clickNext(page);

    await clickNext(page);
    await expectError(page, 'Selecciona al menos una talla');
  });

  test('should allow selecting multiple sizes and garment types', async ({ page }) => {
    await fillStep1(page, { title: 'Camiseta', price: 10000 });
    await uploadPhotos(page, 3);
    await clickNext(page);

    await selectMultipleTags(page);
    await clickNext(page);

    await clickPublish(page);
    await waitForToast(page, 'Publicación creada');
  });

  test('should redirect to session-expired when upload returns 401', async ({ page }) => {
    await mockUploadError(page, 401);
    await fillStep1(page, { title: 'Camiseta', price: 10000 });
    await uploadPhotos(page, 3);
    await clickNext(page);
    await page.waitForURL('**/session-expired', { timeout: 8_000 });
  });

  test('should show error toast when upload returns 500', async ({ page }) => {
    await mockUploadError(page, 500);
    await fillStep1(page, { title: 'Camiseta', price: 10000 });
    await uploadPhotos(page, 3);
    await clickNext(page);
    await waitForToast(page, 'Error al subir fotos');
  });

  test('should show network error toast when upload fails due to connection', async ({ page }) => {
    await mockUploadNetwork(page);
    await fillStep1(page, { title: 'Camiseta', price: 10000 });
    await uploadPhotos(page, 3);
    await clickNext(page);
    await waitForToast(page, 'Error de red');
  });

  test('should show uploading spinner during slow upload', async ({ page }) => {
    await mockUploadSlow(page);
    await fillStep1(page, { title: 'Camiseta', price: 10000 });
    await uploadPhotos(page, 3);
    await clickNext(page);
    await expect(page.getByRole('button', { name: /Subiendo/ })).toBeVisible({ timeout: 3_000 });
  });

  test('should redirect to session-expired when POST /post returns 401', async ({ page }) => {
    await fillStep1(page, { title: 'Camiseta', price: 10000 });
    await uploadPhotos(page, 3);
    await clickNext(page);
    await selectRequiredTags(page);
    await clickNext(page);

    await mockPostError(page, 401);
    await clickPublish(page);
    await page.waitForURL('**/session-expired', { timeout: 8_000 });
  });

  test('should show error toast when POST /post returns 500', async ({ page }) => {
    await fillStep1(page, { title: 'Camiseta', price: 10000 });
    await uploadPhotos(page, 3);
    await clickNext(page);
    await selectRequiredTags(page);
    await clickNext(page);

    await mockPostError(page, 500);
    await clickPublish(page);
    await waitForToast(page, 'Error');
  });

  test('should show network error toast when POST /post fails due to connection', async ({ page }) => {
    await fillStep1(page, { title: 'Camiseta', price: 10000 });
    await uploadPhotos(page, 3);
    await clickNext(page);
    await selectRequiredTags(page);
    await clickNext(page);

    await mockPostNetwork(page);
    await clickPublish(page);
    await waitForToast(page, 'Error de red');
  });

  test('should close the modal when Cancelar is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should navigate back to the previous step when Atrás is clicked', async ({ page }) => {
    await fillStep1(page, { title: 'Camiseta', price: 10000 });
    await uploadPhotos(page, 3);
    await clickNext(page);

    await expect(page.getByText('Tags obligatorios')).toBeVisible();
    await clickBack(page);
    await expect(page.getByText('Información y fotos')).toBeVisible();
  });

  test('should not show Atrás button on the first step', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Atrás' })).not.toBeVisible();
  });

  test('should reset the form when the modal is closed and reopened', async ({ page }) => {
    await fillStep1(page, { title: 'Prenda a descartar', price: 99000 });
    await uploadPhotos(page, 1);

    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    await openModal(page);
    await expect(page.getByPlaceholder('ej: Camiseta Nike azul')).toHaveValue('');
    await expect(page.getByPlaceholder('ej: 25000')).toHaveValue('');
    await expect(page.locator('img[alt="Foto de prenda"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Atrás' })).not.toBeVisible();
  });
});

// ── Mobile (375×812) ────────────────────────────────────────────────────────

test.describe('Create Post — mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await mockCreatePostHandlers(page);
    await gotoAuthenticated(page, '/test', 'FULL');
    await openModal(page);
  });

  test('should publish successfully across all 5 steps', async ({ page }) => {
    // Step 1: basic info
    await fillStep1(page, { title: 'Camiseta Nike azul', price: 25000 });
    await clickNext(page);

    // Step 2: photos
    await uploadPhotos(page, 3);
    await clickNext(page);

    // Step 3: required tags
    await selectRequiredTags(page);
    await clickNext(page);

    // Step 4: optional tags (Marca/Color/Género) — skip
    await clickNext(page);

    // Step 5: optional tags (Temporada/Estilo) — publish
    await clickPublish(page);
    await waitForToast(page, 'Publicación creada');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should show validation error when fewer than 3 photos are uploaded on step 2', async ({ page }) => {
    await fillStep1(page, { title: 'Camiseta', price: 10000 });
    await clickNext(page);

    await uploadPhotos(page, 2);
    await clickNext(page);
    await expectError(page, 'Debes subir al menos 3 fotos');
  });

  test('should navigate back from step 3 to step 2 (photos)', async ({ page }) => {
    await fillStep1(page, { title: 'Camiseta', price: 10000 });
    await clickNext(page);
    await uploadPhotos(page, 3);
    await clickNext(page);

    await expect(page.getByText('Tags obligatorios')).toBeVisible();
    await clickBack(page);
    await expect(page.getByText('Fotos', { exact: true })).toBeVisible();
  });
});
