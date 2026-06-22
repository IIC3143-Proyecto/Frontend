import { test, expect } from '@playwright/test';
import { gotoAuthenticated } from '../e2e/helpers/auth';

// Id del usuario autenticado en el escenario FULL (ver mock-users.ts).
const OWN_ID = encodeURIComponent('auth0|full_123');
// Id de un tercero "completo" (ver MOCK_OTHER_USERS en mock-users.ts).
const OTHER_ID = encodeURIComponent('auth0|other_456');
// Id que no corresponde a ningún usuario → 404.
const UNKNOWN_ID = encodeURIComponent('auth0|inexistente');

test.describe('Reusable profile view (/profile/[id])', () => {
  test('own profile: shows edit options and private sections', async ({ page }) => {
    // /profile always renders the authenticated user's own profile (isOwner=true by default).
    await gotoAuthenticated(page, '/profile', 'FULL');

    await expect(page.getByText('@Flo_Full')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Editar' }).first()).toBeVisible();
    await expect(page.getByText('Cerrar sesión')).toBeVisible();
    await expect(page.getByText('Ver guardados')).toBeVisible();
  });

  test('other user profile: read-only, no edit or private sections', async ({ page }) => {
    await gotoAuthenticated(page, `/profile/${OTHER_ID}`, 'FULL');

    await expect(page.getByText('@Vale_Vecina')).toBeVisible();
    await expect(page.getByText('@vale.vecina')).toBeVisible();

    await expect(page.getByRole('button', { name: 'Editar' })).toHaveCount(0);
    await expect(page.getByText('Cerrar sesión')).toHaveCount(0);
    await expect(page.getByText('Ver guardados')).toHaveCount(0);
    await expect(page.getByText('Eliminar cuenta')).toHaveCount(0);
  });

  test('unknown id: shows not found state', async ({ page }) => {
    await gotoAuthenticated(page, `/profile/${UNKNOWN_ID}`, 'FULL');

    await expect(page.getByText('Usuario no encontrado')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Volver al feed' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Editar' })).toHaveCount(0);
  });
});
