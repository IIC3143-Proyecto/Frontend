import { http, HttpResponse } from 'msw';
import { getMockUser, getErrorScenario } from '../scenario';
import { MOCK_USERS } from '../data/mock-users';

export const syncUserHandlers = [
  http.get('*/sync-user', () => {
    const errorScenario = getErrorScenario();
    if (errorScenario === 'SYNC_USER_401') return new HttpResponse(null, { status: 401 });
    if (errorScenario === 'SYNC_USER_403') return HttpResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (errorScenario === 'SYNC_USER_500') return HttpResponse.json({ error: 'Server error' }, { status: 500 });
    if (errorScenario === 'SYNC_USER_503') return HttpResponse.json({ error: 'Unavailable' }, { status: 503 });

    const user = MOCK_USERS[getMockUser()];
    if (!user) return new HttpResponse(null, { status: 401 });
    return HttpResponse.json(user);
  }),
];
