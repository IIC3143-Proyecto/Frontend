import { http, HttpResponse } from 'msw';
import { getMockUser } from '../scenario';
import { MOCK_USERS } from '../data/mock-users';

export const syncUserHandlers = [
  http.get('*/auth/sync-user', () => {
    const user = MOCK_USERS[getMockUser()];
    if (!user) return new HttpResponse(null, { status: 401 });
    return HttpResponse.json(user);
  }),
];
