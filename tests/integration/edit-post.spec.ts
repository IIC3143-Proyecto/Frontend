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
  setPatchPostNetwork,
  setDeleteImageError,
  setAppendImageError,
} from './helpers/edit-post';

test.describe('Edit Post', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, '/posts', 'FULL');
    await openEditModal(page);
  });

  test('should save changes successfully', async ({ page }) => {
    await fillEditTitle(page, 'Título actualizado');
    await fillEditPrice(page, 30000);
    await clickSave(page);
    await waitForToast(page, 'Publicación actualizada');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should pre-populate basic fields from post data', async ({ page }) => {
    await openSection(page, 'Título');
    await expect(page.getByPlaceholder('ej: Camiseta Nike azul')).not.toHaveValue('');
    await openSection(page, 'Precio');
    await expect(page.getByPlaceholder('ej: 25000')).not.toHaveValue('');
  });

  test('should pre-populate tags from fetchPostTags', async ({ page }) => {
    await openSection(page, 'Especificaciones esenciales');
    await expect(page.getByRole('button', { name: 'M', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('radio', { name: 'Nuevo', exact: true })).toBeChecked();
    await expect(page.getByRole('button', { name: 'Camiseta', exact: true })).toHaveAttribute('aria-pressed', 'true');
  });

  test('should reset form to original post data when closed and reopened', async ({ page }) => {
    await fillEditTitle(page, 'Cambio temporal');
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    await openEditModal(page);
    await openSection(page, 'Título');
    await expect(page.getByPlaceholder('ej: Camiseta Nike azul')).not.toHaveValue('Cambio temporal');
  });

  test('should show locked banner and disable price when post has offers', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await openEditModalForPost(page, 'Levis 501');
    await expect(page.getByText('Precio bloqueado', { exact: false })).toBeVisible();
    await openSection(page, 'Precio');
    await expect(page.getByPlaceholder('ej: 25000')).toBeDisabled();
  });

  test('should allow saving other fields when price is locked', async ({ page }) => {
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await openEditModalForPost(page, 'Levis 501');
    await fillEditTitle(page, 'Levis actualizado');
    await clickSave(page);
    await waitForToast(page, 'Publicación actualizada');
  });


  test('should show error when title is cleared', async ({ page }) => {
    await openSection(page, 'Título');
    await page.getByPlaceholder('ej: Camiseta Nike azul').fill('');
    await clickSave(page);
    await expectError(page, 'Título requerido');
  });

  test('should show error when price is cleared', async ({ page }) => {
    await openSection(page, 'Precio');
    await page.getByPlaceholder('ej: 25000').fill('');
    await clickSave(page);
    await expectError(page, 'El precio debe ser mayor a 0');
  });

  test('should show error when required tags are empty', async ({ page }) => {
    await openSection(page, 'Especificaciones esenciales');
    await page.getByRole('button', { name: 'M', exact: true }).click();
    await page.getByRole('button', { name: 'Camiseta', exact: true }).click();
    await clickSave(page);
    await expectError(page, 'Selecciona al menos una talla');
  });

  test('should show error when fewer than 3 photos remain', async ({ page }) => {
    await openSection(page, 'Fotos');
    await page.getByRole('button', { name: 'Eliminar foto' }).first().click();
    await clickSave(page);
    await expectError(page, 'Debes tener al menos 3 fotos');
  });


  test('should redirect to session-expired when PATCH /post returns 401', async ({ page }) => {
    await setPatchPostError(page, 401);
    await clickSave(page);
    await page.waitForURL('**/session-expired', { timeout: 8_000 });
  });

  test('should show error toast when PATCH /post returns 500', async ({ page }) => {
    await setPatchPostError(page, 500);
    await clickSave(page);
    await waitForToast(page, 'Error al guardar cambios');
  });

  test('should show network error toast when PATCH /post fails', async ({ page }) => {
    await setPatchPostNetwork(page);
    await clickSave(page);
    await waitForToast(page, 'Error de red');
  });


  test('should not call image endpoints when no photos change', async ({ page }) => {
    await assertNoImageRequest(
      page,
      async () => {
        await fillEditTitle(page, 'Solo cambio título');
        await clickSave(page);
        await waitForToast(page, 'Publicación actualizada');
      },
    );
  });

  test('should call DELETE with only the removed photo URL', async ({ page }) => {
    await openSection(page, 'Fotos');
    const firstPhotoSrc = await page.locator('img[alt="Foto de prenda"]').first().getAttribute('src');
    await page.getByRole('button', { name: 'Eliminar foto' }).first().click();

    await uploadEditPhotos(page, 1);

    const deleteReq = waitForImageRequest(page, 'DELETE');
    await clickSave(page);

    const req = await deleteReq;
    const body = req.postDataJSON() as { urls: string[] };
    expect(body.urls).toHaveLength(1);
    expect(body.urls[0]).toBe(firstPhotoSrc);
  });

  test('should not include kept photos in DELETE body', async ({ page }) => {
    await openSection(page, 'Fotos');
    const allSrcs = await page.locator('img[alt="Foto de prenda"]').evaluateAll(
      (imgs) => imgs.map((img) => (img as HTMLImageElement).src),
    );
    await page.getByRole('button', { name: 'Eliminar foto' }).first().click();

    await uploadEditPhotos(page, 1);

    const deleteReq = waitForImageRequest(page, 'DELETE');
    await clickSave(page);

    const req = await deleteReq;
    const body = req.postDataJSON() as { urls: string[] };
    const keptSrcs = allSrcs.slice(1);
    for (const src of keptSrcs) {
      expect(body.urls).not.toContain(src);
    }
  });

  test('should call PATCH append when new photo is added', async ({ page }) => {
    await uploadEditPhotos(page, 1);

    const appendReq = waitForImageRequest(page, 'PATCH');
    await clickSave(page);

    await appendReq;
  });

  test('should redirect to session-expired when DELETE image returns 401', async ({ page }) => {
    await openSection(page, 'Fotos');
    await page.getByRole('button', { name: 'Eliminar foto' }).first().click();
    await uploadEditPhotos(page, 1);

    await setDeleteImageError(page, 401);
    await clickSave(page);
    await page.waitForURL('**/session-expired', { timeout: 8_000 });
  });

  test('should show error toast when DELETE image returns 500', async ({ page }) => {
    await openSection(page, 'Fotos');
    await page.getByRole('button', { name: 'Eliminar foto' }).first().click();
    await uploadEditPhotos(page, 1);

    await setDeleteImageError(page, 500);
    await clickSave(page);
    await waitForToast(page, 'Error al guardar cambios');
  });

  test('should redirect to session-expired when PATCH append image returns 401', async ({ page }) => {
    await uploadEditPhotos(page, 1);
    await setAppendImageError(page, 401);
    await clickSave(page);
    await page.waitForURL('**/session-expired', { timeout: 8_000 });
  });
});
