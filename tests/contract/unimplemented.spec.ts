import { test, expect } from '@playwright/test';

// Cuando el backend implemente el endpoint, este test falla → señal para el equipo frontend:
// 1. Mover el test a api-shapes.spec.ts con la forma esperada del response
// 2. Actualizar el handler MSW correspondiente
// 3. Remover el .fixme del test de integración relacionado

test('GET /api/post/user/:id — pendiente de implementación', async ({ request }) => {
  expect((await request.get('/api/post/user/fake-id')).status()).toBe(404);
});

test('PATCH /api/user/:id — pendiente de implementación', async ({ request }) => {
  expect((await request.patch('/api/user/fake-id', { data: {} })).status()).toBe(404);
});

test('GET /api/post/search — pendiente de implementación', async ({ request }) => {
  expect((await request.get('/api/post/search?tags=test')).status()).toBe(404);
});

test('PATCH /api/post/:id/tags — pendiente de implementación', async ({ request }) => {
  expect((await request.patch('/api/post/fake-id/tags', { data: {} })).status()).toBe(404);
});
