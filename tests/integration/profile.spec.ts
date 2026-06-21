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
    await test.step('username and bio visible', async () => {
      await expect(page.getByText('@Flo_Full')).toBeVisible();
      await expect(page.getByText('Bio completa del usuario')).toBeVisible();
    });
    await test.step('contact section visible', async () => {
      await expect(page.getByText('Sin información de contacto')).toBeVisible();
    });
    await test.step('zone section visible', async () => {
      await expect(page.getByText('Sin zona definida')).toBeVisible();
    });
    await test.step('saved posts section visible', async () => {
      await expect(page.getByText(/Guardados \(\d+\)/)).toBeVisible();
      await expect(page.getByRole('button', { name: /ver guardados/i })).toBeVisible();
    });
  });

  test('edit contact', async ({ page }) => {
    await test.step('open contact editor dialog', async () => {
      await openContactEditor(page);
      await expect(page.getByText('Editar contacto')).toBeVisible();
    });
    await test.step('fill Instagram and save', async () => {
      await page.getByPlaceholder('tu_usuario').fill('test_ig');
      await page.getByRole('button', { name: 'Guardar' }).click();
      await expect(page.getByText('Editar contacto')).not.toBeVisible();
    });
  });

  test('saved posts & offer', async ({ page }) => {
    await test.step('open saved sheet and see 3 posts', async () => {
      await openSavedSheet(page);
      await expect(getSavedCards(page)).toHaveCount(3);
    });
    await test.step('remove first post — 2 cards remain', async () => {
      await removeCardAt(page, 0);
      await expect(getSavedCards(page)).toHaveCount(2);
    });
    await test.step('open make-offer form and submit', async () => {
      await openOfferFormAt(page, 0);
      await expect(page.getByText('Hacer oferta')).toBeVisible();
      await page.locator('textarea').fill('Oferta de prueba');
      await page.getByRole('button', { name: 'Enviar oferta' }).click();
      await expect(page.getByText('Hacer oferta')).not.toBeVisible();
    });
  });

  test('error handling — patch contact', async ({ page }) => {
    await test.step('401 on save redirects to session-expired', async () => {
      await openContactEditor(page);
      await setPatchError(page, 'PATCH_401');
      await page.getByPlaceholder('tu_usuario').fill('error_ig');
      await page.getByRole('button', { name: 'Guardar' }).click();
      await page.waitForURL('**/session-expired', { timeout: 8_000 });
    });

    await gotoAuthenticated(page, '/profile', 'FULL');

    await test.step('500 on save shows error toast', async () => {
      await openContactEditor(page);
      await setPatchError(page, 'PATCH_500');
      await page.getByPlaceholder('tu_usuario').fill('error_ig');
      await page.getByRole('button', { name: 'Guardar' }).click();
      await expect(page.locator('[data-sonner-toast]')).toBeVisible();
    });
  });
});
