import { http, HttpResponse, delay } from 'msw';
import { mockPost, MOCK_SELLER_POSTS, MOCK_SAVED_POSTS } from '../data/posts';
import { getErrorScenario } from '../scenario';

export const postsHandlers = [
  http.get('*/api/post/saved/:id_user', ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return HttpResponse.json(MOCK_SAVED_POSTS);
  }),

  // TODO: implementar cuando el backend habilite GET /api/post/user/:id_user
  http.get('*/api/post/user/:id_user', () =>
    HttpResponse.json({ message: 'Not implemented' }, { status: 404 })
  ),

  // TODO: implementar cuando el backend habilite GET /api/post/search
  http.get('*/api/post/search', () =>
    HttpResponse.json({ message: 'Not implemented' }, { status: 404 })
  ),

  http.get('*/api/post/seller/:id_user', ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return HttpResponse.json(MOCK_SELLER_POSTS);
  }),

  http.get('*/api/tag/post/:id_post', ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return HttpResponse.json([
      { tag: { title: 'M', category: 'Talla' } },
      { tag: { title: 'Nuevo', category: 'Condición' } },
      { tag: { title: 'Camiseta', category: 'Tipo de prenda' } },
    ]);
  }),

  http.get('*/api/post/:id_post', ({ params, request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const post = MOCK_SELLER_POSTS.find(p => p.id === params.id_post)
      ?? mockPost(params.id_post as string);
    return HttpResponse.json(post);
  }),

  http.delete('*/api/post/:id_post', ({ params, request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const idx = MOCK_SELLER_POSTS.findIndex((p) => p.id === params.id_post);
    const post = idx !== -1
      ? { ...MOCK_SELLER_POSTS[idx], isDeleted: true, isActive: false }
      : { ...mockPost(params.id_post as string), isDeleted: true, isActive: false };
    if (idx !== -1) MOCK_SELLER_POSTS.splice(idx, 1);
    return HttpResponse.json(post, { status: 200 });
  }),

  http.post('*/api/image/post/:id_post', async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const scenario = getErrorScenario();
    if (scenario === 'UPLOAD_401') return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (scenario === 'UPLOAD_500') return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    if (scenario === 'UPLOAD_NETWORK') return HttpResponse.error();
    if (scenario === 'UPLOAD_SLOW') await delay(2000);

    const fd = await request.formData();
    const files = fd.getAll('images');
    if (!files.length) return HttpResponse.json({ message: 'No se proporcionaron archivos' }, { status: 400 });

    return HttpResponse.json(
      { imagesUrls: ['https://mock-cdn.example.com/post-image-1.webp'] },
      { status: 201 }
    );
  }),

  http.delete('*/api/image/post/:id_post', ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const scenario = getErrorScenario();
    if (scenario === 'DELETE_IMAGE_401') return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (scenario === 'DELETE_IMAGE_500') return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    if (scenario === 'DELETE_IMAGE_NETWORK') return HttpResponse.error();
    return HttpResponse.json({ imagesUrls: [] });
  }),

  http.patch('*/api/image/post/:id_post', async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const scenario = getErrorScenario();
    if (scenario === 'APPEND_IMAGE_401') return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (scenario === 'APPEND_IMAGE_500') return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    if (scenario === 'APPEND_IMAGE_NETWORK') return HttpResponse.error();
    const fd = await request.formData();
    const files = fd.getAll('images');
    if (!files.length) return HttpResponse.json({ message: 'No se proporcionaron archivos' }, { status: 400 });
    return HttpResponse.json({
      imagesUrls: files.map((_, i) => `https://mock-cdn.example.com/post-image-${i + 1}.webp`),
    });
  }),

  http.post('*/api/post', async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const scenario = getErrorScenario();
    if (scenario === 'CREATE_401') return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (scenario === 'CREATE_500') return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    if (scenario === 'CREATE_NETWORK') return HttpResponse.error();

    const body = await request.json() as Record<string, unknown>;
    const id = `post-${Date.now()}`;
    return HttpResponse.json(mockPost(id, body), { status: 201 });
  }),

  http.patch('*/api/post', async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const scenario = getErrorScenario();
    if (scenario === 'PATCH_POST_401') return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (scenario === 'PATCH_POST_500') return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    if (scenario === 'PATCH_POST_NETWORK') return HttpResponse.error();

    const body = await request.json() as Record<string, unknown>;
    const id = typeof body.id === 'string' ? body.id : `post-${Date.now()}`;
    return HttpResponse.json(mockPost(id, body), { status: 200 });
  }),

  http.patch('*/api/post/:id_post/tags', () => {
    const scenario = getErrorScenario();
    if (scenario === 'PATCH_TAGS_401') return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (scenario === 'PATCH_TAGS_500') return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    if (scenario === 'PATCH_TAGS_NETWORK') return HttpResponse.error();
    return HttpResponse.json({ message: 'Tags actualizados exitosamente.' }, { status: 200 });
  }),
];
