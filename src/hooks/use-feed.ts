"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/actions/auth";
import { getFeed, searchByTags } from "@/lib/api/post";
import type { PostDto } from "@/lib/types/post";

const PAGE_SIZE = 20;

export function useFeed(enabled = true) {
  return useInfiniteQuery<PostDto[]>({
    queryKey: ["feed"],
    queryFn: async () => {
      const token = await getAccessToken();
      const posts = await getFeed(token, PAGE_SIZE);
      return posts;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    enabled,
  });
}

export function useSearchByTags(tags: string[]) {
  return useQuery<PostDto[]>({
    queryKey: ["search", tags],
    queryFn: async () => {
      const token = await getAccessToken();
      return searchByTags(tags, token);
    },
    enabled: tags.length > 0,
  });
}
