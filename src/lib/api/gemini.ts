import type { TagDto } from '@/lib/types/tag';
import { api } from './index';

export async function fetchGeminiTags(images: File[], token: string): Promise<TagDto[]> {
  const fd = new FormData();
  images.forEach((img) => fd.append('images', img));
  const res = await fetch(api.geminiTags(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al analizar imágenes con Gemini'),
      { status: res.status },
    );
  }
  return res.json() as Promise<TagDto[]>;
}
