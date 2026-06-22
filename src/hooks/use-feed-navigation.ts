"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFeed } from "./use-feed";
import { usePostTags } from "./use-tags";
import { useCreateInteraction } from "./use-interaction";
import { usePostSaveState } from "./use-post-save-state";
import { getAccessToken } from "@/actions/auth";
import { removeInteraction } from "@/lib/api/user";
import type { PostDto } from "@/lib/types/post";

const PREFETCH_THRESHOLD = 5;

export type ProductPost = PostDto & { size: string };

type HistoryEntry = { post: PostDto; interaction: "Liked" | "Saved" | null };

export function useFeedNavigation() {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useFeed();
  const createInteraction = useCreateInteraction();

  const [queue, setQueue] = useState<PostDto[]>([]);
  const consumedPages = useRef(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  const historyRef = useRef<HistoryEntry[]>([]);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const pages = data?.pages ?? [];
    if (pages.length > consumedPages.current) {
      const freshPosts = pages.slice(consumedPages.current).flat();
      consumedPages.current = pages.length;
      setQueue((prev) => [...prev, ...freshPosts]);
    }
  }, [data]);

  useEffect(() => {
    if (queue.length <= PREFETCH_THRESHOLD && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [queue.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const currentPost = queue[0] ?? null;

  const { data: postTags } = usePostTags(currentPost?.id);
  const size = postTags?.["Talla"]?.[0] ?? "no especificada";

  const { isSaved, toggleSave, isSavePending } = usePostSaveState(currentPost?.id ?? null);

  const advance = useCallback((dir: 1 | -1) => {
    setDirection(dir);
    setQueue((prev) => prev.slice(1));
  }, []);

  const like = useCallback(() => {
    if (!currentPost) return;
    historyRef.current = [...historyRef.current, { post: currentPost, interaction: "Liked" }];
    setCanGoBack(true);
    createInteraction.mutate({ postId: currentPost.id, type: "Liked" });
    advance(1);
  }, [advance, currentPost, createInteraction]);

  const ignore = useCallback(() => {
    if (!currentPost) return;
    historyRef.current = [...historyRef.current, { post: currentPost, interaction: null }];
    setCanGoBack(true);
    advance(-1);
  }, [advance, currentPost]);

  const rewind = useCallback(() => {
    const h = historyRef.current;
    if (h.length === 0) return;
    const last = h[h.length - 1];
    historyRef.current = h.slice(0, -1);
    setCanGoBack(historyRef.current.length > 0);
    setQueue((prev) => [last.post, ...prev]);
    setDirection(-1);
    if (last.interaction) {
      getAccessToken().then((token) =>
        removeInteraction(last.post.id, last.interaction!, token)
      ).catch(() => {});
    }
  }, []);

  const isFinished = !currentPost && !isLoading && !isFetchingNextPage && !hasNextPage;

  const currentProduct: ProductPost | null = currentPost ? { ...currentPost, size } : null;

  return {
    currentPost: currentProduct,
    direction,
    isLoading: isLoading && queue.length === 0,
    isFinished,
    like,
    ignore,
    rewind,
    canGoBack,
    isSaved,
    toggleSave,
    isSavePending,
  };
}