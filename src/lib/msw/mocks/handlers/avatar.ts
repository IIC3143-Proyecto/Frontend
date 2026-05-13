import { http, HttpResponse } from 'msw';

// Simulates uploading a WebP avatar and returning an updated photoUrl
export const avatarHandlers = [
  http.post('*/api/profile/avatar', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('avatar');

    if (!file || !(file instanceof File)) {
      return HttpResponse.json(
        { message: 'No avatar file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'image/webp') {
      return HttpResponse.json(
        { message: 'File must be a WebP image' },
        { status: 422 }
      );
    }

    // Return a fake URL simulating what the server would store
    return HttpResponse.json(
      { photoUrl: `https://vtrna.com/avatars/mock-${Date.now()}.webp` },
      { status: 201 }
    );
  }),
];