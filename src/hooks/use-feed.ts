"use client";

import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/actions/auth";
import { getFeed, searchByTags } from "@/lib/api/post";
import type { PostDto } from "@/lib/types/post";

export function useFeed(quantity = 20, enabled = true) {
  return useQuery<PostDto[]>({
    queryKey: ["feed", quantity],
    queryFn: async () => {
      const token = await getAccessToken();
      return getFeed(token, quantity);
    },
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
