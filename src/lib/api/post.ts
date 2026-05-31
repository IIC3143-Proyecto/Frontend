import type { NewPostDto, PostDto } from '@/lib/types/post';
import { BASE } from './base';

export const deletePost = async (postId: string): Promise<void> => {
  const res = await fetch(`${BASE}/post/${postId}`, { method: 'DELETE' });
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

// PATCH /api/post/:id/tags — backend #48 not ready; always succeeds (demo)
export async function patchPostTags(_postId: string, _tags: Record<string, string | string[]>, _accessToken: string): Promise<void> {
  return;
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
