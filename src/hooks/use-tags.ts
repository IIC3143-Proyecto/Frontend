"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchTags } from '@/lib/api/tag';
import type { TagCategories } from '@/lib/types/tag';

export const TAGS_QUERY_KEY = ['tags-categories'] as const;

export function useTags() {
  const { data, isLoading, error } = useQuery({
    queryKey: TAGS_QUERY_KEY,
    queryFn: fetchTags,
    staleTime: 1000 * 60 * 10,
  });

  return {
    categories: data ?? ({} as TagCategories),
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
