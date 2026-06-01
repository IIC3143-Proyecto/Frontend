import { api } from './index';

// TODO: leer photoUrl del response cuando el backend lo incluya
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

  return `https://vtrna.com/avatars/placeholder-${userId}.webp`;
}

export async function patchUser(
  userId: string,
  data: { username: string; bio: string; photoUrl: string },
  accessToken: string,
): Promise<void> {
  const res = await fetch(api.user(userId), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al actualizar el perfil'),
      { status: res.status }
    );
  }
}
