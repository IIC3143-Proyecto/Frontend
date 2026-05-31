import { http, HttpResponse } from 'msw';
import { mockPost, MOCK_SELLER_POSTS } from '../data/posts';

export const postsHandlers = [
  http.get('*/api/post/seller/:id_user', ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return HttpResponse.json(MOCK_SELLER_POSTS);
  }),

  http.delete('*/post/:id', ({ params }) => {
    const idx = MOCK_SELLER_POSTS.findIndex((p) => p.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    MOCK_SELLER_POSTS.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/image/post/:id_post', async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const fd = await request.formData();
    const files = fd.getAll('images');
    if (!files.length) {
      return HttpResponse.json({ message: 'No se proporcionaron archivos' }, { status: 400 });
    }

    return HttpResponse.json(
      { message: 'Imágenes subidas y vinculadas a la publicación exitosamente.' },
      { status: 201 }
    );
  }),

  http.post('*/post', async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as Record<string, unknown>;
    const id = `post-${Date.now()}`;
    return HttpResponse.json(mockPost(id, body), { status: 201 });
  }),

  http.patch('*/post', async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as Record<string, unknown>;
    const id = typeof body.id === 'string' ? body.id : `post-${Date.now()}`;
    return HttpResponse.json(mockPost(id, body), { status: 200 });
  }),
];
