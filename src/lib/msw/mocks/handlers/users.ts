import { http, HttpResponse, delay } from 'msw';
import { getMockUser, getErrorScenario } from '../scenario';
import type { SyncUserResponse } from '@/lib/types/auth';
import { MOCK_USERS } from '../data/mock-users';

let currentUser: SyncUserResponse = { ...MOCK_USERS[getMockUser()] };

export const usersHandlers = [
  http.get('*/api/user/:id_user', ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const scenario = getMockUser();
    if (currentUser.username !== MOCK_USERS[scenario].username) {
      currentUser = { ...MOCK_USERS[scenario] };
    }
    return HttpResponse.json(currentUser);
  }),

  http.patch('*/api/user/:id_user', async ({ request }) => {
    const scenario = getErrorScenario();

    if (scenario === 'PATCH_401') {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (scenario === 'PATCH_409') {
      return HttpResponse.json({ message: 'Username already taken', field: 'username' }, { status: 409 });
    }
    if (scenario === 'PATCH_500') {
      return HttpResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
    if (scenario === 'PATCH_TIMEOUT') {
      await delay('infinite');
    }
    if (scenario === 'PATCH_NETWORK') {
      return HttpResponse.error();
    }

    const token = request.headers.get('Authorization');
    if (!token) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    if (!data || typeof data !== 'object') {
      return HttpResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    currentUser = { ...currentUser, ...(data as Partial<SyncUserResponse>) };
    return HttpResponse.json(currentUser, { status: 200 });
  }),
];
