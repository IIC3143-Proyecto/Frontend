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

// PATCH /api/user/:id — backend #46 not ready; always succeeds (demo)
export async function patchUser(
  _userId: string,
  _data: { username: string; bio: string; photoUrl: string },
  _accessToken: string,
): Promise<void> {
  return;
}
