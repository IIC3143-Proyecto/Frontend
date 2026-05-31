import { http, HttpResponse } from 'msw';
import { PostStatus } from '@/lib/types/post-status.enum';
import type { Post } from '@/lib/types/post';
import { mockPost } from '../data/posts';

const POSTS: Post[] = [
  {
    id: 'post_1',
    sellerId: 'user_123',
    title: 'Vintage 90s Jacket',
    description: 'Chaqueta vintage en excelente estado, sin defectos.',
    priceClp: 25000,
    isNegotiable: true,
    status: PostStatus.PUBLISHED,
    likesCount: 4,
    savesCount: 1,
    viewsCount: 12,
    offersCount: 3,
    isActive: true,
    isDeleted: false,
    createdAtUtcMinus3: new Date().toISOString(),
    interactions: [],
  },
  {
    id: 'post_2',
    sellerId: 'user_123',
    title: 'Levis 501 Custom',
    description: 'Talla M, usada dos veces.',
    priceClp: 18000,
    isNegotiable: false,
    status: PostStatus.PUBLISHED,
    likesCount: 0,
    savesCount: 0,
    viewsCount: 3,
    offersCount: 0,
    isActive: true,
    isDeleted: false,
    createdAtUtcMinus3: new Date().toISOString(),
    interactions: [],
  },
  {
    id: 'post_3',
    sellerId: 'user_123',
    buyerId: 'user_456',
    title: 'Carhartt Detroit',
    description: 'Chaqueta Carhartt original.',
    priceClp: 45000,
    isNegotiable: true,
    status: PostStatus.RESERVED,
    likesCount: 8,
    savesCount: 3,
    viewsCount: 25,
    offersCount: 1,
    isActive: true,
    isDeleted: false,
    createdAtUtcMinus3: new Date().toISOString(),
    interactions: [],
  },
  {
    id: 'post_4',
    sellerId: 'user_123',
    title: 'Polera Algodón Premium',
    description: 'Polera básica, talla M.',
    priceClp: 12990,
    isNegotiable: false,
    status: PostStatus.UNPUBLISHED,
    likesCount: 0,
    savesCount: 0,
    viewsCount: 0,
    offersCount: 0,
    isActive: false,
    isDeleted: false,
    createdAtUtcMinus3: new Date().toISOString(),
    interactions: [],
  },
  {
    id: 'post_5',
    sellerId: 'user_123',
    buyerId: 'user_789',
    title: 'Archive Nike Bag',
    description: 'Bolso Nike de colección.',
    priceClp: 30000,
    isNegotiable: false,
    status: PostStatus.SOLD,
    likesCount: 10,
    savesCount: 4,
    viewsCount: 40,
    offersCount: 1,
    isActive: false,
    isDeleted: false,
    createdAtUtcMinus3: new Date().toISOString(),
    interactions: [],
  },
];

const currentPosts = [...POSTS];

export const postsHandlers = [
  http.get('*/posts', () => HttpResponse.json(currentPosts)),

  http.delete('*/post/:id', ({ params }) => {
    const idx = currentPosts.findIndex((p) => p.id === params.id);
    if (idx === -1) return new HttpResponse(null, { status: 404 });
    currentPosts.splice(idx, 1);
    return new HttpResponse(null, { status: 204 });
  }),

  http.post('*/image/post/:id_post', async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const fd = await request.formData();
    const files = fd.getAll('images');
    if (!files.length) return HttpResponse.json({ message: 'No se proporcionaron archivos' }, { status: 400 });
    return HttpResponse.json({ message: 'Imágenes subidas y vinculadas a la publicación exitosamente.' }, { status: 201 });
  }),

  http.post('*/post', async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const body = await request.json() as Record<string, unknown>;
    const id = `post-${Date.now()}`;
    return HttpResponse.json(mockPost(id, body), { status: 201 });
  }),

  http.patch('*/post', async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const body = await request.json() as Record<string, unknown>;
    const id = typeof body.id === 'string' ? body.id : `post-${Date.now()}`;
    return HttpResponse.json(mockPost(id, body), { status: 200 });
  }),
];
