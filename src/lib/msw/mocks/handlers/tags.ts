import { http, HttpResponse } from 'msw';
import { TAGS_MOCK } from '../data/tags';

export const tagsHandlers = [
  http.get('*/api/tag', () => HttpResponse.json({ tags: TAGS_MOCK })),

  http.post('*/api/tag/user/onboarding', ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return HttpResponse.json([], { status: 201 });
  }),
];
