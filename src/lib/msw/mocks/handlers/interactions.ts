import { http, HttpResponse } from 'msw';

export const interactionHandlers = [
  http.delete('*/api/interaction/:id_post', ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return new HttpResponse(null, { status: 200 });
  }),
];
