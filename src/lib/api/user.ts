import { api } from './index';
import type { PostDto } from '@/lib/types/post';
import type { UserTagPreferenceDto } from '@/lib/types/tag';
import type { UserDto } from '@/lib/types/user';

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
    username?: string;
    bio?: string;
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

export async function getSavedPosts(userId: string, accessToken: string): Promise<PostDto[]> {
  const res = await fetch(api.savedPosts(userId), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al obtener guardados'),
      { status: res.status },
    );
  }
  return res.json() as Promise<PostDto[]>;
}

export async function getUserTagPreferences(
  userId: string,
  accessToken: string,
): Promise<UserTagPreferenceDto[]> {
  const res = await fetch(api.userTags(userId), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al obtener preferencias'),
      { status: res.status },
    );
  }
  return res.json() as Promise<UserTagPreferenceDto[]>;
}

export async function getUser(userId: string, accessToken: string): Promise<UserDto> {
  const res = await fetch(api.user(userId), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al obtener el usuario'),
      { status: res.status },
    );
  }
  return res.json() as Promise<UserDto>;
}

export async function createInteraction(
  postId: string,
  type: 'Liked' | 'Saved',
  accessToken: string,
): Promise<void> {
  const res = await fetch(api.interaction(postId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al registrar interacción'),
      { status: res.status },
    );
  }
}

export async function removeInteraction(
  postId: string,
  type: 'Saved' | 'Liked',
  accessToken: string,
): Promise<void> {
  const res = await fetch(api.interaction(postId), {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al quitar guardado'),
      { status: res.status },
    );
  }
}
