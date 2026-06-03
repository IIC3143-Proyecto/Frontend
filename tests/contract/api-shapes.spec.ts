import { test, expect } from '@playwright/test';
import { readFile } from 'fs/promises';
import path from 'path';

let token = '';

test.beforeAll(async () => {
  const data = await readFile(path.join(__dirname, '.auth/token.json'), 'utf-8').catch(() => '{}');
  token = (JSON.parse(data) as { token?: string }).token ?? '';
});

const auth = () => ({ Authorization: `Bearer ${token}` });

// Valida que un objeto tenga la forma de UserDto
function expectUserShape(user: Record<string, unknown>) {
  expect(typeof user.id).toBe('string');
  expect(typeof user.name).toBe('string');
  expect(typeof user.username).toBe('string');
  expect(typeof user.email).toBe('string');
  expect(typeof user.providerAuth0).toBe('string');
  expect(typeof user.status).toBe('string');
  expect(typeof user.createdAtUtcMinus3).toBe('string');
  expect(typeof user.updatedAtUtcMinus3).toBe('string');
  expect(Array.isArray(user.posts)).toBe(true);
  expect(Array.isArray(user.interactions)).toBe(true);
  expect('following' in user).toBe(false);
  expect('followers' in user).toBe(false);
  expect('onboardingCompleted' in user).toBe(false);
}

// Valida que un objeto tenga la forma de PostDto
function expectPostShape(post: Record<string, unknown>) {
  expect(typeof post.id).toBe('string');
  expect(typeof post.sellerId).toBe('string');
  expect(typeof post.title).toBe('string');
  expect(typeof post.description).toBe('string');
  expect(typeof post.priceClp).toBe('number');
  expect(typeof post.isNegotiable).toBe('boolean');
  expect(typeof post.status).toBe('string');
  expect(typeof post.isActive).toBe('boolean');
  expect(typeof post.isDeleted).toBe('boolean');
  expect(typeof post.createdAtUtcMinus3).toBe('string');
  expect(Array.isArray(post.interactions)).toBe(true);
  expect(typeof post.imagesUrls).toBe('string');
  expect('images' in post).toBe(false);
}


test.describe('GET /api/auth/sync-user', () => {
  test('200 — retorna UserDto completo', async ({ request }) => {
    const res = await request.get('/api/auth/sync-user', { headers: auth() });
    expect(res.status()).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expectUserShape(body);
    if (body.bio !== null && body.bio !== undefined) {
      expect(typeof body.bio).toBe('string');
    }
  });

  test('401 sin token', async ({ request }) => {
    expect((await request.get('/api/auth/sync-user')).status()).toBe(401);
  });
});


test.describe('GET /api/tag', () => {
  test('200 — retorna TagsByCategoryDto: objeto keyed por categoría con arrays de strings', async ({ request }) => {
    const res = await request.get('/api/tag', { headers: auth() });
    expect(res.status()).toBe(200);
    const body = await res.json() as { tags: unknown };
    expect(body).toHaveProperty('tags');
    expect(Array.isArray(body.tags)).toBe(false);
    expect(typeof body.tags).toBe('object');
    for (const values of Object.values(body.tags as Record<string, unknown>)) {
      expect(Array.isArray(values)).toBe(true);
      expect((values as unknown[]).every(v => typeof v === 'string')).toBe(true);
    }
  });

  test('401 sin token', async ({ request }) => {
    expect((await request.get('/api/tag')).status()).toBe(401);
  });
});


test.describe('POST /api/post', () => {
  test('201 — retorna PostDto con seller embebido', async ({ request }) => {
    const res = await request.post('/api/post', {
      headers: { ...auth(), 'Content-Type': 'application/json' },
      data: { title: 'Contract test post', description: 'Test desc', priceClp: 5000, isNegotiable: false },
    });
    expect(res.status()).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expectPostShape(body);
    expectUserShape(body.seller as Record<string, unknown>);
    expect(body.buyerId === null || body.buyerId === undefined).toBe(true);
    expect(body.buyer === null || body.buyer === undefined).toBe(true);
  });

  test('401 sin token', async ({ request }) => {
    expect((await request.post('/api/post', { data: {} })).status()).toBe(401);
  });
});


test.describe('PATCH /api/post', () => {
  test('200 — retorna PostDto actualizado', async ({ request }) => {
    const createRes = await request.post('/api/post', {
      headers: { ...auth(), 'Content-Type': 'application/json' },
      data: { title: 'To patch', description: 'Desc', priceClp: 1000, isNegotiable: false },
    });
    const { id } = await createRes.json() as { id: string };

    const res = await request.patch('/api/post', {
      headers: { ...auth(), 'Content-Type': 'application/json' },
      data: { id, title: 'Patched title' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expectPostShape(body);
    expect(body.id).toBe(id);
  });

  test('401 sin token', async ({ request }) => {
    expect((await request.patch('/api/post', { data: {} })).status()).toBe(401);
  });
});


test.describe('DELETE /api/post/:id', () => {
  test('200 — retorna PostDto con isDeleted: true', async ({ request }) => {
    const createRes = await request.post('/api/post', {
      headers: { ...auth(), 'Content-Type': 'application/json' },
      data: { title: 'To delete', description: 'Desc', priceClp: 1000, isNegotiable: false },
    });
    const { id } = await createRes.json() as { id: string };

    const res = await request.delete(`/api/post/${id}`, { headers: auth() });
    expect(res.status()).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expectPostShape(body);
    expect(body.isDeleted).toBe(true);
    expect(body.isActive).toBe(false);
  });

  test('401 sin token', async ({ request }) => {
    expect((await request.delete('/api/post/fake-id')).status()).toBe(401);
  });
});


test.describe('POST /api/image/user/:id', () => {
  test('201 — retorna SimpleResponseDto con message', async ({ request }) => {
    const userRes = await request.get('/api/auth/sync-user', { headers: auth() });
    const { id } = await userRes.json() as { id: string };

    const res = await request.post(`/api/image/user/${id}`, {
      headers: auth(),
      multipart: { images: { name: 'test.webp', mimeType: 'image/webp', buffer: Buffer.from('fake-webp') } },
    });
    expect(res.status()).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(typeof body.message).toBe('string');
    expect('photoUrl' in body).toBe(false);
  });

  test('403 intentando subir imagen de otro usuario', async ({ request }) => {
    const res = await request.post('/api/image/user/otro-usuario-id', {
      headers: auth(),
      multipart: { images: { name: 'test.webp', mimeType: 'image/webp', buffer: Buffer.from('fake') } },
    });
    expect(res.status()).toBe(403);
  });

  test('401 sin token', async ({ request }) => {
    expect((await request.post('/api/image/user/fake-id')).status()).toBe(401);
  });
});


test.describe('GET /api/post/:id', () => {
  test('200 — retorna PostDto completo', async ({ request }) => {
    const createRes = await request.post('/api/post', {
      headers: { ...auth(), 'Content-Type': 'application/json' },
      data: { title: 'To fetch by id', description: 'Desc', priceClp: 1000, isNegotiable: false },
    });
    const { id } = await createRes.json() as { id: string };

    const res = await request.get(`/api/post/${id}`, { headers: auth() });
    expect(res.status()).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expectPostShape(body);
    expect(body.id).toBe(id);
  });

  test('401 sin token', async ({ request }) => {
    expect((await request.get('/api/post/fake-id')).status()).toBe(401);
  });
});

test.describe('GET /api/post/saved/:id_user', () => {
  test('200 — retorna array de PostDto', async ({ request }) => {
    const userRes = await request.get('/api/auth/sync-user', { headers: auth() });
    const { id } = await userRes.json() as { id: string };

    const res = await request.get(`/api/post/saved/${id}`, { headers: auth() });
    expect(res.status()).toBe(200);
    const body = await res.json() as unknown[];
    expect(Array.isArray(body)).toBe(true);
    if (body.length > 0) {
      expectPostShape(body[0] as Record<string, unknown>);
    }
  });

  test('401 sin token', async ({ request }) => {
    expect((await request.get('/api/post/saved/fake-id')).status()).toBe(401);
  });
});

test.describe('DELETE /api/image/post/:id', () => {
  test('401 sin token', async ({ request }) => {
    expect((await request.delete('/api/image/post/fake-id')).status()).toBe(401);
  });

  test('403 si no eres el vendedor', async ({ request }) => {
    const res = await request.delete('/api/image/post/post-de-otro-usuario', {
      headers: { ...auth(), 'Content-Type': 'application/json' },
      data: { urls: ['https://example.com/fake.jpg'] },
    });
    expect([403, 404]).toContain(res.status());
  });
});

test.describe('DELETE /api/image/user/:id', () => {
  test('200 — retorna SimpleResponseDto', async ({ request }) => {
    const userRes = await request.get('/api/auth/sync-user', { headers: auth() });
    const { id } = await userRes.json() as { id: string };

    const res = await request.delete(`/api/image/user/${id}`, { headers: auth() });
    expect(res.status()).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(typeof body.message).toBe('string');
  });

  test('403 intentando eliminar foto de otro usuario', async ({ request }) => {
    expect((await request.delete('/api/image/user/otro-usuario-id', { headers: auth() })).status()).toBe(403);
  });

  test('401 sin token', async ({ request }) => {
    expect((await request.delete('/api/image/user/fake-id')).status()).toBe(401);
  });
});

// GET /api/user/:id — no está en api-docs.md pero sí en nuestros mocks.
// Si retorna 404, el endpoint no está implementado — actualizar MSW cuando llegue.
test.describe('GET /api/user/:id', () => {
  test('200 con UserDto ó 404 si no implementado', async ({ request }) => {
    const userRes = await request.get('/api/auth/sync-user', { headers: auth() });
    const { id } = await userRes.json() as { id: string };

    const res = await request.get(`/api/user/${id}`, { headers: auth() });
    if (res.status() === 404) return; // pendiente de implementación
    expect(res.status()).toBe(200);
    expectUserShape(await res.json() as Record<string, unknown>);
  });
});

test.describe('POST /api/image/post/:id', () => {
  test('201 — retorna SimpleResponseDto con message', async ({ request }) => {
    const createRes = await request.post('/api/post', {
      headers: { ...auth(), 'Content-Type': 'application/json' },
      data: { title: 'Image test post', description: 'Desc', priceClp: 1000, isNegotiable: false },
    });
    const { id } = await createRes.json() as { id: string };

    const res = await request.post(`/api/image/post/${id}`, {
      headers: auth(),
      multipart: { images: { name: 'test.webp', mimeType: 'image/webp', buffer: Buffer.from('fake-webp') } },
    });
    expect(res.status()).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(typeof body.message).toBe('string');
  });

  test('403 si no eres el vendedor', async ({ request }) => {
    const res = await request.post('/api/image/post/post-de-otro-usuario', {
      headers: auth(),
      multipart: { images: { name: 'test.webp', mimeType: 'image/webp', buffer: Buffer.from('fake') } },
    });
    expect([403, 404]).toContain(res.status());
  });

  test('401 sin token', async ({ request }) => {
    expect((await request.post('/api/image/post/fake-id')).status()).toBe(401);
  });
});
