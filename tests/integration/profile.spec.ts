import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { gotoAuthenticated } from '../e2e/helpers/auth';
import {
  openContactEditor,
  openSavedSheet,
  getSavedCards,
  removeCardAt,
  openOfferFormAt,
  setPatchError,
} from './helpers/profile';

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, '/profile', 'FULL');
  });

  test('happy path — view', async ({ page }) => {
    await test.step('username y bio visibles', async () => {
      await expect(page.getByText('@Flo_Full')).toBeVisible();
      await expect(page.getByText('Bio completa del usuario')).toBeVisible();
    });
    await test.step('sección de contacto visible', async () => {
      await expect(page.getByText('Sin información de contacto')).toBeVisible();
    });
    await test.step('sección de zona visible', async () => {
      await expect(page.getByText('Sin zona definida')).toBeVisible();
    });
    await test.step('sección de guardados visible', async () => {
      await expect(page.getByText(/Guardados \(\d+\)/)).toBeVisible();
      await expect(page.getByRole('button', { name: /ver guardados/i })).toBeVisible();
    });
  });

  test('edit contact', async ({ page }) => {
    await test.step('abrir dialog de contacto', async () => {
      await openContactEditor(page);
      await expect(page.getByText('Editar contacto')).toBeVisible();
    });
    await test.step('llenar Instagram y guardar', async () => {
      await page.getByPlaceholder('tu_usuario').fill('test_ig');
      await page.getByRole('button', { name: 'Guardar' }).click();
      await expect(page.getByText('Editar contacto')).not.toBeVisible();
    });
  });

  test('saved posts & offer', async ({ page }) => {
    await test.step('abrir sheet y ver 3 posts guardados', async () => {
      await openSavedSheet(page);
      await expect(getSavedCards(page)).toHaveCount(3);
    });
    await test.step('quitar primer post → 2 cards', async () => {
      await removeCardAt(page, 0);
      await expect(getSavedCards(page)).toHaveCount(2);
    });
    await test.step('abrir make offer y enviar', async () => {
      await openOfferFormAt(page, 0);
      await expect(page.getByText('Hacer oferta')).toBeVisible();
      await page.locator('textarea').fill('Oferta de prueba');
      await page.getByRole('button', { name: 'Enviar oferta' }).click();
      await expect(page.getByText('Hacer oferta')).not.toBeVisible();
    });
  });

  test('error handling — patch contact', async ({ page }) => {
    await test.step('abrir dialog de contacto', async () => {
      await openContactEditor(page);
    });
    await test.step('PATCH_500 → toast de error visible', async () => {
      await setPatchError(page, 'PATCH_500');
      await page.getByPlaceholder('tu_usuario').fill('error_ig');
      await page.getByRole('button', { name: 'Guardar' }).click();
      await expect(page.locator('[data-sonner-toast]')).toBeVisible();
    });
  });
});
