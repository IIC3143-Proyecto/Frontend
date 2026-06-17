import { api } from './index';

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

  const { imageUrl } = await res.json() as { imageUrl: string };
  return imageUrl;
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
