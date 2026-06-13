import { test, expect } from '@playwright/test';
import { readFile } from 'fs/promises';
import path from 'path';

// Cuando el backend implemente el endpoint, este test falla → señal para el equipo frontend:
// 1. Mover el test a api-shapes.spec.ts con la forma esperada del response
// 2. Actualizar el handler MSW correspondiente
// 3. Remover el .fixme del test de integración relacionado

let token = '';

test.beforeAll(async () => {
  const data = await readFile(path.join(__dirname, '.auth/token.json'), 'utf-8').catch(() => '{}');
  token = (JSON.parse(data) as { token?: string }).token ?? '';
});

test.beforeEach(() => {
  test.skip(!token, 'No token — run with AUTH0_TEST_EMAIL/PASSWORD');
});

test('GET /api/post/user/:id — pendiente de implementación', async ({ request }) => {
  const res = await request.get('/api/post/user/fake-id', { headers: { Authorization: `Bearer ${token}` } });
  expect(res.status()).toBe(404);
});

test('PATCH /api/user/:id — pendiente de implementación', async ({ request }) => {
  const res = await request.patch('/api/user/fake-id', { data: {}, headers: { Authorization: `Bearer ${token}` } });
  expect(res.status()).toBe(404);
});

test('PATCH /api/post/:id/tags — pendiente de implementación', async ({ request }) => {
  const res = await request.patch('/api/post/fake-id/tags', { data: {}, headers: { Authorization: `Bearer ${token}` } });
  expect(res.status()).toBe(404);
});
