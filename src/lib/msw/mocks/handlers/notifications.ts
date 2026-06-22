import { http, HttpResponse } from 'msw';
import { MOCK_NOTIFICATIONS } from '../data/notifications';
import { getErrorScenario } from '../scenario';
import type { NotificationDto } from '@/lib/types/notification';

let notifications: NotificationDto[] = [...MOCK_NOTIFICATIONS];

export function resetNotifications(list: NotificationDto[] = [...MOCK_NOTIFICATIONS]) {
  notifications = list;
}

export const notificationsHandlers = [
  http.get('*/api/notification/all', ({ request }) => {
    if (!request.headers.get('Authorization'))
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return HttpResponse.json(notifications);
  }),

  // Registrado antes de /:id_notification para que "all" no sea tratado como ID
  http.delete('*/api/notification/all', ({ request }) => {
    if (!request.headers.get('Authorization'))
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (getErrorScenario() === 'NOTIF_DELETE_ALL_500')
      return HttpResponse.json({ message: 'Error interno' }, { status: 500 });
    notifications = [];
    return HttpResponse.json({ message: 'All notifications deleted successfully' });
  }),

  http.delete('*/api/notification/:id_notification', ({ request, params }) => {
    if (!request.headers.get('Authorization'))
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    if (getErrorScenario() === 'NOTIF_DELETE_500')
      return HttpResponse.json({ message: 'Error interno' }, { status: 500 });
    notifications = notifications.filter((n) => n.id !== params.id_notification);
    return HttpResponse.json({ message: 'Notification deleted successfully' });
  }),
];
