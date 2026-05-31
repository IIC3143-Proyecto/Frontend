import { http, HttpResponse } from 'msw';
import { TAGS_MOCK } from '../data/tags';

export const tagsHandlers = [
  http.get('*/api/tag', () => HttpResponse.json({ tags: TAGS_MOCK })),
];
