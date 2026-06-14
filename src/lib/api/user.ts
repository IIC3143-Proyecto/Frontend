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

export async function patchUser(
  userId: string,
  data: {
    username: string;
    bio: string;
    metro?: string[];
    contactInfo?: { instagram?: string; email?: string; whatsapp?: string };
  },
  accessToken: string,
): Promise<void> {
  const res = await fetch(api.user(userId), {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: data.username,
      bio: data.bio,
      // TODO: backend debe agregar `stations` a PatchUserDto ([PR #64])
      stations: data.metro,
      contactInfo: data.contactInfo,
    }),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al actualizar el perfil'),
      { status: res.status, field: (json as { field?: string }).field },
    );
  }
}

// TODO: no existe endpoint de tags de usuario en ninguna rama documentada.
// El más cercano es PATCH /api/post/:id_post/tags [PR #64], que es para posts, no usuarios.
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
