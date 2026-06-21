import type { TagCategories, TagsByCategoryDto } from '@/lib/types/tag';
import { api } from './index';

export async function fetchTags(accessToken: string): Promise<TagCategories> {
  const res = await fetch(api.tags(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`fetchTags: HTTP ${res.status}`);
  const data = await res.json() as TagsByCategoryDto;
  return data.tags;
}

export async function patchUserTags(
  data: { tags: Record<string, string[]> },
  accessToken: string,
): Promise<void> {
  const res = await fetch(api.userTagsOnboarding(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error((json as { message?: string }).message ?? 'Error al guardar preferencias de estilo'),
      { status: res.status },
    );
  }
}
