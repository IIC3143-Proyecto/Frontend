import type { TagCategories, TagsByCategoryDto } from '@/lib/types/tag';
import { BASE } from './base';

export async function fetchTags(): Promise<TagCategories> {
  const res = await fetch(`${BASE}/api/tag`);
  if (!res.ok) throw new Error(`fetchTags: HTTP ${res.status}`);
  const data = await res.json() as TagsByCategoryDto;
  return data.tags;
}
