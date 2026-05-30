import type { TagCategories, TagsByCategoryDto } from '@/lib/types/tag';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function fetchTags(): Promise<TagCategories> {
  const res = await fetch(`${BASE}/api/tag`);
  if (!res.ok) throw new Error(`fetchTags: HTTP ${res.status}`);
  const data = await res.json() as TagsByCategoryDto;
  return data.tags;
}
