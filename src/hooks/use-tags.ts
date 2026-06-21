"use client";

import { useQuery } from '@tanstack/react-query';
import { fetchTags } from '@/lib/api/tag';
import { fetchPostTags } from '@/lib/api/post';
import { getAccessToken } from '@/actions/auth';
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

export function usePostTags(postId?: string) {
  return useQuery({
    queryKey: ["postTags", postId],
    enabled: !!postId,
    queryFn: async () => {
      const accessToken = await getAccessToken();
      return fetchPostTags(postId!, accessToken);
    },
  });
}
