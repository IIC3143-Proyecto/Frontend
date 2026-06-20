import { http, HttpResponse } from 'msw';

export const interactionHandlers = [
  http.post('*/api/interaction/:id_post', async ({ params, request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const body = await request.json() as { type?: string };
    return HttpResponse.json(
      {
        id: `interaction-${Date.now()}`,
        userId: 'mock-user',
        postId: params.id_post,
        type: body.type ?? 'Liked',
        createdAtUtcMinus3: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),

  http.delete('*/api/interaction/:id_post', ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return new HttpResponse(null, { status: 200 });
  }),
];
