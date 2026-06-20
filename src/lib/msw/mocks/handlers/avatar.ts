import { http, HttpResponse, delay } from 'msw';
import { getErrorScenario } from '../scenario';

export const avatarHandlers = [
  http.post('*/api/image/user/:id_user', async ({ request }) => {
    const scenario = getErrorScenario();

    if (scenario === 'AVATAR_401') {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (scenario === 'AVATAR_422') {
      return HttpResponse.json({ message: 'File must be a WebP image' }, { status: 422 });
    }
    if (scenario === 'AVATAR_500') {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
    if (scenario === 'AVATAR_TIMEOUT') {
      await delay('infinite');
    }
    if (scenario === 'AVATAR_NETWORK') {
      return HttpResponse.error();
    }
    if (scenario === 'AVATAR_SLOW') {
      await delay(2000);
      return HttpResponse.json(
        { imageUrl: 'https://picsum.photos/seed/mock-avatar/200/200' },
        { status: 201 }
      );
    }

    const token = request.headers.get('Authorization');
    if (!token) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('images');
    if (!file || !(file instanceof File)) {
      return HttpResponse.json({ message: 'No image file provided' }, { status: 400 });
    }

    if (file.type !== 'image/webp') {
      return HttpResponse.json({ message: 'File must be a WebP image' }, { status: 422 });
    }

    return HttpResponse.json(
      { imageUrl: 'https://picsum.photos/seed/mock-avatar/200/200' },
      { status: 201 }
    );
  }),

  http.delete('*/api/image/user/:id_user', ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    return HttpResponse.json({ message: 'Foto de perfil eliminada exitosamente.' });
  }),
];
