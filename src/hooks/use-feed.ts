"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAccessToken } from "@/actions/auth";
import { getFeed, searchByTags } from "@/lib/api/post";
import type { PostDto } from "@/lib/types/post";

const BATCH_SIZE = 20;
const PREFETCH_THRESHOLD = 5;

export function usePaginatedFeed() {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const fetchMore = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);
    try {
      const token = await getAccessToken();
      const newPosts = await getFeed(token, BATCH_SIZE);
      setPosts((prev) => {
        const seenIds = new Set(prev.map((p) => p.id));
        return [...prev, ...newPosts.filter((p) => !seenIds.has(p.id))];
      });
    } finally {
      setIsFetching(false);
    }
  }, [isFetching]);

  useEffect(() => { fetchMore(); }, []);

  const prefetchIfNeeded = useCallback((currentIndex: number) => {
    if (posts.length > 0 && currentIndex >= posts.length - PREFETCH_THRESHOLD) {
      fetchMore();
    }
  }, [posts.length, fetchMore]);

  return { posts, isFetching, fetchMore, prefetchIfNeeded };
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
