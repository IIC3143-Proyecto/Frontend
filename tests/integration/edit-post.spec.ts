import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { waitForToast, expectError } from './helpers/onboarding';
import { gotoAuthenticated } from '../e2e/helpers/auth';
import {
  openEditModal,
  openEditModalForPost,
  clickSave,
  openSection,
  fillEditTitle,
  fillEditPrice,
  uploadEditPhotos,
  waitForImageRequest,
  assertNoImageRequest,
  setPatchPostError,
  setDeleteImageError,
  setAppendImageError,
} from './helpers/edit-post';

test.describe('Edit Post', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, '/posts', 'FULL');
    await openEditModal(page);
  });

  test('happy path y pre-population', async ({ page }) => {
    await test.step('campos básicos pre-poblados', async () => {
      await openSection(page, 'Título');
      await expect(page.getByPlaceholder('ej: Camiseta Nike azul')).not.toHaveValue('');
      await openSection(page, 'Precio');
      await expect(page.getByPlaceholder('ej: 25000')).not.toHaveValue('');
    });

    await test.step('tags pre-pobladas desde fetchPostTags', async () => {
      await openSection(page, 'Especificaciones esenciales');
      await expect(page.getByRole('button', { name: 'M', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByRole('radio', { name: 'Nuevo', exact: true })).toBeChecked();
      await expect(page.getByRole('button', { name: 'Camiseta', exact: true })).toHaveAttribute('aria-pressed', 'true');
    });

    await test.step('guardar cambios → toast y modal cierra', async () => {
      await fillEditTitle(page, 'Título actualizado');
      await fillEditPrice(page, 30000);
      await clickSave(page);
      await waitForToast(page, 'Publicación actualizada');
      await expect(page.getByRole('dialog')).not.toBeVisible();
    });

    await test.step('reset al cerrar y reopener', async () => {
      await openEditModal(page);
      await fillEditTitle(page, 'Cambio temporal');
      await page.getByRole('button', { name: 'Cancelar' }).click();
      await openEditModal(page);
      await openSection(page, 'Título');
      await expect(page.getByPlaceholder('ej: Camiseta Nike azul')).not.toHaveValue('Cambio temporal');
    });
  });

  test('precio bloqueado con ofertas', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await openEditModalForPost(page, 'Levis 501');

    await test.step('banner de precio bloqueado visible', async () => {
      await expect(page.getByText('Precio bloqueado', { exact: false })).toBeVisible();
    });

    await test.step('input de precio deshabilitado', async () => {
      await openSection(page, 'Precio');
      await expect(page.getByPlaceholder('ej: 25000')).toBeDisabled();
    });

    await test.step('se pueden guardar otros campos con precio bloqueado', async () => {
      await fillEditTitle(page, 'Levis actualizado');
      await clickSave(page);
      await waitForToast(page, 'Publicación actualizada');
    });
  });

  test('form validation', async ({ page }) => {
    await test.step('título vacío → error requerido', async () => {
      await openSection(page, 'Título');
      await page.getByPlaceholder('ej: Camiseta Nike azul').fill('');
      await clickSave(page);
      await expectError(page, 'Título requerido');
    });

    await test.step('precio vacío → error requerido', async () => {
      await openSection(page, 'Precio');
      await page.getByPlaceholder('ej: 25000').fill('');
      await clickSave(page);
      await expectError(page, 'El precio debe ser mayor a 0');
    });

    await test.step('tags requeridas vacías → error', async () => {
      await openSection(page, 'Especificaciones esenciales');
      await page.getByRole('button', { name: 'M', exact: true }).click();
      await page.getByRole('button', { name: 'Camiseta', exact: true }).click();
      await clickSave(page);
      await expectError(page, 'Selecciona al menos una talla');
    });

    await test.step('menos de 3 fotos → error', async () => {
      await openSection(page, 'Fotos');
      await page.getByRole('button', { name: 'Eliminar foto' }).first().click();
      await clickSave(page);
      await expectError(page, 'Debes tener al menos 3 fotos');
    });
  });

  test('image management', async ({ page }) => {
    await test.step('sin cambio de fotos → ningún request de imagen', async () => {
      await assertNoImageRequest(page, async () => {
        await fillEditTitle(page, 'Solo cambio título');
        await clickSave(page);
        await waitForToast(page, 'Publicación actualizada');
      });
    });

    await openEditModal(page);

    await test.step('eliminar foto → DELETE con URL correcta y sin URLs conservadas', async () => {
      await openSection(page, 'Fotos');
      const firstPhotoSrc = await page.locator('img[alt="Foto de prenda"]').first().getAttribute('src');
      const allSrcs = await page.locator('img[alt="Foto de prenda"]').evaluateAll(
        (imgs) => imgs.map((img) => (img as HTMLImageElement).src),
      );
      await page.getByRole('button', { name: 'Eliminar foto' }).first().click();
      await uploadEditPhotos(page, 1);

      const deleteReq = waitForImageRequest(page, 'DELETE');
      await clickSave(page);

      const req = await deleteReq;
      const body = req.postDataJSON() as { urls: string[] };
      expect(body.urls).toHaveLength(1);
      expect(body.urls[0]).toBe(firstPhotoSrc);
      for (const src of allSrcs.slice(1)) {
        expect(body.urls).not.toContain(src);
      }
    });

    await openEditModal(page);

    await test.step('agregar foto → request PATCH append', async () => {
      await uploadEditPhotos(page, 1);
      const appendReq = waitForImageRequest(page, 'PATCH');
      await clickSave(page);
      await appendReq;
    });
  });

  test('error handling', async ({ page }) => {
    await test.step('PATCH_POST_401 → redirige a session-expired', async () => {
      await setPatchPostError(page, 401);
      await clickSave(page);
      await page.waitForURL('**/session-expired', { timeout: 8_000 });
    });

    await gotoAuthenticated(page, '/posts', 'FULL');
    await openEditModal(page);

    await test.step('PATCH_POST_500 → toast de error', async () => {
      await setPatchPostError(page, 500);
      await clickSave(page);
      await waitForToast(page, 'Error al guardar cambios');
    });

    await page.getByRole('button', { name: 'Cancelar' }).click();
    await openEditModal(page);

    await test.step('DELETE_IMAGE_500 → toast de error', async () => {
      await openSection(page, 'Fotos');
      await page.getByRole('button', { name: 'Eliminar foto' }).first().click();
      await uploadEditPhotos(page, 1);
      await setDeleteImageError(page, 500);
      await clickSave(page);
      await waitForToast(page, 'Error al guardar cambios');
    });
  });
});
