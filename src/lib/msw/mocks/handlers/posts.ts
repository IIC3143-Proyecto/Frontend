import { http, HttpResponse } from 'msw';
import { TAGS_MOCK } from '../data/mock-tags';
import { mockPostDto } from '../data/mock-post';

export const postsHandlers = [
  http.get('*/api/tag', () => HttpResponse.json(TAGS_MOCK)),

  http.post('*/api/image/post/:id_post', async ({ request }) => {
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

  http.post('*/api/post', async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as Record<string, unknown>;
    const id = `post-${Date.now()}`;
    return HttpResponse.json(mockPostDto(id, body), { status: 201 });
  }),

  http.patch('*/api/post', async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as Record<string, unknown>;
    const id = typeof body.id === 'string' ? body.id : `post-${Date.now()}`;
    return HttpResponse.json(mockPostDto(id, body), { status: 200 });
  }),

  http.patch('*/api/post/:id_post/tags', async ({ request, params }) => {
    const token = request.headers.get('Authorization');
    if (!token) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const id = typeof params.id_post === 'string' ? params.id_post : `post-${Date.now()}`;
    return HttpResponse.json(mockPostDto(id), { status: 200 });
  }),
];
