import { http, HttpResponse } from 'msw';
import { TAGS_MOCK } from '../data/tags';

const MOCK_USER_TAG_PREFERENCES = [
  { userId: 'mock-user', tagId: 1, tag: { id: 1, title: 'Vintage',     category: 'Estilo'   }, score: 0.92, updatedAtUtcMinus3: '2025-01-01T00:00:00' },
  { userId: 'mock-user', tagId: 2, tag: { id: 2, title: 'Streetwear',  category: 'Estilo'   }, score: 0.75, updatedAtUtcMinus3: '2025-01-01T00:00:00' },
  { userId: 'mock-user', tagId: 3, tag: { id: 3, title: 'S',           category: 'Talla'    }, score: 0.88, updatedAtUtcMinus3: '2025-01-01T00:00:00' },
  { userId: 'mock-user', tagId: 4, tag: { id: 4, title: 'Negro',       category: 'Color'    }, score: 0.70, updatedAtUtcMinus3: '2025-01-01T00:00:00' },
  { userId: 'mock-user', tagId: 5, tag: { id: 5, title: 'Casi nuevo',  category: 'Condición'}, score: 0.65, updatedAtUtcMinus3: '2025-01-01T00:00:00' },
];

export const tagsHandlers = [
  http.get('*/api/tag', ({ request }) => {
    if (!request.headers.get('Authorization')) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return HttpResponse.json({ tags: TAGS_MOCK });
  }),

  http.get('*/api/tag/user/:id_user', ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return HttpResponse.json(MOCK_USER_TAG_PREFERENCES);
  }),

  http.get('*/api/tag/user/:id_user', ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return HttpResponse.json(MOCK_USER_TAG_PREFERENCES);
  }),

  http.post('*/api/tag/user/onboarding', ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return HttpResponse.json([], { status: 201 });
  }),
];
