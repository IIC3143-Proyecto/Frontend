import { expect } from '@playwright/test';
import { test } from '../fixtures';
import { gotoAuthenticated } from '../e2e/helpers/auth';
import {
  getCards,
  deleteCardAt,
  confirmDelete,
  cancelDelete,
  deleteAll,
  setDeleteError,
} from './helpers/notifications';

test.describe('Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, '/notifications', 'FULL');
  });

  test('happy path', async ({ page }) => {
    await test.step('carga 6 cards', async () => {
      await expect(getCards(page)).toHaveCount(6);
    });
    await test.step('primera card muestra título y timestamp', async () => {
      const first = getCards(page).first();
      await expect(first.getByText(/Mantenimiento/)).toBeVisible();
      await expect(first.locator('span')).toContainText(/Ahora|min|h/);
    });
    await test.step('botón "Borrar todas" visible', async () => {
      await expect(page.getByRole('button', { name: /borrar todas/i })).toBeVisible();
    });
  });

  test('empty state', async ({ page }) => {
    await deleteAll(page);
    await test.step('"No tienes notificaciones" visible', async () => {
      await expect(page.getByText('No tienes notificaciones')).toBeVisible();
    });
    await test.step('botón "Borrar todas" NO visible', async () => {
      await expect(page.getByRole('button', { name: /borrar todas/i })).not.toBeVisible();
    });
  });

  test('delete flow', async ({ page }) => {
    await test.step('cancelar → sigue con 6 cards', async () => {
      await deleteCardAt(page, 0);
      await cancelDelete(page);
      await expect(getCards(page)).toHaveCount(6);
    });
    await test.step('confirmar → 5 cards', async () => {
      await deleteCardAt(page, 0);
      await confirmDelete(page);
      await expect(getCards(page)).toHaveCount(5);
    });
    await test.step('"Borrar todas" → empty state', async () => {
      await deleteAll(page);
      await expect(page.getByText('No tienes notificaciones')).toBeVisible();
    });
  });

  test('error handling', async ({ page }) => {
    await test.step('NOTIF_DELETE_500 → toast + rollback optimista', async () => {
      await setDeleteError(page, 'NOTIF_DELETE_500');
      await deleteCardAt(page, 0);
      await confirmDelete(page);
      await expect(page.locator('[data-sonner-toast]')).toBeVisible();
      await expect(getCards(page)).toHaveCount(6);
    });
    await test.step('NOTIF_DELETE_ALL_500 → toast + lista reaparece', async () => {
      await setDeleteError(page, 'NOTIF_DELETE_ALL_500');
      await deleteAll(page);
      await expect(page.locator('[data-sonner-toast]')).toBeVisible();
      await expect(getCards(page)).toHaveCount(6);
    });
  });
});
