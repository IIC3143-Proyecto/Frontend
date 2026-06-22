import { test, expect } from '@playwright/test';
import { gotoAuthenticated } from '../e2e/helpers/auth';

// Id del usuario autenticado en el escenario FULL (ver mock-users.ts).
const OWN_ID = encodeURIComponent('auth0|full_123');
// Id de un tercero "completo" (ver MOCK_OTHER_USERS en mock-users.ts).
const OTHER_ID = encodeURIComponent('auth0|other_456');
// Id que no corresponde a ningún usuario → 404.
const UNKNOWN_ID = encodeURIComponent('auth0|inexistente');

test.describe('Vista de perfil reutilizable (/profile/[id])', () => {
  test('perfil propio: muestra opciones de edición y secciones privadas', async ({ page }) => {
    await gotoAuthenticated(page, `/profile/${OWN_ID}`, 'FULL');

    await expect(page.getByText('@Flo_Full')).toBeVisible();
    // Botones de edición (Zona y Contacto) y secciones privadas.
    await expect(page.getByRole('button', { name: 'Editar' }).first()).toBeVisible();
    await expect(page.getByText('Cerrar sesión')).toBeVisible();
    await expect(page.getByText('Ver guardados')).toBeVisible();
  });

  test('perfil de tercero: solo lectura, sin edición ni secciones privadas', async ({ page }) => {
    await gotoAuthenticated(page, `/profile/${OTHER_ID}`, 'FULL');

    // Info básica del tercero.
    await expect(page.getByText('@Vale_Vecina')).toBeVisible();
    await expect(page.getByText('@vale.vecina')).toBeVisible();

    // Sin opciones de edición ni secciones privadas.
    await expect(page.getByRole('button', { name: 'Editar' })).toHaveCount(0);
    await expect(page.getByText('Cerrar sesión')).toHaveCount(0);
    await expect(page.getByText('Ver guardados')).toHaveCount(0);
    await expect(page.getByText('Eliminar cuenta')).toHaveCount(0);
  });

  test('id inexistente: muestra estado "usuario no encontrado"', async ({ page }) => {
    await gotoAuthenticated(page, `/profile/${UNKNOWN_ID}`, 'FULL');

    await expect(page.getByText('Usuario no encontrado')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Volver al feed' })).toBeVisible();
    // No se renderiza el perfil.
    await expect(page.getByRole('button', { name: 'Editar' })).toHaveCount(0);
  });
});
