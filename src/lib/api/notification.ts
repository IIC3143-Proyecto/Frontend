import { BASE } from './base';
import type { NotificationDto } from '@/lib/types/notification';

export async function fetchNotifications(accessToken: string): Promise<NotificationDto[]> {
  const res = await fetch(`${BASE}/api/notification/all`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al obtener notificaciones'),
      { status: res.status }
    );
  }
  return res.json() as Promise<NotificationDto[]>;
}

export async function deleteNotification(id: string, accessToken: string): Promise<void> {
  const res = await fetch(`${BASE}/api/notification/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al eliminar la notificación'),
      { status: res.status }
    );
  }
}

export async function deleteAllNotifications(accessToken: string): Promise<void> {
  const res = await fetch(`${BASE}/api/notification/all`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al eliminar notificaciones'),
      { status: res.status }
    );
  }
}
