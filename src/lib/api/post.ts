import type { NewPostDto, PostDto, PostTagsDto } from '@/lib/types/post';
import { BASE } from './base';

export const deletePost = async (postId: string): Promise<void> => {
  const res = await fetch(`${BASE}/api/post/${postId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error al eliminar post');
};

// GET /api/post/seller/{id_user} — endpoint pendiente de documentación backend
export async function getPostsBySeller(sellerId: string, accessToken: string): Promise<PostDto[]> {
  const res = await fetch(`${BASE}/api/post/seller/${sellerId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al obtener publicaciones'),
      { status: res.status }
    );
  }
  return res.json() as Promise<PostDto[]>;
}

export async function createPost(body: NewPostDto, accessToken: string): Promise<string> {
  const res = await fetch(`${BASE}/api/post`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al crear la publicación'),
      { status: res.status }
    );
  }
  const { id } = await res.json() as PostDto;
  return id;
}

export async function patchPostTags(postId: string, tags: Record<string, string | string[]>, accessToken: string): Promise<void> {
  const tagsArray = Object.entries(tags).flatMap(([category, values]) =>
    (Array.isArray(values) ? values : [values]).map((title) => ({ title, category }))
  );
  const res = await fetch(`${BASE}/api/post/${postId}/tags`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tags: tagsArray }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al actualizar tags'),
      { status: res.status }
    );
  }
}

export async function fetchPostTags(postId: string, accessToken: string): Promise<PostTagsDto> {
  const res = await fetch(`${BASE}/api/tag/post/${postId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al obtener tags del post'),
      { status: res.status }
    );
  }
  const items = await res.json() as Array<{ tag: { title: string; category: string } }>;
  const grouped: Record<string, string[]> = {};
  for (const item of items) {
    const { title, category } = item.tag;
    (grouped[category] ??= []).push(title);
  }
  return {
    Talla: grouped['Talla'] ?? [],
    Condición: grouped['Condición']?.[0] ?? '',
    'Tipo de prenda': grouped['Tipo de prenda'] ?? [],
    Marca: grouped['Marca'] ?? [],
    Color: grouped['Color'] ?? [],
    Género: grouped['Género'] ?? [],
    Estilo: grouped['Estilo'] ?? [],
    Temporada: grouped['Temporada'] ?? [],
  };
}

// GET /api/post/:id/tags — backend pendiente; MSW stub retorna tags de ejemplo
export async function fetchPostTags(postId: string, accessToken: string): Promise<PostTagsDto> {
  const res = await fetch(`${BASE}/api/post/${postId}/tags`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al obtener tags del post'),
      { status: res.status }
    );
  }
  return res.json() as Promise<PostTagsDto>;
}

export async function patchPost(body: Record<string, unknown> & { id: string }, accessToken: string): Promise<void> {
  const res = await fetch(`${BASE}/api/post`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al actualizar la publicación'),
      { status: res.status }
    );
  }
}

export async function uploadPostImages(postId: string, fd: FormData, accessToken: string): Promise<void> {
  const res = await fetch(`${BASE}/api/image/post/${postId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: fd,
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al subir las fotos'),
      { status: res.status }
    );
  }
}

export async function appendPostImages(postId: string, fd: FormData, accessToken: string): Promise<void> {
  const res = await fetch(`${BASE}/api/image/post/${postId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: fd,
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al agregar las fotos'),
      { status: res.status }
    );
  }
}

export async function deletePostImages(postId: string, urls: string[], accessToken: string): Promise<void> {
  const res = await fetch(`${BASE}/api/image/post/${postId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ urls }),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al eliminar las fotos'),
      { status: res.status }
    );
  }
}
