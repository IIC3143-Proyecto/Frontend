import { api } from './index';
import type { SyncUserResponse } from '@/lib/types/auth';

export async function uploadUserAvatar(
  userId: string,
  file: File,
  accessToken: string,
): Promise<string> {
  const body = new FormData();
  body.append('images', file);

  const res = await fetch(api.userImage(userId), {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body,
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al subir el avatar'),
      { status: res.status }
    );
  }

  // Re-fetcha sync-user para obtener el photoUrl actualizado
  // TODO: reemplazar por GET /api/user/:id cuando el backend lo implemente
  const syncRes = await fetch('/sync-user');
  if (!syncRes.ok) throw Object.assign(new Error('Error al obtener el avatar actualizado'), { status: syncRes.status });
  const user = await syncRes.json() as SyncUserResponse;
  return user.photoUrl ?? '';
}

// TODO: implementar cuando el backend habilite PATCH /api/user/:id
export async function patchUser(
  _userId: string,
  _data: {
    username: string;
    bio: string;
    photoUrl: string;
    metro?: string[];
    contactInfo?: { instagram?: string; email?: string; whatsapp?: string };
  },
  _accessToken: string,
): Promise<void> {
  return;
}

// TODO: implementar cuando el backend habilite PATCH /api/user/:id/tags
export async function patchUserTags(
  _userId: string,
  _data: {
    clothingGender?: string;
    clothingTypes?: string[];
    size?: string;
  },
  _accessToken: string,
): Promise<void> {
  return;
}
